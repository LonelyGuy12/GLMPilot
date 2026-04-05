# Stage 1: Build the application
FROM node:20-bookworm AS builder

WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/

# Install all dependencies for building
RUN npm ci

# Copy source code
COPY . .

# Build all packages (shared -> server -> client)
RUN npm run build


# Stage 2: Runtime environment
FROM node:20-bookworm-slim

# Install runtime dependencies: Redis, Java (for execution), and Python
RUN apt-get update && apt-get install -y \
    python3 \
    openjdk-17-jdk \
    redis-server \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy production manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled results from the builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/client/dist ./packages/client/dist

# Copy startup script
COPY scripts/start-hf.sh ./scripts/start-hf.sh
RUN chmod +x ./scripts/start-hf.sh

# Environment variables for Hugging Face
ENV NODE_ENV=production
ENV PORT=7860
ENV CLIENT_URL=*
ENV REDIS_URL=redis://localhost:6379

# Expose the HF port
EXPOSE 7860

# Start Redis and the server
CMD ["./scripts/start-hf.sh"]
