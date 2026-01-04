# Ghettoselebu - Music Streaming Platform

A full-stack music streaming platform cloned from songslover.li, built with Django REST API backend and React TypeScript frontend.

## Features

### Backend (Django)
- **RESTful API** with Django REST Framework
- **Music Models**: Artists, Albums, Tracks, Mixtapes, Compilations
- **Admin Panel** for content management
- **Search & Filtering** capabilities
- **Download tracking** and statistics
- **CORS support** for frontend integration

### Frontend (React + TypeScript)
- **Modern UI** with Tailwind CSS
- **Responsive Design** for all devices
- **Routing** with React Router
- **API Integration** with Axios
- **Component Architecture** with TypeScript

## Project Structure

```
ghettoselebu/
├── backend/                 # Django REST API
│   ├── ghettoselebu/       # Main project settings
│   ├── music/              # Music models and admin
│   ├── api/                # API serializers and views
│   └── manage.py
├── frontend/               # React TypeScript app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

4. Create superuser (optional):
```bash
python manage.py createsuperuser
```

5. Start development server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## API Endpoints

### Artists
- `GET /api/artists/` - List all artists
- `GET /api/artists/{slug}/` - Get artist details
- `GET /api/artists/{slug}/albums/` - Get artist albums
- `GET /api/artists/{slug}/tracks/` - Get artist tracks

### Albums
- `GET /api/albums/` - List all albums
- `GET /api/albums/{slug}/` - Get album details
- `GET /api/albums/latest/` - Get latest albums

### Tracks
- `GET /api/tracks/` - List all tracks
- `GET /api/tracks/{slug}/` - Get track details
- `GET /api/tracks/latest/` - Get latest tracks
- `GET /api/tracks/top_downloads/` - Get top downloaded tracks

### Mixtapes
- `GET /api/mixtapes/` - List all mixtapes
- `GET /api/mixtapes/{slug}/` - Get mixtape details

### Compilations
- `GET /api/compilations/` - List all compilations
- `GET /api/compilations/{slug}/` - Get compilation details
- `GET /api/compilations/best_of_month/` - Get best of month compilations
- `GET /api/compilations/top_hits/` - Get top hits compilations

## Features Implemented

### ✅ Completed
- [x] Django backend with REST API
- [x] Database models for music content
- [x] Admin panel for content management
- [x] React frontend with TypeScript
- [x] Modern UI with Tailwind CSS
- [x] Basic routing and navigation
- [x] API integration and data fetching

### 🚧 In Progress
- [ ] Search and filtering functionality
- [ ] Download functionality
- [ ] Audio streaming
- [ ] User authentication

### 📋 Planned
- [ ] User profiles and favorites
- [ ] Playlist creation
- [ ] Upload functionality
- [ ] Production deployment
- [ ] Mobile app

## Admin Panel

Access the admin panel at `http://localhost:8000/admin/` to manage:
- Artists and their information
- Albums and track listings
- Mixtapes and compilations
- User profiles and download history

## Tech Stack

### Backend
- **Django 6.0** - Web framework
- **Django REST Framework** - API toolkit
- **SQLite** - Database (development)
- **Pillow** - Image handling
- **django-cors-headers** - CORS support

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

## Testing

This project includes a comprehensive testing framework covering all aspects of the application.

### Backend Testing (pytest-django)

```bash
cd backend
source ../venv/bin/activate

# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=music --cov=api --cov-report=html

# Run specific test categories
python -m pytest -m unit          # Unit tests
python -m pytest -m integration    # Integration tests
```

**Backend Test Coverage:**
- ✅ Model tests for all Django models
- ✅ API endpoint tests for all REST endpoints
- ✅ Serializer tests for data validation
- ✅ Authentication and authorization tests
- ✅ Database operations and relationships

### Frontend Testing (Jest + React Testing Library)

```bash
cd frontend

# Run component tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- --testPathPattern=AudioPlayer.basic.test.tsx
```

**Frontend Test Coverage:**
- ✅ Component rendering and behavior
- ✅ User interactions (clicks, form inputs)
- ✅ State management and props
- ✅ Error handling and edge cases
- ✅ Accessibility testing

### E2E Testing (Cypress)

```bash
cd frontend

# Open Cypress Test Runner (interactive)
npm run test:e2e

# Run all tests in headless mode
npm run test:e2e:headless

# Run specific test file
npm run test:e2e:headless -- --spec "cypress/e2e/authentication.cy.js"
```

**E2E Test Coverage:**
- ✅ Authentication flows (registration, login, logout)
- ✅ Music player functionality (play/pause, navigation, controls)
- ✅ Content discovery (browsing, searching, filtering)
- ✅ Social features (liking, commenting, sharing, following)
- ✅ File uploads (audio uploads, metadata extraction)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Performance testing (load times, memory usage)
- ✅ Cross-browser testing (Chrome, Firefox, Edge)

### API Testing (Postman)

1. Import `backend/postman_collection.json` into Postman
2. Set environment variables:
   - `baseUrl`: http://localhost:8000/api
   - `accessToken`: Automatically set after login
3. Run authentication flow first
4. Test all endpoints

**API Test Coverage:**
- ✅ Authentication endpoints
- ✅ CRUD operations for all models
- ✅ Search and filtering
- ✅ File upload endpoints
- ✅ Error handling and validation

### CI/CD Integration

The project includes GitHub Actions workflows for automated testing:

- **Multi-browser Testing**: Chrome, Firefox, Edge
- **Multi-device Testing**: Desktop, tablet, mobile viewports
- **Parallel Execution**: Tests run in parallel for faster feedback
- **Artifact Collection**: Screenshots, videos, test reports
- **Performance Monitoring**: Load time and memory usage tracking
- **Security Testing**: OWASP ZAP integration
- **Visual Regression**: UI consistency checking

### Test Reports

- **Coverage Reports**: HTML reports for backend and frontend
- **E2E Reports**: Screenshots, videos, and detailed test results
- **Performance Reports**: Load times and memory usage metrics
- **Accessibility Reports**: WCAG compliance checks

For detailed testing documentation, see `backend/TESTING_GUIDE.md`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. **Add tests** for new functionality
5. **Run the test suite** to ensure nothing breaks
6. Submit a pull request

### Testing Requirements

- All new features must include tests
- Backend: pytest-django tests with >80% coverage
- Frontend: Jest + React Testing Library tests
- E2E: Cypress tests for user workflows
- All tests must pass before merging

## License

This project is for educational purposes only. Please respect copyright laws and terms of service of original music platforms.
