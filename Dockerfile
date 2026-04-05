# Stage 1: Build the full application
FROM node:20-bookworm AS builder

# Set build-time directory
WORKDIR /app

# Copy all source files
COPY . .

# Install all dependencies and build
RUN npm ci && npm run build


# Stage 2: Final Runtime Image
FROM node:20-bookworm-slim

# Install runtime dependencies: Redis, Java, and Python
RUN apt-get update && apt-get install -y \
    python3 \
    openjdk-17-jdk \
    redis-server \
    && rm -rf /var/lib/apt/lists/*

# Set runtime working directory
WORKDIR /app

# Copy EVERYTHING from builder (including dist and node_modules) 
# to ensure workspace symlinks and dependencies are preserved exactly.
COPY --from=builder /app .

# Ensure the startup script is executable
RUN chmod +x ./scripts/start-hf.sh

# Environment variables for Hugging Face
ENV NODE_ENV=production
# Hugging Face usually provides PORT, but we default to 7860
ENV PORT=7860 
ENV CLIENT_URL=*
ENV REDIS_URL=redis://localhost:6379

# Expose the HF port
EXPOSE 7860

# Use the robust startup script
CMD ["./scripts/start-hf.sh"]
