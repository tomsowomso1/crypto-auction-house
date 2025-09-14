const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// In-memory storage
let users = new Map();
let auctions = new Map();
let bids = new Map();
let auctionTimers = new Map();
let nextUserId = 1;
let nextAuctionId = 1;
let nextBidId = 1;

// Initialize sample data
const initializeSampleData = () => {
  // Sample auctions
  auctions.set(1, {
    id: 1,
    title: 'Rare Solana NFT Collection #001',
    description: 'Exclusive first edition NFT from the legendary Solana Punks collection. This unique piece features rare traits and has been verified on-chain.',
    starting_bid: '2.5000',
    current_bid: '2.5000',
    min_increment: '0.2500',
    currency: 'SOL',
    status: 'active',
    creator_id: 1,
    creator_username: 'CryptoCollector',
    winner_id: null,
    timer_seconds: 20,
    extension_seconds: 3,
    image_url: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400',
    created_at: new Date().toISOString(),
    bid_count: 0
  });

  auctions.set(2, {
    id: 2,
    title: 'Premium Gaming Avatar',
    description: 'Ultra-rare gaming avatar with special abilities and exclusive in-game benefits. Perfect for metaverse enthusiasts and gamers.',
    starting_bid: '1.8000',
    current_bid: '1.8000',
    min_increment: '0.1000',
    currency: 'SOL',
    status: 'active',
    creator_id: 1,
    creator_username: 'CryptoCollector',
    winner_id: null,
    timer_seconds: 20,
    extension_seconds: 3,
    image_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400',
    created_at: new Date().toISOString(),
    bid_count: 0
  });

  auctions.set(3, {
    id: 3,
    title: 'Digital Art Masterpiece',
    description: 'Hand-crafted digital artwork by renowned crypto artist. Features stunning visuals and comes with commercial usage rights.',
    starting_bid: '500.00',
    current_bid: '500.00',
    min_increment: '50.00',
    currency: 'USDT',
    status: 'active',
    creator_id: 1,
    creator_username: 'CryptoCollector',
    winner_id: null,
    timer_seconds: 20,
    extension_seconds: 3,
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    created_at: new Date().toISOString(),
    bid_count: 0
  });

  // Set initial timers
  Array.from(auctions.values()).forEach(auction => {
    if (auction.status === 'active') {
      auctionTimers.set(auction.id, {
        remaining: 20,
        lastUpdate: Date.now()
      });
    }
  });

  console.log('✅ Sample auctions initialized:', auctions.size);
  nextUserId = 2;
  nextAuctionId = 4;
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  socket.on('join-auction', (auctionId) => {
    socket.join(`auction-${auctionId}`);
    console.log(`🎯 User ${socket.id} joined auction ${auctionId}`);
    sendAuctionState(auctionId, socket);
  });

  socket.on('leave-auction', (auctionId) => {
    socket.leave(`auction-${auctionId}`);
    console.log(`👋 User ${socket.id} left auction ${auctionId}`);
  });

  socket.on('place-bid', async (data) => {
    try {
      await handleNewBid(data, socket);
    } catch (error) {
      console.error('❌ Error placing bid:', error);
      socket.emit('bid-error', { message: 'Failed to place bid' });
    }
  });

  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// Send auction state
function sendAuctionState(auctionId, socket = null) {
  const auction = auctions.get(parseInt(auctionId));
  if (!auction) return;

  const auctionBids = Array.from(bids.values())
    .filter(bid => bid.auction_id === parseInt(auctionId))
    .sort((a, b) => new Date(b.bid_time) - new Date(a.bid_time))
    .slice(0, 10);

  const timer = auctionTimers.get(parseInt(auctionId));
  const remainingTime = timer ? Math.max(0, timer.remaining) : 0;

  const auctionState = {
    auction,
    bids: auctionBids,
    participantCount: Math.floor(Math.random() * 15) + 5,
    remainingTime
  };

  if (socket) {
    socket.emit('auction-state', auctionState);
  } else {
    io.to(`auction-${auctionId}`).emit('auction-state', auctionState);
  }
}

// Handle new bid
async function handleNewBid(data, socket) {
  const { auctionId, userId, amount, walletAddress } = data;
  
  const auction = auctions.get(parseInt(auctionId));
  if (!auction || auction.status !== 'active') {
    socket.emit('bid-error', { message: 'Auction not found or not active' });
    return;
  }

  const minBid = parseFloat(auction.current_bid) + parseFloat(auction.min_increment);
  if (parseFloat(amount) < minBid) {
    socket.emit('bid-error', { 
      message: `Minimum bid is ${minBid.toFixed(auction.currency === 'SOL' ? 4 : 2)} ${auction.currency}` 
    });
    return;
  }

  // Get or create user
  let user = users.get(walletAddress);
  if (!user) {
    user = {
      id: nextUserId++,
      wallet_address: walletAddress,
      username: `User_${walletAddress.slice(0, 8)}`,
      sol_balance: '10.0000',
      usdt_balance: '5000.00',
      total_bids: 0,
      total_won: 0,
      created_at: new Date().toISOString()
    };
    users.set(walletAddress, user);
  }

  // Check balance
  const balanceField = auction.currency.toLowerCase() + '_balance';
  if (parseFloat(user[balanceField]) < parseFloat(amount)) {
    socket.emit('bid-error', { message: 'Insufficient balance' });
    return;
  }

  // Create new bid
  const newBid = {
    id: nextBidId++,
    auction_id: parseInt(auctionId),
    user_id: user.id,
    amount,
    currency: auction.currency,
    username: user.username,
    wallet_address: walletAddress,
    bid_time: new Date().toISOString(),
    is_winning: true
  };

  // Mark previous bids as not winning
  Array.from(bids.values()).forEach(bid => {
    if (bid.auction_id === parseInt(auctionId)) {
      bid.is_winning = false;
    }
  });

  bids.set(newBid.id, newBid);

  // Update auction
  auction.current_bid = amount;
  auction.winner_id = user.id;
  auction.bid_count = (auction.bid_count || 0) + 1;

  // Reset/extend timer
  const timer = auctionTimers.get(parseInt(auctionId));
  if (timer) {
    if (timer.remaining <= auction.extension_seconds) {
      timer.remaining = auction.extension_seconds;
    }
    timer.lastUpdate = Date.now();
  }

  console.log(`🎯 New bid: ${amount} ${auction.currency} by ${user.username} on auction ${auctionId}`);

  // Broadcast bid update
  io.to(`auction-${auctionId}`).emit('new-bid', {
    auctionId,
    amount,
    userId: user.id,
    username: user.username,
    walletAddress,
    timestamp: newBid.bid_time
  });

  sendAuctionState(auctionId);
  socket.emit('bid-success', { message: 'Bid placed successfully' });
}

// Timer management
setInterval(() => {
  const now = Date.now();
  
  auctionTimers.forEach((timer, auctionId) => {
    const elapsed = Math.floor((now - timer.lastUpdate) / 1000);
    timer.remaining = Math.max(0, timer.remaining - elapsed);
    timer.lastUpdate = now;

    if (timer.remaining === 0) {
      const auction = auctions.get(auctionId);
      if (auction && auction.status === 'active') {
        auction.status = 'ended';
        auction.end_time = new Date().toISOString();
        auctionTimers.delete(auctionId);
        
        io.to(`auction-${auctionId}`).emit('auction-ended', { auctionId });
        sendAuctionState(auctionId);
        
        console.log(`⏰ Auction ${auctionId} ended`);
        
        // Restart auction after 5 seconds
        setTimeout(() => {
          auction.status = 'active';
          auction.current_bid = auction.starting_bid;
          auction.winner_id = null;
          auction.bid_count = 0;
          delete auction.end_time;
          
          // Clear old bids
          Array.from(bids.entries()).forEach(([bidId, bid]) => {
            if (bid.auction_id === auctionId) {
              bids.delete(bidId);
            }
          });
          
          // Restart timer
          auctionTimers.set(auctionId, {
            remaining: 20,
            lastUpdate: Date.now()
          });
          
          console.log(`🔄 Auction ${auctionId} restarted`);
          sendAuctionState(auctionId);
        }, 5000);
      }
    } else {
      sendAuctionState(auctionId);
    }
  });
}, 1000);

// API Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Crypto Auction House API',
    status: 'running',
    auctions: auctions.size,
    activeUsers: users.size
  });
});

