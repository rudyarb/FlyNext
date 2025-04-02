# OpenAI. (2025). ChatGPT (Version 4). Retrieved from https://openai.com
#!/bin/bash

echo "🚀 Starting environment setup..."

# Exit on any error
set -e

# Navigate to the project root directory (adjust if needed)
cd "$(dirname "$0")"

# 1️⃣ Check if Node.js & npm are installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install it and try again."
    exit 1
fi

# 2️⃣ Install dependencies
echo "📦 Installing dependencies..."
npm install

# 3️⃣ Run database migrations
echo "🛠 Running database migrations..."
npx prisma generate
npx prisma migrate dev  # Adjust if using a different migration command

# 4️⃣ Fetch and store cities & airports from AFS
echo "🌍 Fetching cities and airports from AFS..."

# Fetch and store cities
echo "🏙 Fetching cities..."
node saveCities.js

# Fetch and store airports
echo "✈️ Fetching airports..."
node saveAirports.js

node generateHotels.js

echo "✅ Environment setup complete!"
