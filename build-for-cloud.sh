#!/bin/bash

echo "🏗️  Building PantryPal for Cloud Deployment..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.11+"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ Python version: $(python3 --version)"
echo ""

# Build Frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully!"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Copy to backend/static
echo "📁 Copying frontend to backend..."
cd ..
rm -rf backend/static
mkdir -p backend/static
cp -r frontend/dist/* backend/static/

echo "✅ Frontend copied to backend/static/"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed!"
else
    echo "❌ Backend dependencies failed"
    exit 1
fi

cd ..

echo ""
echo "✅ Build complete! Ready for cloud deployment."
echo ""
echo "📋 Next steps:"
echo "   1. Push to GitHub: git add . && git commit -m 'Ready for deploy' && git push"
echo "   2. Deploy to Railway: See CLOUD_DEPLOYMENT.md"
echo "   3. Or use Docker: docker-compose up"
echo ""
