# Simple backend-only Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package-simple.json ./package.json

# Install only backend dependencies
RUN npm install --only=production

# Copy server files
COPY server/standalone-server.js ./server/

# Create public directory
RUN mkdir -p public

EXPOSE 3001

# Start the server
CMD ["npm", "start"]
