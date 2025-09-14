# Multi-stage Docker build for production deployment

# Backend Stage
FROM node:18-alpine AS backend
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY server/ ./server/
COPY database/ ./database/
EXPOSE 3001
CMD ["node", "server/simple-server.js"]

# Frontend Stage  
FROM node:18-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# Production Stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy backend
COPY --from=backend /app/node_modules ./node_modules
COPY --from=backend /app/server ./server
COPY --from=backend /app/package.json ./

# Copy frontend build
COPY --from=frontend /app/.next ./.next
COPY --from=frontend /app/public ./public
COPY --from=frontend /app/next.config.js ./
COPY --from=frontend /app/package.json ./package-frontend.json

# Install production dependencies
RUN npm ci --only=production

EXPOSE 3000 3001

# Start script for both services
COPY start-production.sh ./
RUN chmod +x start-production.sh
CMD ["./start-production.sh"]
