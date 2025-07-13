#!/bin/bash

# Miniapp Integration Deployment Script
echo "🚀 Starting deployment preparation..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Build the client
echo "🔨 Building client..."
cd client
npm run build
cd ..

# Check if build was successful
if [ ! -d "client/build" ]; then
    echo "❌ Error: Client build failed"
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Deploy to your chosen platform (Render, Railway, etc.)"
echo "3. Set environment variables in your hosting platform"
echo "4. Test your deployed application"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions" 