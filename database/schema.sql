-- Database schema for crypto auction house

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(44) UNIQUE NOT NULL,
    username VARCHAR(50),
    sol_balance DECIMAL(20, 9) DEFAULT 0,
    usdt_balance DECIMAL(20, 6) DEFAULT 0,
    total_bids INTEGER DEFAULT 0,
    total_won INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auctions table
CREATE TABLE auctions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    starting_bid DECIMAL(20, 6) NOT NULL,
    current_bid DECIMAL(20, 6) DEFAULT 0,
    min_increment DECIMAL(20, 6) NOT NULL,
    currency VARCHAR(10) NOT NULL CHECK (currency IN ('SOL', 'USDT')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended', 'cancelled')),
    winner_id INTEGER REFERENCES users(id),
    creator_id INTEGER REFERENCES users(id) NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    timer_seconds INTEGER DEFAULT 20,
    extension_seconds INTEGER DEFAULT 3,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bids table
CREATE TABLE bids (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER REFERENCES auctions(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    amount DECIMAL(20, 6) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_winning BOOLEAN DEFAULT false
);

-- Deposits table
CREATE TABLE deposits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    transaction_hash VARCHAR(88) UNIQUE NOT NULL,
    amount DECIMAL(20, 9) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);

-- Withdrawals table
CREATE TABLE withdrawals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    amount DECIMAL(20, 9) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    to_address VARCHAR(44) NOT NULL,
    transaction_hash VARCHAR(88),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_end_time ON auctions(end_time);
CREATE INDEX idx_bids_auction_id ON bids(auction_id);
CREATE INDEX idx_bids_user_id ON bids(user_id);
CREATE INDEX idx_bids_bid_time ON bids(bid_time);
CREATE INDEX idx_deposits_user_id ON deposits(user_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
