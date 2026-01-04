#!/bin/bash

# Development setup script for Ghettoselebu Music Platform

set -e

echo "🎵 Setting up Ghettoselebu Music Platform for development..."

# Check if Python 3.13 is installed
if ! command -v python3.13 &> /dev/null; then
    echo "❌ Python 3.13 is not installed. Please install Python 3.13 first."
    exit 1
fi

# Check if Node.js 18+ is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Create virtual environment
echo "🐍 Creating Python virtual environment..."
python3.13 -m venv venv
source venv/bin/activate

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install --upgrade pip
pip install -r requirements.txt
pip install pytest pytest-django pytest-cov factory-boy mixer

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Create superuser
echo "👤 Creating admin user..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Admin user created: username=admin, password=admin123')
else:
    print('Admin user already exists')
EOF

# Load sample data (optional)
echo "🎼 Loading sample data..."
python manage.py shell << EOF
from music.models import Genre, Artist, Album, Track
import random

# Create sample genres
genres_data = [
    {'name': 'Hip-Hop', 'slug': 'hip-hop'},
    {'name': 'R&B', 'slug': 'r-b'},
    {'name': 'Pop', 'slug': 'pop'},
    {'name': 'Rock', 'slug': 'rock'},
    {'name': 'Electronic', 'slug': 'electronic'},
]

for genre_data in genres_data:
    genre, created = Genre.objects.get_or_create(**genre_data)
    if created:
        print(f"Created genre: {genre.name}")

# Create sample artists
artists_data = [
    {'name': 'Drake', 'slug': 'drake', 'bio': 'Canadian rapper, singer, and actor'},
    {'name': 'Beyoncé', 'slug': 'beyonce', 'bio': 'American singer, songwriter, and actress'},
    {'name': 'Kendrick Lamar', 'slug': 'kendrick-lamar', 'bio': 'American rapper and songwriter'},
]

for artist_data in artists_data:
    artist, created = Artist.objects.get_or_create(**artist_data)
    if created:
        print(f"Created artist: {artist.name}")

print("Sample data loaded successfully!")
EOF

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Create environment file
echo "⚙️ Creating frontend environment file..."
cat > .env << EOF
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_ENV=development
EOF

cd ..

# Create development environment file
echo "⚙️ Creating backend environment file..."
cp .env.example .env

echo "✅ Development setup completed!"
echo ""
echo "🎵 To start the development servers:"
echo "   Backend:  cd backend && source ../venv/bin/activate && python manage.py runserver"
echo "   Frontend: cd frontend && npm start"
echo ""
echo "🔧 Admin panel: http://localhost:8000/admin (admin/admin123)"
echo "🌐 Frontend: http://localhost:3000"
echo "📊 API: http://localhost:8000/api"
echo ""
echo "🧪 To run tests:"
echo "   Backend:  cd backend && source ../venv/bin/activate && python -m pytest"
echo "   Frontend: cd frontend && npm test"
echo "   E2E:      cd frontend && npm run test:e2e"
