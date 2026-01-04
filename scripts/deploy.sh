#!/bin/bash

# Deployment script for Ghettoselebu Music Platform

set -e

echo "🚀 Starting deployment of Ghettoselebu Music Platform..."

# Check if required environment variables are set
if [ -z "$SECRET_KEY" ]; then
    echo "❌ ERROR: SECRET_KEY environment variable is not set"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

# Run database migrations
echo "📊 Running database migrations..."
python backend/manage.py migrate

# Collect static files
echo "📁 Collecting static files..."
python backend/manage.py collectstatic --noinput

# Create superuser if it doesn't exist
echo "👤 Creating superuser..."
python backend/manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
EOF

# Run tests to ensure everything is working
echo "🧪 Running tests..."
cd backend && python -m pytest && cd ..

echo "✅ Deployment completed successfully!"
echo "🌐 Your application is now running at http://localhost:8000"
echo "🔧 Admin panel available at http://localhost:8000/admin"
echo "📊 API documentation at http://localhost:8000/api"
