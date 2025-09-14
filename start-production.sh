#!/bin/bash

# Production startup script
echo "🚀 Starting Crypto Auction House in production mode..."

# Start backend server
echo "📡 Starting backend server..."
node server/simple-server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend server
echo "🌐 Starting frontend server..."
npm start &
FRONTEND_PID=$!

echo "✅ Both servers started successfully!"
echo "📊 Backend PID: $BACKEND_PID"
echo "🌐 Frontend PID: $FRONTEND_PID"

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
