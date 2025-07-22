#!/bin/bash

# Stage Crew Website Setup Script
# This script helps set up the development environment

echo "🚀 Setting up Stage Crew Website Development Environment"
echo "========================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3."
    exit 1
fi

echo "✓ pip3 found"

# Check if MongoDB is running (optional check)
if command -v mongod &> /dev/null; then
    echo "✓ MongoDB found"
else
    echo "⚠️  MongoDB not found. Please install MongoDB or use MongoDB Atlas."
fi

# Navigate to backend directory
cd backend

echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✓ Python dependencies installed successfully"
else
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env 2>/dev/null || echo "⚠️  No .env.example found. Please create .env file manually."
    echo "⚠️  Please edit the .env file with your configuration before starting the server."
fi

# Check for Firebase service account
if [ ! -f "firebase-service-account.json" ]; then
    echo "⚠️  Firebase service account file not found."
    echo "   Please download your Firebase service account key and save it as:"
    echo "   backend/firebase-service-account.json"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your configuration"
echo "2. Add your Firebase service account key"
echo "3. Start the backend server: cd backend && python3 start.py"
echo "4. Serve the frontend on a local web server"
echo "5. Access admin dashboard at /admin-dashboard.html"
echo ""
echo "For detailed instructions, see README.md"
