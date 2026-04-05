FROM node:20-bookworm

# Install Python, Java, and Redis
RUN apt-get update && apt-get install -y \
    python3 \
    openjdk-17-jdk \
    redis-server \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy workspace package files
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/

# Install dependencies
RUN npm ci

# Copy full source
COPY . .

# Build packages
RUN npm run build

# Set environment variables for Hugging Face Spaces
ENV NODE_ENV=production
ENV PORT=7860
ENV CLIENT_URL=*
ENV REDIS_URL=redis://localhost:6379

# Copy startup script
COPY scripts/start-hf.sh ./scripts/start-hf.sh
RUN chmod +x ./scripts/start-hf.sh

# Expose the HF port
EXPOSE 7860

# Start Redis and the server via script
CMD ["./scripts/start-hf.sh"]
