#!/bin/bash

# Sync JavaScript files from src to public directory
# This ensures the frontend can access the latest JavaScript modules

echo "🔄 Syncing JavaScript files to public directory..."

# Create directories if they don't exist
mkdir -p public/src/js

# Copy all JS files from src to public
cp -r src/js/* public/src/js/ 2>/dev/null || true

# List the files that were copied
echo "📁 JavaScript files in public/src/js/:"
ls -la public/src/js/

echo "✅ JavaScript files synced successfully!"
echo "🚀 You can now run 'npm start' to serve the frontend with the latest JS files"
