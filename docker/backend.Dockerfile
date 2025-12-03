# Backend Dockerfile - Node.js Express API
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package.json backend/package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY backend/src ./src

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

USER expressjs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

# Disable SSL certificate verification for RSS feeds
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

CMD ["node", "src/server.js"]

