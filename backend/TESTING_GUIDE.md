# Testing Guide for Ghettoselebu Music Platform

This guide covers the comprehensive testing setup for the Ghettoselebu music streaming platform.

## Overview

The testing framework includes:
- **Backend Testing**: pytest-django with comprehensive API and model tests
- **Frontend Testing**: Jest + React Testing Library for component testing
- **API Testing**: Postman collection for manual API testing
- **E2E Testing**: Cypress setup (planned)

## Backend Testing

### Setup

The backend uses pytest-django with the following configuration:

```bash
# Install dependencies
pip install pytest pytest-django pytest-cov factory-boy mixer

# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=music --cov=api --cov-report=html

# Run specific test categories
python -m pytest -m unit          # Unit tests
python -m pytest -m integration    # Integration tests
python -m pytest -m slow          # Slow tests (exclude with -m "not slow")
```

### Test Structure

```
backend/
├── conftest.py                 # Global fixtures and configuration
├── pytest.ini                  # pytest configuration
├── api/
│   ├── test_api.py            # API endpoint tests
│   └── test_serializers.py    # Serializer tests
└── music/
    └── test_models.py         # Model tests
```

### Key Features

- **Fixtures**: Pre-configured test data (users, tracks, artists, etc.)
- **Database Isolation**: Each test runs with a clean database
- **Coverage Reporting**: HTML and terminal coverage reports
- **Test Markers**: `@pytest.mark.unit`, `@pytest.mark.integration`, `@pytest.mark.slow`

### Running Tests

```bash
# Run all backend tests
cd backend && source ../venv/bin/activate && python -m pytest

# Run specific test file
python -m pytest music/test_models.py

# Run with verbose output
python -m pytest -v

# Run specific test method
python -m pytest music/test_models.py::TestGenreModel::test_genre_creation
```

## Frontend Testing

### Setup

The frontend uses Jest with React Testing Library:

```bash
# Install dependencies (already included in package.json)
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

```
frontend/src/components/__tests__/
├── AudioPlayer.basic.test.tsx    # Audio player component tests
└── [other component tests]
```

### Key Features

- **Component Testing**: Individual React component testing
- **Mocking**: Audio elements and API calls are mocked
- **Accessibility Testing**: Tests use accessible selectors
- **User Interaction Testing**: Click events, form submissions, etc.

### Running Tests

```bash
# Run all frontend tests
cd frontend && npm test

# Run specific test file
npm test -- --testPathPattern=AudioPlayer.basic.test.tsx

# Run tests without watch mode
npm test -- --watchAll=false
```

## API Testing with Postman

### Import Collection

1. Open Postman
2. Click "Import" → "Select File"
3. Choose `backend/postman_collection.json`
4. The collection will be imported with all endpoints

### Collection Features

- **Authentication Flow**: Register → Login → Access Protected Endpoints
- **CRUD Operations**: Create, Read, Update, Delete for all models
- **Search Functionality**: Test search endpoints
- **File Upload**: Test audio file uploads

### Environment Variables

- `baseUrl`: http://localhost:8000/api
- `accessToken`: Automatically set after login

## Test Coverage

### Backend Coverage Areas

✅ **Models**: All model methods and relationships
✅ **Serializers**: Data validation and serialization
✅ **API Endpoints**: CRUD operations, authentication, pagination
✅ **Business Logic**: Following, liking, commenting

### Frontend Coverage Areas

✅ **Component Rendering**: Basic component display
✅ **User Interactions**: Button clicks, form inputs
✅ **State Management**: Component state changes
✅ **Error Handling**: Null states, loading states

### API Coverage Areas

✅ **Authentication**: Registration, login, token refresh
✅ **Content Management**: Genres, artists, tracks, albums
✅ **Search**: Content search functionality
✅ **File Operations**: Upload endpoints

## Continuous Integration

### GitHub Actions (Recommended)

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.13'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-django pytest-cov
      - name: Run tests
        run: |
          cd backend
          python -m pytest --cov=music --cov=api
  
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      - name: Run tests
        run: |
          cd frontend
          npm test -- --coverage --watchAll=false
```

## Best Practices

### Backend Testing

1. **Use Descriptive Test Names**: Test names should describe what is being tested
2. **Test One Thing Per Test**: Each test should focus on a single behavior
3. **Use Fixtures**: Reuse test data with fixtures
4. **Mock External Dependencies**: Mock APIs and external services
5. **Test Edge Cases**: Test null values, empty arrays, invalid data

### Frontend Testing

1. **Test User Behavior**: Test what users see and do
2. **Use Accessible Selectors**: Prefer getByRole, getByLabelText over getByTestId
3. **Mock API Calls**: Use jest.mock for API services
4. **Test Loading States**: Test loading and error states
5. **Test Accessibility**: Ensure components are accessible

