#!/bin/bash

# Quick setup script for macOS and Linux users

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║    🏥  Real-Time Alert System Dashboard - Auto Setup          ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found"
echo ""

# Check if directories exist
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found"
    exit 1
fi

echo "✅ Directories found"
echo ""

# Install backend
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed"
cd ..
echo ""

# Install frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed"
cd ..
echo ""

# Start backend in background
echo "🚀 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..
echo "✅ Backend started (PID: $BACKEND_PID)"
echo ""

# Wait for backend to start
echo "⏳ Waiting for backend to initialize (3 seconds)..."
sleep 3

# Start frontend
echo "🚀 Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   🎉 Setup Complete!                          ║"
echo "║                                                                ║"
echo "║  📍 Backend:  http://localhost:5000                           ║"
echo "║  📍 Frontend: http://localhost:5173 (should open automatically)║"
echo "║                                                                ║"
echo "║  ⚠️  Keep this terminal window open while using the app      ║"
echo "║                                                                ║"
echo "║  To stop the app, press Ctrl+C                               ║"
echo "║                                                                ║"
echo "║  📚 See README.md for full documentation                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Keep script running
wait
