# Crypto Auction House

A real-time cryptocurrency auction platform built with Next.js and Solana, featuring instant bidding, WebSocket updates, and secure wallet integration.

## Features

### 🚀 Core Functionality
- **Real-time Auctions**: Live bidding with WebSocket connections
- **Solana Integration**: Connect Phantom, Solflare, and other Solana wallets
- **Instant Credits**: Deposit SOL/USDT for immediate bidding without blockchain delays
- **Smart Timer**: 20-second countdown that extends by 3 seconds on new bids
- **Secure Bidding**: Rate limiting, input validation, and signature verification

### 💎 User Experience
- **Lightning Fast**: Sub-100ms bid updates across all connected users
- **Mobile Responsive**: Optimized for all devices and screen sizes
- **Smooth Animations**: Framer Motion powered transitions and effects
- **Real-time Updates**: Live participant counts, bid history, and auction status
- **Intuitive Interface**: Clean design optimized for intense auction moments

### 🔧 Technical Stack
- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL for persistence, Redis for real-time state
- **Blockchain**: Solana Web3.js with wallet adapter support
- **Real-time**: WebSocket connections for instant updates

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Redis server
- Solana wallet (Phantom recommended)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd crypto-auction-house
   npm install
   ```

2. **Database setup**
   ```bash
   # Create PostgreSQL database
   createdb crypto_auction
   
   # Run schema
   psql -d crypto_auction -f database/schema.sql
   ```

3. **Environment configuration**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your database and Redis credentials
   ```

4. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev:all
   
   # Or start separately:
   npm run dev      # Frontend (port 3000)
   npm run server   # Backend (port 3001)
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` and connect your Solana wallet!

## Environment Variables

Copy `env.example` to `.env.local` and configure:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crypto_auction
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SERVER_URL=http://localhost:3001

# Replace with your platform wallet address
PLATFORM_WALLET_ADDRESS=YourActualWalletAddress
```

## Architecture

### Real-time Auction Engine
- **Timer Management**: Redis-based countdown timers with automatic extensions
- **Bid Processing**: Atomic database transactions with optimistic UI updates
- **State Synchronization**: WebSocket broadcasts keep all clients in sync
- **Participant Tracking**: Live user counts and bid history

### Wallet Integration
- **Multi-wallet Support**: Phantom, Solflare, Torus, Ledger, Sollet
- **Instant Credits**: Deposit funds for immediate bidding availability
- **Secure Transactions**: Proper signature verification and validation
- **Balance Management**: Real-time balance updates and withdrawal system

### Database Schema
- **Users**: Wallet addresses, balances, and bidding statistics
- **Auctions**: Auction details, timers, and current state
- **Bids**: Complete bid history with timestamps
- **Transactions**: Deposit and withdrawal tracking

## API Endpoints

### Auctions
- `GET /api/auctions` - List active auctions
- `GET /api/auctions/:id` - Get auction details

### Users
- `POST /api/users` - Create/get user account
- `GET /api/users/:walletAddress` - Get user profile

### WebSocket Events
- `join-auction` - Join auction room for real-time updates
- `place-bid` - Submit new bid
- `auction-state` - Receive auction updates
- `new-bid` - Real-time bid notifications

## Development

### Project Structure
```
├── app/                 # Next.js app directory
├── components/          # React components
├── hooks/              # Custom React hooks
├── server/             # Express server and Socket.io
├── database/           # SQL schema and migrations
├── lib/                # Utility functions
└── types/              # TypeScript definitions
```

### Key Components
- **AuctionGrid**: Main auction listing with live updates
- **AuctionDetail**: Individual auction page with bidding
- **BiddingPanel**: Real-time bid submission interface
- **AuctionTimer**: Countdown timer with extensions
- **WalletProvider**: Solana wallet connection management

### Development Tips
- Use `npm run dev:all` to run both frontend and backend
- Check browser console for WebSocket connection status
- Monitor Redis for real-time auction state
- Use PostgreSQL logs to debug database queries

## Production Deployment

### Security Considerations
- Replace default JWT secrets and platform wallet address
- Use environment variables for all sensitive configuration
- Enable HTTPS and secure WebSocket connections
- Implement proper rate limiting and input validation
- Set up monitoring for auction timer accuracy

### Scaling
- Use Redis Cluster for high availability
- Implement database connection pooling
- Consider CDN for static assets
- Monitor WebSocket connection limits
- Set up proper logging and error tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues:
- Check the GitHub issues
- Review the documentation
- Test with Solana devnet first
- Ensure proper wallet connection

---

Built with ❤️ for the Solana ecosystem
