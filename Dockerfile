# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY Backend/package*.json ./Backend/

# Install dependencies
RUN npm ci --only=production && \
    cd Backend && npm ci --only=production

# Copy source code
COPY . .

# Build frontend assets if needed
RUN npm run build:frontend

# Production stage
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    sqlite \
    curl \
    tini

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S techmap -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=techmap:nodejs /app ./

# Create necessary directories
RUN mkdir -p /var/lib/techmap /var/log/techmap /var/backups/techmap && \
    chown -R techmap:nodejs /var/lib/techmap /var/log/techmap /var/backups/techmap

# Switch to non-root user
USER techmap

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start application
CMD ["node", "Backend/app.js"]