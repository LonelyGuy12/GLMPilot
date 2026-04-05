#!/bin/bash
# Start Redis in the background
redis-server --daemonize yes

# Wait for Redis to be ready
until redis-cli ping > /dev/null 2>&1; do
  echo "Waiting for Redis..."
  sleep 1
done
echo "Redis is ready!"

# Start the Node.js application
npm run start -w packages/server
