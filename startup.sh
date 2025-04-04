#!/bin/sh
set -e

echo "🚀 Starting environment setup..."

# Run database migrations
echo "🛠 Running database migrations..."
npx prisma generate
npx prisma migrate deploy  # Use deploy instead of dev in production

# Run data seeding scripts
echo "🌍 Seeding data..."
node saveCities.js
node saveAirports.js
node generateHotels.js

echo "✅ Environment setup complete!"