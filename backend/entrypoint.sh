#!/bin/sh
set -e

echo "Starting Astro backend..."
node index.js &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server to initialize..."
sleep 3

# Seed admin user
echo "Seeding admin user..."
npm run seed-admin

# Keep server running
wait $SERVER_PID