app.get('/api/auctions', (req, res) => {
  const auctionList = Array.from(auctions.values())
    .filter(auction => auction.status === 'active' || auction.status === 'pending')
    .map(auction => ({
      ...auction,
      creator_username: auction.creator_username || 'Anonymous'
    }));
  
  res.json(auctionList);
});

app.get('/api/auctions/:id', (req, res) => {
  const auction = auctions.get(parseInt(req.params.id));
  if (!auction) {
    return res.status(404).json({ error: 'Auction not found' });
  }
  
  res.json({
    ...auction,
    creator_username: auction.creator_username || 'Anonymous',
    creator_wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
  });
});

app.post('/api/users', (req, res) => {
  const { walletAddress, username } = req.body;
  
  let user = users.get(walletAddress);
  if (!user) {
    user = {
      id: nextUserId++,
      wallet_address: walletAddress,
      username: username || `User_${walletAddress.slice(0, 8)}`,
      sol_balance: '10.0000',
      usdt_balance: '5000.00',
      total_bids: 0,
      total_won: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    users.set(walletAddress, user);
  }
  
  res.json(user);
});

app.get('/api/users/:walletAddress', (req, res) => {
  const user = users.get(req.params.walletAddress);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

// Initialize data
initializeSampleData();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Crypto Auction House API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Real-time bidding ready with ${auctions.size} auctions`);
  console.log(`💰 Demo mode: Users get 10 SOL + 5000 USDT for testing`);
});
