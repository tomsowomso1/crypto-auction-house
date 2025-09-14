const { body, param, validationResult } = require('express-validator');

// Validation middleware to check for errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Solana wallet address validation
const isValidSolanaAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
};

// Validation rules for user creation
const validateUserCreation = [
  body('walletAddress')
    .custom((value) => {
      if (!isValidSolanaAddress(value)) {
        throw new Error('Invalid Solana wallet address');
      }
      return true;
    }),
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens'),
  handleValidationErrors
];

// Validation rules for bid placement
const validateBidPlacement = [
  body('auctionId')
    .isInt({ min: 1 })
    .withMessage('Invalid auction ID'),
  body('userId')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID'),
  body('amount')
    .isFloat({ min: 0.0001 })
    .withMessage('Bid amount must be at least 0.0001'),
  body('walletAddress')
    .custom((value) => {
      if (!isValidSolanaAddress(value)) {
        throw new Error('Invalid Solana wallet address');
      }
      return true;
    }),
  handleValidationErrors
];

// Validation rules for auction creation
const validateAuctionCreation = [
  body('title')
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be 5-255 characters'),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be 10-1000 characters'),
  body('startingBid')
    .isFloat({ min: 0.0001 })
    .withMessage('Starting bid must be at least 0.0001'),
  body('minIncrement')
    .isFloat({ min: 0.0001 })
    .withMessage('Minimum increment must be at least 0.0001'),
  body('currency')
    .isIn(['SOL', 'USDT'])
    .withMessage('Currency must be SOL or USDT'),
  body('timerSeconds')
    .optional()
    .isInt({ min: 10, max: 300 })
    .withMessage('Timer must be between 10 and 300 seconds'),
  body('extensionSeconds')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Extension must be between 1 and 30 seconds'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Invalid image URL'),
  handleValidationErrors
];

// Validation rules for withdrawal requests
const validateWithdrawal = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID'),
  body('amount')
    .isFloat({ min: 0.001 })
    .withMessage('Withdrawal amount must be at least 0.001'),
  body('currency')
    .isIn(['SOL', 'USDT'])
    .withMessage('Currency must be SOL or USDT'),
  body('toAddress')
    .custom((value) => {
      if (!isValidSolanaAddress(value)) {
        throw new Error('Invalid destination Solana address');
      }
      return true;
    }),
  handleValidationErrors
];

// Validation for auction ID parameter
const validateAuctionId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid auction ID'),
  handleValidationErrors
];

// Validation for wallet address parameter
const validateWalletAddress = [
  param('walletAddress')
    .custom((value) => {
      if (!isValidSolanaAddress(value)) {
        throw new Error('Invalid Solana wallet address');
      }
      return true;
    }),
  handleValidationErrors
];

// Sanitize HTML content to prevent XSS
const sanitizeHtml = (text) => {
  if (!text) return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Custom validation for amounts based on currency
const validateCurrencyAmount = (currency, amount) => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return false;
  }
  
  if (currency === 'SOL') {
    // SOL should have max 9 decimal places
    return /^\d+(\.\d{1,9})?$/.test(amount.toString());
  } else if (currency === 'USDT') {
    // USDT should have max 6 decimal places
    return /^\d+(\.\d{1,6})?$/.test(amount.toString());
  }
  
  return false;
};

module.exports = {
  handleValidationErrors,
  validateUserCreation,
  validateBidPlacement,
  validateAuctionCreation,
  validateWithdrawal,
  validateAuctionId,
  validateWalletAddress,
  sanitizeHtml,
  validateCurrencyAmount,
  isValidSolanaAddress
};
