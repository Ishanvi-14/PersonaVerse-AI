# Production Dockerfile for AWS App Runner
FROM node:20-alpine AS builder

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Build backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy backend
COPY --from=builder /app/backend ./
# Copy frontend build
COPY --from=builder /app/frontend/dist ./public

# Install production dependencies only
RUN npm ci --only=production

# Expose App Runner port
EXPOSE 8080

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Start server
CMD ["node", "server.js"]
