describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('should display login and register options when not authenticated', () => {
    cy.get('[data-testid="login-button"]').should('be.visible');
    cy.get('[data-testid="register-button"]').should('be.visible');
    cy.get('[data-testid="user-profile"]').should('not.exist');
  });

  it('should register a new user successfully', () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpass123',
      password_confirm: 'testpass123'
    };

    // Navigate to register page
    cy.get('[data-testid="register-button"]').click();
    cy.url().should('include', '/register');

    // Fill registration form
    cy.get('input[name="username"]').type(userData.username);
    cy.get('input[name="email"]').type(userData.email);
    cy.get('input[name="password"]').type(userData.password);
    cy.get('input[name="password_confirm"]').type(userData.password_confirm);

    // Submit form
    cy.get('button[type="submit"]').click();

    // Should redirect to home page and show user is logged in
    cy.url().should('not.include', '/register');
    cy.get('[data-testid="user-profile"]').should('be.visible');
    cy.get('[data-testid="user-profile"]').should('contain', userData.username);
  });

  it('should login existing user successfully', () => {
    // First register a user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpass123'
    };

    cy.register(userData);

    // Logout
    cy.get('[data-testid="logout-button"]').click();

    // Now test login
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/login');

    // Fill login form
    cy.get('input[name="username"]').type(userData.username);
    cy.get('input[name="password"]').type(userData.password);

    // Submit form
    cy.get('button[type="submit"]').click();

    // Should redirect to home page and show user is logged in
    cy.url().should('not.include', '/login');
    cy.get('[data-testid="user-profile"]').should('be.visible');
    cy.get('[data-testid="user-profile"]').should('contain', userData.username);
  });

  it('should show error for invalid login credentials', () => {
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/login');

    // Fill with invalid credentials
    cy.get('input[name="username"]').type('invaliduser');
    cy.get('input[name="password"]').type('wrongpassword');

    // Submit form
    cy.get('button[type="submit"]').click();

    // Should show error message
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
  });

  it('should show error for mismatched passwords during registration', () => {
    cy.get('[data-testid="register-button"]').click();
    cy.url().should('include', '/register');

    // Fill form with mismatched passwords
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="password_confirm"]').type('differentpassword');

    // Submit form
    cy.get('button[type="submit"]').click();

    // Should show error message
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Passwords do not match');
  });

  it('should logout user successfully', () => {
    // Register and login user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpass123'
    };

    cy.register(userData);

    // Logout
    cy.get('[data-testid="logout-button"]').click();

    // Should redirect to login page
    cy.url().should('include', '/login');
    cy.get('[data-testid="login-button"]').should('be.visible');
    cy.get('[data-testid="user-profile"]').should('not.exist');
  });

  it('should persist login across page refreshes', () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpass123'
    };

    // Register and login
    cy.register(userData);

    // Refresh page
    cy.reload();

    // Should still be logged in
    cy.get('[data-testid="user-profile"]').should('be.visible');
    cy.get('[data-testid="user-profile"]').should('contain', userData.username);
  });
});
