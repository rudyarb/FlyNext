#!/bin/sh
set -e

# Run startup tasks
sh /app/startup.sh

# Start the main application
exec npm start