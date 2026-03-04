# Production Dockerfile for AWS App Runner
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm ci --only=production
RUN npm run build

# Build backend
WORKDIR /app/backend
RUN npm ci
RUN npm run build

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

# Start server (compiled JS from dist folder)
CMD ["node", "dist/server.js"]
