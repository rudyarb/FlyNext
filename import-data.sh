#!/bin/bash

echo "Starting data import process..."

echo "1. Saving airports data..."
node saveAirports.js

echo "2. Saving cities data..."
node saveCities.js

echo "3. Generating hotels data..."
node generateHotels.js

echo "Data import process completed!"