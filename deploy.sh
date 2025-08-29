#!/bin/bash

echo "🚀 Starting deployment process for Trav Logistics Application..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Check git status
echo "📋 Checking git status..."
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    git status
    echo ""
    read -p "Do you want to commit all changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Prepare for deployment - $(date)"
        echo "✅ Changes committed!"
    else
        echo "❌ Please commit your changes before deploying."
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd server && npm install && cd ..

# Build frontend
echo "🔨 Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

# Test backend
echo "🧪 Testing backend..."
cd server
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Test health endpoint
HEALTH_CHECK=$(curl -s http://localhost:5000/api/health)
if [[ $HEALTH_CHECK == *"Server is running"* ]]; then
    echo "✅ Backend is running and healthy!"
else
    echo "❌ Backend health check failed!"
    kill $BACKEND_PID
    exit 1
fi

# Stop backend
kill $BACKEND_PID
cd ..

echo ""
echo "🎉 Deployment preparation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Set up MongoDB Atlas database"
echo "2. Deploy backend to Railway:"
echo "   - Go to https://railway.app"
echo "   - Connect your GitHub repo"
echo "   - Set root directory to 'server/'"
echo "   - Add environment variables (see DEPLOYMENT.md)"
echo ""
echo "3. Deploy frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Connect your GitHub repo"
echo "   - Set build command: npm run build"
echo "   - Set output directory: dist"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
echo ""
echo "🔗 Useful links:"
echo "- MongoDB Atlas: https://www.mongodb.com/atlas"
echo "- Railway: https://railway.app"
echo "- Vercel: https://vercel.com"
