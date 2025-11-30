
# Stage 1: Build
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Build both client (dist) and server (dist-server)
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Install only production dependencies
RUN npm ci --only=production

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

# Expose the port the app runs on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Start the server
CMD ["node", "dist-server/server/index.js"]
