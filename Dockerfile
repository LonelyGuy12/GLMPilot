FROM node:20-bookworm

# Install Python and Java
RUN apt-get update && apt-get install -y \
    python3 \
    openjdk-17-jdk \
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
ENV CLIENT_URL=http://localhost:7860

# Expose the HF port
EXPOSE 7860

# Start the server
CMD ["npm", "run", "start", "-w", "packages/server"]
