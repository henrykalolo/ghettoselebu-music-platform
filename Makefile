.PHONY: help setup dev test build deploy clean

# Default target
help:
	@echo "🎵 Ghettoselebu Music Platform - Available Commands:"
	@echo ""
	@echo "📋 Setup Commands:"
	@echo "  make setup     - Set up development environment"
	@echo "  make clean     - Clean temporary files and caches"
	@echo ""
	@echo "🚀 Development Commands:"
	@echo "  make dev       - Start development servers (backend + frontend)"
	@echo "  make backend   - Start backend server only"
	@echo "  make frontend  - Start frontend server only"
	@echo ""
	@echo "🧪 Testing Commands:"
	@echo "  make test      - Run all tests (backend + frontend + e2e)"
	@echo "  make test-be   - Run backend tests only"
	@echo "  make test-fe   - Run frontend tests only"
	@echo "  make test-e2e  - Run E2E tests only"
	@echo "  make coverage  - Generate test coverage reports"
	@echo ""
	@echo "🐳 Docker Commands:"
	@echo "  make docker-up - Start services with Docker Compose"
	@echo "  make docker-down - Stop Docker services"
	@echo "  make docker-build - Build Docker images"
	@echo ""
	@echo "🚀 Deployment Commands:"
	@echo "  make build     - Build for production"
	@echo "  make deploy    - Deploy to production"
	@echo ""
	@echo "🔧 Utility Commands:"
	@echo "  make migrate   - Run database migrations"
	@echo "  make collect   - Collect static files"
	@echo "  make superuser - Create admin superuser"
	@echo "  make shell     - Open Django shell"

# Setup development environment
setup:
	@echo "🎵 Setting up development environment..."
	./scripts/setup-dev.sh

# Clean temporary files
clean:
	@echo "🧹 Cleaning temporary files..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name "*.pyo" -delete 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".coverage" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "build" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	rm -f .coverage 2>/dev/null || true
	rm -f coverage.xml 2>/dev/null || true
	@echo "✅ Clean completed!"

# Start development servers
dev:
	@echo "🚀 Starting development servers..."
	@echo "🔧 Backend: http://localhost:8000"
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "⚙️  Admin: http://localhost:8000/admin"
	@echo ""
	@echo "Press Ctrl+C to stop both servers"
	@make dev-backend & make dev-frontend

# Start backend server
dev-backend:
	@echo "🔧 Starting Django backend server..."
	cd backend && source ../venv/bin/activate && python manage.py runserver

# Start frontend server
dev-frontend:
	@echo "🌐 Starting React frontend server..."
	cd frontend && npm start

# Run all tests
test:
	@echo "🧪 Running all tests..."
	@make test-be
	@make test-fe
	@make test-e2e

# Run backend tests
test-be:
	@echo "🐍 Running backend tests..."
	cd backend && source ../venv/bin/activate && python -m pytest --cov=music --cov=api --cov-report=html --cov-report=term

# Run frontend tests
test-fe:
	@echo "⚛️  Running frontend tests..."
	cd frontend && npm test -- --coverage --watchAll=false

# Run E2E tests
test-e2e:
	@echo "🌐 Running E2E tests..."
	cd frontend && npm run test:e2e:headless

# Generate coverage reports
coverage:
	@echo "📊 Generating coverage reports..."
	@make test-be
	@echo "📈 Backend coverage report available at backend/htmlcov/index.html"
	@make test-fe
	@echo "📈 Frontend coverage report available in frontend terminal output"

# Docker commands
docker-up:
	@echo "🐳 Starting Docker services..."
	docker-compose up -d

docker-down:
	@echo "🐳 Stopping Docker services..."
	docker-compose down

docker-build:
	@echo "🐳 Building Docker images..."
	docker-compose build

# Build for production
build:
	@echo "🏗️  Building for production..."
	cd frontend && npm run build
	cd backend && source ../venv/bin/activate && python manage.py collectstatic --noinput

# Deploy to production
deploy:
	@echo "🚀 Deploying to production..."
	./scripts/deploy.sh

# Database operations
migrate:
	@echo "🗄️  Running database migrations..."
	cd backend && source ../venv/bin/activate && python manage.py migrate

collect:
	@echo "📁 Collecting static files..."
	cd backend && source ../venv/bin/activate && python manage.py collectstatic --noinput

superuser:
	@echo "👤 Creating superuser..."
	cd backend && source ../venv/bin/activate && python manage.py createsuperuser

shell:
	@echo "🐚 Opening Django shell..."
	cd backend && source ../venv/bin/activate && python manage.py shell

# GitHub setup
github-setup:
	@echo "🐙 Setting up GitHub repository..."
	@echo "Please run 'gh auth login' first, then:"
	@echo "gh repo create ghettoselebu --public --source=. --remote=origin --push"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	cd backend && source ../venv/bin/activate && pip install -r requirements.txt
	cd frontend && npm install

# Quick start (setup + dev)
start: setup dev
