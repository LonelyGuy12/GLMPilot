#!/bin/bash
export NODE_ENV=production
# Start Redis in the background with essential flags for containerized environments
echo "Starting Redis server..."
redis-server --daemonize yes --protected-mode no

# Wait for Redis to be ready (up to 30 seconds)
COUNTER=0
until redis-cli ping > /dev/null 2>&1 || [ $COUNTER -eq 30 ]; do
  echo "Waiting for Redis ($COUNTER)..."
  sleep 1
  ((COUNTER++))
done

if [ $COUNTER -eq 30 ]; then
  echo "⚠️ Redis failed to start or is unreachable, but continuing for app boot..."
else
  echo "✅ Redis is ready!"
fi

# Use the PORT environment variable if provided by HF, otherwise default to 7860
export PORT="${PORT:-7860}"
echo "🚀 Starting GLMPilot on port $PORT..."

# Start the Node.js application
npm run start -w packages/server
