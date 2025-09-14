-- Sample data for crypto auction house

-- Insert sample users
INSERT INTO users (wallet_address, username, sol_balance, usdt_balance, total_bids, total_won) VALUES
('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 'CryptoCollector', 5.2500, 1250.00, 15, 3),
('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 'NFTHunter', 12.7800, 2800.50, 28, 7),
('4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi', 'SolanaWhale', 45.3200, 8900.25, 42, 12),
('2AuLM4zSJJUzKQBm8hnBPqNzFpGWP9TKB5Z8cNrKpump', 'AuctionMaster', 8.9100, 3400.75, 33, 9),
('6FHa3pFwD5L3QGx6GVAKLTYKSCXTU9Rb9oVmqiHn25AE', 'BidWarrior', 15.6700, 4200.00, 51, 15);

-- Insert sample auctions
INSERT INTO auctions (title, description, starting_bid, current_bid, min_increment, currency, status, creator_id, start_time, end_time, image_url) VALUES
('Rare Solana NFT Collection #001', 'Exclusive first edition NFT from the legendary Solana Punks collection. This unique piece features rare traits and has been verified on-chain.', 2.5000, 4.7500, 0.2500, 'SOL', 'active', 1, NOW() - INTERVAL '10 minutes', NULL, 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400'),
('Premium Gaming Avatar', 'Ultra-rare gaming avatar with special abilities and exclusive in-game benefits. Perfect for metaverse enthusiasts and gamers.', 1.8000, 3.2000, 0.1000, 'SOL', 'active', 2, NOW() - INTERVAL '5 minutes', NULL, 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400'),
('Digital Art Masterpiece', 'Hand-crafted digital artwork by renowned crypto artist. Features stunning visuals and comes with commercial usage rights.', 500.00, 850.00, 50.00, 'USDT', 'active', 3, NOW() - INTERVAL '15 minutes', NULL, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'),
('Vintage Crypto Collectible', 'One of the first crypto collectibles ever minted on Solana. Historical significance and proven rarity make this a must-have.', 5.0000, 0, 0.5000, 'SOL', 'pending', 4, NOW() + INTERVAL '1 hour', NULL, 'https://images.unsplash.com/photo-1640161704729-cbe966a08476?w=400'),
('Exclusive Music NFT', 'Limited edition music NFT with unlockable content including high-quality audio files and exclusive behind-the-scenes footage.', 3.2000, 5.8000, 0.3000, 'SOL', 'active', 5, NOW() - INTERVAL '8 minutes', NULL, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'),
('Legendary Weapon Skin', 'Rare weapon skin for popular blockchain game. Provides stat bonuses and unique visual effects. Tradeable on all major marketplaces.', 750.00, 0, 25.00, 'USDT', 'pending', 1, NOW() + INTERVAL '30 minutes', NULL, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400');

-- Insert sample bids for active auctions
INSERT INTO bids (auction_id, user_id, amount, currency, bid_time, is_winning) VALUES
-- Auction 1 bids
(1, 2, 2.5000, 'SOL', NOW() - INTERVAL '9 minutes', false),
(1, 3, 3.0000, 'SOL', NOW() - INTERVAL '7 minutes', false),
(1, 4, 3.5000, 'SOL', NOW() - INTERVAL '5 minutes', false),
(1, 5, 4.0000, 'SOL', NOW() - INTERVAL '3 minutes', false),
(1, 2, 4.7500, 'SOL', NOW() - INTERVAL '1 minute', true),

-- Auction 2 bids
(2, 1, 1.8000, 'SOL', NOW() - INTERVAL '4 minutes', false),
(2, 4, 2.2000, 'SOL', NOW() - INTERVAL '3 minutes', false),
(2, 3, 2.8000, 'SOL', NOW() - INTERVAL '2 minutes', false),
(2, 5, 3.2000, 'SOL', NOW() - INTERVAL '30 seconds', true),

-- Auction 3 bids
(3, 1, 500.00, 'USDT', NOW() - INTERVAL '12 minutes', false),
(3, 2, 600.00, 'USDT', NOW() - INTERVAL '10 minutes', false),
(3, 4, 700.00, 'USDT', NOW() - INTERVAL '8 minutes', false),
(3, 5, 750.00, 'USDT', NOW() - INTERVAL '6 minutes', false),
(3, 1, 800.00, 'USDT', NOW() - INTERVAL '4 minutes', false),
(3, 3, 850.00, 'USDT', NOW() - INTERVAL '2 minutes', true),

-- Auction 5 bids
(5, 1, 3.2000, 'SOL', NOW() - INTERVAL '7 minutes', false),
(5, 3, 3.8000, 'SOL', NOW() - INTERVAL '5 minutes', false),
(5, 4, 4.5000, 'SOL', NOW() - INTERVAL '4 minutes', false),
(5, 2, 5.2000, 'SOL', NOW() - INTERVAL '3 minutes', false),
(5, 5, 5.8000, 'SOL', NOW() - INTERVAL '1 minute', true);

-- Insert sample deposits
INSERT INTO deposits (user_id, transaction_hash, amount, currency, status, created_at, confirmed_at) VALUES
(1, '5vAAwP5JzYrBBJkgcXVwKKKkJhL6qT8ZKkLDfmRKpE8wYhVGkXgFnF4nKLqJgKpE8wY', 10.0000, 'SOL', 'confirmed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(2, '3hBBwQ6KzYrCCJkgdYWwLLLkJhM7rU9aLkMEgnSLqF9xZiWHlYhGnG5oLMrKhLqF9x', 20.0000, 'SOL', 'confirmed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(3, '2gAAcR7LzYrDDJkgeZXxMMNkJhN8sV0bMkNFhoTMrG0yAjXImZiHoH6pMNsLiMrG0y', 50.0000, 'SOL', 'confirmed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(4, '4iCCdS8MzYrEEJkgfAYyNNOkJhO9tW1cNkOGipUNsH1zBkYJnAjIpI7qNOtMjNsH1z', 15.0000, 'SOL', 'confirmed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(5, '6kEEeT9NzYrFFJkghBZzOOPkJhP0uX2dOkPHjqVOtI2ACkZKoBkJqJ8rOPuNkOtI2A', 25.0000, 'SOL', 'confirmed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- Update auction current_bid and winner_id to match the winning bids
UPDATE auctions SET current_bid = 4.7500, winner_id = 2 WHERE id = 1;
UPDATE auctions SET current_bid = 3.2000, winner_id = 5 WHERE id = 2;
UPDATE auctions SET current_bid = 850.00, winner_id = 3 WHERE id = 3;
UPDATE auctions SET current_bid = 5.8000, winner_id = 5 WHERE id = 5;
