const helmet = require('helmet');
const cors = require('cors');

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "https:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Replace with your production domain
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Recursively sanitize all string inputs
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    } else if (Array.isArray(obj)) {
      return obj.map(sanitize);
    } else if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

// Request size limiter
const requestSizeLimit = (req, res, next) => {
  const contentLength = req.get('Content-Length');
  const maxSize = 1024 * 1024; // 1MB limit
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      error: 'Request entity too large',
      maxSize: '1MB'
    });
  }
  
  next();
};

// IP whitelist middleware (for admin operations)
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      return next(); // No IP restriction if no IPs specified
    }
    
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    
    if (!allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        error: 'Access denied from this IP address'
      });
    }
    
    next();
  };
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    console.log(`${new Date().toISOString()} ${method} ${url} ${statusCode} ${duration}ms ${ip}`);
    
    // Log suspicious activity
    if (statusCode === 429) {
      console.warn(`Rate limit exceeded: ${ip} ${method} ${url}`);
    } else if (statusCode >= 400 && statusCode < 500) {
      console.warn(`Client error: ${ip} ${method} ${url} ${statusCode}`);
    } else if (statusCode >= 500) {
      console.error(`Server error: ${ip} ${method} ${url} ${statusCode}`);
    }
  });
  
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request entity too large'
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: isDevelopment ? err.message : 'Invalid input data'
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }
  
  // Generic server error
  res.status(500).json({
    error: 'Internal server error',
    details: isDevelopment ? err.message : 'Something went wrong'
  });
};

// Socket.io security middleware
const socketSecurity = (socket, next) => {
  // Rate limiting for socket connections
  const connections = new Map();
  const maxConnectionsPerIP = 10;
  const windowMs = 60000; // 1 minute
  
  const ip = socket.handshake.address;
  const now = Date.now();
  
  if (!connections.has(ip)) {
    connections.set(ip, []);
  }
  
  const ipConnections = connections.get(ip);
  
  // Remove old connections outside the window
  while (ipConnections.length > 0 && now - ipConnections[0] > windowMs) {
    ipConnections.shift();
  }
  
  if (ipConnections.length >= maxConnectionsPerIP) {
    return next(new Error('Too many connections from this IP'));
  }
  
  ipConnections.push(now);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance
    for (const [key, value] of connections.entries()) {
      if (value.length === 0 || now - value[value.length - 1] > windowMs * 2) {
        connections.delete(key);
      }
    }
  }
  
  next();
};

module.exports = {
  securityHeaders,
  corsOptions: cors(corsOptions),
  sanitizeInput,
  requestSizeLimit,
  ipWhitelist,
  requestLogger,
  errorHandler,
  socketSecurity
};
