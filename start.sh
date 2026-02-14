#!/bin/bash

echo "🥘 Starting PantryPal Application..."
echo ""

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db 2>/dev/null || {
        echo "⚠️  Could not start MongoDB. Please ensure MongoDB is installed."
        echo "   Install: sudo apt-get install mongodb"
        exit 1
    }
else
    echo "✓ MongoDB is running"
fi

echo ""
echo "📦 Installing dependencies..."

# Backend dependencies
echo "Installing Python packages..."
cd backend
pip install --break-system-packages -q -r requirements.txt
cd ..

# Frontend dependencies  
echo "Installing Node packages..."
cd frontend
npm install --silent 2>/dev/null
cd ..

echo ""
echo "🚀 Starting services..."
echo ""

# Start backend
echo "Starting Backend (FastAPI) on http://localhost:8000"
cd backend
python main.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting Frontend (React) on http://localhost:3000"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ PantryPal is running!"
echo ""
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   Backend API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop: kill $BACKEND_PID $FRONTEND_PID"
echo "   Or use: pkill -f 'python main.py' && pkill -f 'vite'"
echo ""

# Save PIDs to file for easy stopping
echo "$BACKEND_PID" > .pids
echo "$FRONTEND_PID" >> .pids

echo "Press Ctrl+C to stop (PIDs saved to .pids)"
echo ""

# Wait for user to stop
wait
