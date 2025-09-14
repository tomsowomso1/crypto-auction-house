const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Pool } = require('pg');
const Redis = require('ioredis');

// Import middleware
const { 
  securityHeaders, 
  corsOptions, 
  sanitizeInput, 
  requestSizeLimit, 
  requestLogger, 
  errorHandler,
  socketSecurity 
} = require('./middleware/security');
const { 
  apiLimiter, 
  bidLimiter, 
  userLimiter, 
  transactionLimiter 
} = require('./middleware/rateLimiter');
const {
  validateUserCreation,
  validateBidPlacement,
  validateAuctionId,
  validateWalletAddress
} = require('./middleware/validation');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Security middleware
app.use(securityHeaders);
app.use(corsOptions);
app.use(requestLogger);
app.use(requestSizeLimit);
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeInput);
app.use(apiLimiter);

// Database connections
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'crypto_auction',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

// Store active auctions and their timers
const activeAuctions = new Map();
const auctionTimers = new Map();

// Socket.io security
io.use(socketSecurity);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join auction room
  socket.on('join-auction', (auctionId) => {
    socket.join(`auction-${auctionId}`);
    console.log(`User ${socket.id} joined auction ${auctionId}`);
    
    // Send current auction state
    sendAuctionState(auctionId, socket);
  });

  // Leave auction room
  socket.on('leave-auction', (auctionId) => {
    socket.leave(`auction-${auctionId}`);
    console.log(`User ${socket.id} left auction ${auctionId}`);
  });

  // Handle new bid
  socket.on('place-bid', async (data) => {
    try {
      await handleNewBid(data, socket);
    } catch (error) {
      console.error('Error placing bid:', error);
      socket.emit('bid-error', { message: 'Failed to place bid' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Send current auction state to client
async function sendAuctionState(auctionId, socket = null) {
  try {
    const auctionQuery = `
      SELECT a.*, u.username as winner_username, u.wallet_address as winner_wallet
      FROM auctions a
      LEFT JOIN users u ON a.winner_id = u.id
      WHERE a.id = $1
    `;
    const auctionResult = await pool.query(auctionQuery, [auctionId]);
    
    if (auctionResult.rows.length === 0) return;
    
    const auction = auctionResult.rows[0];
    
    // Get recent bids
    const bidsQuery = `
      SELECT b.*, u.username, u.wallet_address
      FROM bids b
      JOIN users u ON b.user_id = u.id
      WHERE b.auction_id = $1
      ORDER BY b.bid_time DESC
      LIMIT 10
    `;
    const bidsResult = await pool.query(bidsQuery, [auctionId]);
    
    // Get participant count
    const participantCount = await redis.scard(`auction:${auctionId}:participants`);
    
    // Get remaining time
    const remainingTime = await redis.ttl(`auction:${auctionId}:timer`);
    
    const auctionState = {
      auction,
      bids: bidsResult.rows,
      participantCount: participantCount || 0,
      remainingTime: remainingTime > 0 ? remainingTime : 0
    };
    
    if (socket) {
      socket.emit('auction-state', auctionState);
    } else {
      io.to(`auction-${auctionId}`).emit('auction-state', auctionState);
    }
  } catch (error) {
    console.error('Error sending auction state:', error);
  }
}

// Handle new bid placement
async function handleNewBid(data, socket) {
  const { auctionId, userId, amount, walletAddress } = data;
  
  // Validate auction exists and is active
  const auctionQuery = 'SELECT * FROM auctions WHERE id = $1 AND status = $2';
  const auctionResult = await pool.query(auctionQuery, [auctionId, 'active']);
  
  if (auctionResult.rows.length === 0) {
    socket.emit('bid-error', { message: 'Auction not found or not active' });
    return;
  }
  
  const auction = auctionResult.rows[0];
  
  // Validate bid amount
  const minBid = parseFloat(auction.current_bid) + parseFloat(auction.min_increment);
  if (parseFloat(amount) < minBid) {
    socket.emit('bid-error', { 
      message: `Minimum bid is ${minBid} ${auction.currency}` 
    });
    return;
  }
  
  // Check user balance
  const userQuery = 'SELECT * FROM users WHERE wallet_address = $1';
  const userResult = await pool.query(userQuery, [walletAddress]);
  
  if (userResult.rows.length === 0) {
    socket.emit('bid-error', { message: 'User not found' });
    return;
  }
  
  const user = userResult.rows[0];
  const balanceField = auction.currency.toLowerCase() + '_balance';
  
  if (parseFloat(user[balanceField]) < parseFloat(amount)) {
    socket.emit('bid-error', { message: 'Insufficient balance' });
    return;
  }
  
  // Start database transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Update auction with new bid
    await client.query(
      'UPDATE auctions SET current_bid = $1, winner_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [amount, user.id, auctionId]
    );
    
    // Insert new bid
    await client.query(
      'INSERT INTO bids (auction_id, user_id, amount, currency) VALUES ($1, $2, $3, $4)',
      [auctionId, user.id, amount, auction.currency]
    );
    
    // Update previous bids to not winning
    await client.query(
      'UPDATE bids SET is_winning = false WHERE auction_id = $1',
      [auctionId]
    );
    
    // Set current bid as winning
    await client.query(
      'UPDATE bids SET is_winning = true WHERE auction_id = $1 AND user_id = $2 AND amount = $3',
      [auctionId, user.id, amount]
    );
    
    await client.query('COMMIT');
    
    // Add user to participants
    await redis.sadd(`auction:${auctionId}:participants`, user.id);
    
    // Reset/extend timer
    const timerKey = `auction:${auctionId}:timer`;
    const currentTtl = await redis.ttl(timerKey);
    
    if (currentTtl > 0 && currentTtl <= auction.extension_seconds) {
      // Extend timer
      await redis.expire(timerKey, auction.extension_seconds);
    } else if (currentTtl <= 0) {
      // Start new timer
      await redis.setex(timerKey, auction.timer_seconds, 'active');
    }
    
    // Broadcast bid update
    io.to(`auction-${auctionId}`).emit('new-bid', {
      auctionId,
      amount,
      userId: user.id,
      username: user.username,
      walletAddress: user.wallet_address,
      timestamp: new Date().toISOString()
    });
    
    // Send updated auction state
    await sendAuctionState(auctionId);
    
    socket.emit('bid-success', { message: 'Bid placed successfully' });
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Monitor auction timers
async function monitorAuctionTimers() {
  try {
    const activeAuctionsQuery = 'SELECT id FROM auctions WHERE status = $1';
    const result = await pool.query(activeAuctionsQuery, ['active']);
    
    for (const auction of result.rows) {
      const timerKey = `auction:${auction.id}:timer`;
      const ttl = await redis.ttl(timerKey);
      
      if (ttl === 0) {
        // Timer expired, end auction
        await endAuction(auction.id);
      }
    }
  } catch (error) {
    console.error('Error monitoring auction timers:', error);
  }
}

// End auction
async function endAuction(auctionId) {
  try {
    console.log(`Ending auction ${auctionId}`);
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update auction status
      await client.query(
        'UPDATE auctions SET status = $1, end_time = CURRENT_TIMESTAMP WHERE id = $2',
        ['ended', auctionId]
      );
      
      await client.query('COMMIT');
      
      // Clean up Redis keys
      await redis.del(`auction:${auctionId}:timer`);
      await redis.del(`auction:${auctionId}:participants`);
      
      // Notify clients
      io.to(`auction-${auctionId}`).emit('auction-ended', { auctionId });
      await sendAuctionState(auctionId);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error ending auction:', error);
  }
}

// API Routes
app.get('/api/auctions', async (req, res) => {
  try {
    const query = `
      SELECT a.*, u.username as creator_username,
             COUNT(b.id) as bid_count
      FROM auctions a
      LEFT JOIN users u ON a.creator_id = u.id
      LEFT JOIN bids b ON a.id = b.auction_id
      WHERE a.status IN ('active', 'pending')
      GROUP BY a.id, u.username
      ORDER BY a.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auctions/:id', validateAuctionId, async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT a.*, u.username as creator_username, u.wallet_address as creator_wallet,
             w.username as winner_username, w.wallet_address as winner_wallet
      FROM auctions a
      LEFT JOIN users u ON a.creator_id = u.id
      LEFT JOIN users w ON a.winner_id = w.id
      WHERE a.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users', userLimiter, validateUserCreation, async (req, res) => {
  try {
    const { walletAddress, username } = req.body;
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE wallet_address = $1',
      [walletAddress]
    );
    
    if (existingUser.rows.length > 0) {
      return res.json(existingUser.rows[0]);
    }
    
    // Create new user
    const result = await pool.query(
      'INSERT INTO users (wallet_address, username) VALUES ($1, $2) RETURNING *',
      [walletAddress, username]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/:walletAddress', validateWalletAddress, async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const result = await pool.query(
      'SELECT * FROM users WHERE wallet_address = $1',
      [walletAddress]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start timer monitoring
setInterval(monitorAuctionTimers, 1000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Crypto Auction House server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security middleware enabled`);
  console.log(`⚡ Real-time bidding ready`);
});
