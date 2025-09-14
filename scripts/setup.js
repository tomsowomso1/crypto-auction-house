#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Crypto Auction House...\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.error('❌ Node.js 18 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}
console.log('✅ Node.js version check passed');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'database/schema.sql',
  'env.example'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Required file missing: ${file}`);
    process.exit(1);
  }
}
console.log('✅ Required files check passed');

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create .env.local if it doesn't exist
const envPath = '.env.local';
const envExamplePath = 'env.example';

if (!fs.existsSync(envPath)) {
  console.log('\n🔧 Creating environment configuration...');
  try {
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ Created .env.local from template');
    console.log('⚠️  Please update .env.local with your actual database credentials');
  } catch (error) {
    console.error('❌ Failed to create .env.local:', error.message);
  }
} else {
  console.log('✅ .env.local already exists');
}

// Check for PostgreSQL
console.log('\n🗄️  Checking database requirements...');
try {
  execSync('psql --version', { stdio: 'pipe' });
  console.log('✅ PostgreSQL is available');
  console.log('📝 To set up the database, run:');
  console.log('   createdb crypto_auction');
  console.log('   psql -d crypto_auction -f database/schema.sql');
  console.log('   psql -d crypto_auction -f database/sample-data.sql  # Optional: Load sample data');
} catch (error) {
  console.log('⚠️  PostgreSQL not found in PATH');
  console.log('   Please install PostgreSQL and ensure it\'s in your PATH');
  console.log('   Visit: https://www.postgresql.org/download/');
}

// Check for Redis
console.log('\n🔴 Checking Redis requirements...');
try {
  execSync('redis-cli --version', { stdio: 'pipe' });
  console.log('✅ Redis is available');
  console.log('📝 To start Redis, run: redis-server');
} catch (error) {
  console.log('⚠️  Redis not found in PATH');
  console.log('   Please install Redis and ensure it\'s in your PATH');
  console.log('   Visit: https://redis.io/download');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update .env.local with your database and Redis credentials');
console.log('2. Start PostgreSQL and Redis servers');
console.log('3. Create and set up the database:');
console.log('   createdb crypto_auction');
console.log('   psql -d crypto_auction -f database/schema.sql');
console.log('4. Start the development servers:');
console.log('   npm run dev:all');
console.log('5. Open http://localhost:3000 in your browser');
console.log('6. Connect your Solana wallet (Phantom recommended)');

console.log('\n🔗 Useful commands:');
console.log('   npm run dev      - Start frontend only (port 3000)');
console.log('   npm run server   - Start backend only (port 3001)');
console.log('   npm run dev:all  - Start both frontend and backend');
console.log('   npm run build    - Build for production');

console.log('\n💡 Tips:');
console.log('   - Use Solana devnet for development');
console.log('   - Install Phantom wallet extension for testing');
console.log('   - Check browser console for WebSocket connection status');
console.log('   - Monitor server logs for real-time auction activity');

console.log('\n🆘 Need help?');
console.log('   - Check README.md for detailed documentation');
console.log('   - Ensure all services are running (PostgreSQL, Redis)');
console.log('   - Verify environment variables in .env.local');

console.log('\n✨ Happy bidding! ✨\n');
