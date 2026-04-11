FROM node:20-alpine

# Install build tools for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first (Docker layer caching)
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Remove build tools to reduce image size
RUN apk del python3 make g++

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p public/uploads/prescriptions

# Expose port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "server.js"]
