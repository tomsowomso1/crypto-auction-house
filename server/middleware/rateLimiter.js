const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000, // 1 minute
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for bidding
const bidLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 5, // Max 5 bids per second per IP
  message: {
    error: 'Too many bids, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate rate limiter for user operations
const userLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 20, // Max 20 user operations per minute
  message: {
    error: 'Too many user operations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for deposits/withdrawals
const transactionLimiter = rateLimit({
  windowMs: 300000, // 5 minutes
  max: 10, // Max 10 transactions per 5 minutes
  message: {
    error: 'Too many transaction requests, please wait before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  bidLimiter,
  userLimiter,
  transactionLimiter
};
