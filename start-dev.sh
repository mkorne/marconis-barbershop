#!/bin/bash

# Marconi's Barbershop Development Server Startup Script
echo "🚀 Starting Marconi's Barber Shop Development Environment..."

# Check if required services are running
if ! systemctl is-active --quiet postgresql; then
    echo "❌ PostgreSQL is not running. Please start it first:"
    echo "   sudo systemctl start postgresql"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped."
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Start backend server
echo "🔧 Starting backend server on port 5000..."
cd backend
PORT=5000 npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🌐 Starting frontend server on port 3000 (via live-server)..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Go back to project root
cd ../

echo ""
echo "✅ Development environment is running!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "🏥 Health Check: http://localhost:5000/health"
echo ""
echo "📝 Logs:"
echo "   Backend logs: tail -f backend/logs/combined.log"
echo "   Error logs: tail -f backend/logs/error.log"
echo ""
echo "🔑 Admin Login: username=admin, password=marconi123"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running and display status
while true; do
    sleep 10
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "❌ Backend server stopped unexpectedly!"
        break
    fi
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "❌ Frontend server stopped unexpectedly!"
        break
    fi
done

cleanup