### API Testing

1. **Test Happy Paths**: Test successful requests
2. **Test Error Cases**: Test invalid data, authentication failures
3. **Test Pagination**: Test large datasets
4. **Test File Uploads**: Test file upload endpoints
5. **Test Rate Limiting**: If applicable

## Troubleshooting

### Common Issues

1. **Database Access Error**: Ensure tests have `@pytest.mark.django_db`
2. **Audio Element Issues**: Mock HTMLAudioElement in frontend tests
3. **Import Errors**: Check Python path and Django settings
4. **Test Isolation**: Tests should not depend on each other

### Debugging Tests

```bash
# Run tests with detailed output
python -m pytest -v -s

# Run tests with debugger
python -m pytest --pdb

# Run specific failing test
python -m pytest -xvs test_file.py::TestClass::test_method
```

## E2E Testing with Cypress

### Setup

The frontend uses Cypress for end-to-end testing:

```bash
# Install dependencies (already completed)
npm install --save-dev cypress cypress-mochawesome-reporter

# Run E2E tests
npm run test:e2e                    # Open Cypress Test Runner
npm run test:e2e:headless           # Run tests in headless mode
npm run test:e2e:ci                 # Run tests with CI reporting
```

### Test Structure

```
frontend/cypress/
├── cypress.config.js               # Cypress configuration
├── support/
│   ├── e2e.js                     # Global setup and commands
│   └── commands.js                # Custom commands
├── e2e/
│   ├── authentication.cy.js        # Authentication flow tests
│   ├── music-player.cy.js         # Music player functionality
│   ├── content-discovery.cy.js    # Content browsing and search
│   ├── social-features.cy.js       # Social interactions
│   ├── file-upload.cy.js          # File upload functionality
│   ├── responsive-design.cy.js    # Mobile/responsive testing
│   └── performance.cy.js          # Performance testing
└── fixtures/                       # Test data files
```

### Key Features

- **Cross-browser Testing**: Chrome, Firefox, Edge support
- **Mobile Testing**: Responsive design and touch gestures
- **Performance Testing**: Load times, memory usage, optimization
- **Accessibility Testing**: WCAG compliance and keyboard navigation
- **Visual Testing**: UI consistency across browsers
- **Network Mocking**: API request/response interception
- **Custom Commands**: Reusable test utilities

### Running Tests

```bash
# Open Cypress Test Runner (interactive)
npm run test:e2e

# Run all tests in headless mode
npm run test:e2e:headless

# Run specific test file
npm run test:e2e:headless -- --spec "cypress/e2e/authentication.cy.js"

# Run tests with specific browser
npm run test:e2e:headless -- --browser chrome

# Run tests with specific viewport
npm run test:e2e:headless -- --config "viewportWidth=375,viewportHeight=667"
```

### Test Coverage Areas

✅ **Authentication**: Registration, login, logout, session persistence
✅ **Music Player**: Play/pause, navigation, volume, progress controls
✅ **Content Discovery**: Browsing, searching, filtering, pagination
✅ **Social Features**: Liking, commenting, sharing, following
✅ **File Upload**: Audio uploads, metadata extraction, progress tracking
✅ **Responsive Design**: Mobile, tablet, desktop layouts
✅ **Performance**: Load times, memory usage, network optimization
✅ **Accessibility**: Keyboard navigation, screen readers, ARIA labels

### CI/CD Integration

The GitHub Actions workflow (`e2e-tests.yml`) includes:

- **Multi-browser Testing**: Chrome, Firefox, Edge
- **Multi-device Testing**: Desktop, tablet, mobile viewports
- **Parallel Execution**: Tests run in parallel for faster feedback
- **Artifact Collection**: Screenshots, videos, test reports
- **Performance Monitoring**: Load time and memory usage tracking
- **Security Testing**: OWASP ZAP integration
- **Visual Regression**: UI consistency checking
- **Accessibility Testing**: Automated a11y compliance checks

### Metrics to Track

- **Test Coverage**: Aim for >80% coverage
- **Test Execution Time**: Keep tests fast
- **Flaky Tests**: Monitor and fix flaky tests
- **CI/CD Pipeline Time**: Optimize test execution

## Conclusion

This comprehensive testing setup ensures:

- **Code Quality**: Tests catch bugs early
- **Regression Prevention**: Automated tests prevent regressions
- **Documentation**: Tests serve as living documentation
- **Confidence**: Tests provide confidence in deployments

The testing framework is designed to be extensible and maintainable, allowing the team to add new tests as the application grows.
