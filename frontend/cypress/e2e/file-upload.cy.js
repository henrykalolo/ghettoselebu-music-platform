describe('File Upload Functionality', () => {
  beforeEach(() => {
    // Login user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpass123'
    };
    cy.register(userData);
  });

  it('should upload audio files successfully', () => {
    cy.visit('/upload');
    
    // Check upload form
    cy.get('[data-testid="upload-form"]').should('be.visible');
    cy.get('[data-testid="file-input"]').should('be.visible');
    cy.get('[data-testid="track-title"]').should('be.visible');
    cy.get('[data-testid="track-artist"]').should('be.visible');
    
    // Fill track information
    cy.get('[data-testid="track-title"]').type('Test Upload Track');
    cy.get('[data-testid="track-artist"]').type('Test Artist');
    cy.get('[data-testid="track-genre"]').select('Hip-Hop');
    
    // Upload audio file
    cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/test-audio.mp3');
    
    // Should show file preview
    cy.get('[data-testid="file-preview"]').should('be.visible');
    cy.get('[data-testid="file-name"]').should('contain', 'test-audio.mp3');
    
    // Submit upload
    cy.get('[data-testid="upload-submit"]').click();
    
    // Should show success message
    cy.get('[data-testid="success-message"]').should('contain', 'Upload successful');
    
    // Should redirect to track detail page
    cy.url().should('match', /\/tracks\/[^\/]+/);
  });

  it('should validate file types during upload', () => {
    cy.visit('/upload');
    
    // Try to upload non-audio file
    cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/test-image.jpg');
    
    // Should show validation error
    cy.get('[data-testid="error-message"]').should('contain', 'Invalid file type');
    cy.get('[data-testid="upload-submit"]').should('be.disabled');
  });

  it('should validate file size during upload', () => {
    cy.visit('/upload');
    
    // Try to upload large file (mock large file)
    cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/large-audio.mp3');
    
    // Should show size error
    cy.get('[data-testid="error-message"]').should('contain', 'File too large');
  });

  it('should show upload progress', () => {
    cy.visit('/upload');
    
    // Fill form and select file
    cy.get('[data-testid="track-title"]').type('Test Track');
    cy.get('[data-testid="track-artist"]').type('Test Artist');
    cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/test-audio.mp3');
    
    // Submit upload
    cy.get('[data-testid="upload-submit"]').click();
    
    // Should show progress bar
    cy.get('[data-testid="upload-progress"]').should('be.visible');
    
    // Should show progress percentage
    cy.get('[data-testid="progress-percentage"]').should('be.visible');
  });

  it('should handle upload errors gracefully', () => {
    // Mock network error
    cy.intercept('POST', '/api/upload/single/', { statusCode: 500 }).as('uploadError');
    
    cy.visit('/upload');
    
    // Fill form and select file
    cy.get('[data-testid="track-title"]').type('Test Track');
    cy.get('[data-testid="track-artist"]').type('Test Artist');
    cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/test-audio.mp3');
    
    // Submit upload
    cy.get('[data-testid="upload-submit"]').click();
    
    // Wait for network error
    cy.wait('@uploadError');
    
    // Should show error message
    cy.get('[data-testid="error-message"]').should('contain', 'Upload failed');
  });

  it('should allow multiple file uploads', () => {
    cy.visit('/upload/batch');
    
    // Check batch upload interface
    cy.get('[data-testid="batch-upload"]').should('be.visible');
    cy.get('[data-testid="multiple-file-input"]').should('be.visible');
    
    // Select multiple files
    cy.get('[data-testid="multiple-file-input"]').selectFile([
      'cypress/fixtures/test-audio-1.mp3',
      'cypress/fixtures/test-audio-2.mp3',
      'cypress/fixtures/test-audio-3.mp3'
    ]);
    
    // Should show file list
    cy.get('[data-testid="file-list"]').should('be.visible');
    cy.get('[data-testid="file-item"]').should('have.length', 3);
    
    // Submit batch upload
    cy.get('[data-testid="batch-upload-submit"]').click();
    
    // Should show batch progress
    cy.get('[data-testid="batch-progress"]').should('be.visible');
  });

  it('should extract metadata from uploaded files', () => {
    cy.visit('/upload');
    
    // Upload file with metadata
    cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/metadata-audio.mp3');
    
    // Should auto-fill metadata
    cy.get('[data-testid="track-title"]').should('not.be.empty');
    cy.get('[data-testid="track-artist"]').should('not.be.empty');
    cy.get('[data-testid="track-duration"]').should('be.visible');
  });

  it('should allow editing metadata before upload', () => {
    cy.visit('/upload');
    
    // Upload file
    cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/test-audio.mp3');
    
    // Edit auto-filled metadata
    cy.get('[data-testid="track-title"]').clear().type('Custom Title');
    cy.get('[data-testid="track-artist"]').clear().type('Custom Artist');
    
    // Submit upload
    cy.get('[data-testid="upload-submit"]').click();
    
    // Should use custom metadata
    cy.url().should('match', /\/tracks\/[^\/]+/);
    cy.get('[data-testid="track-title"]').should('contain', 'Custom Title');
  });

  it('should show upload history', () => {
    cy.visit('/profile/uploads');
    
    // Check upload history section
    cy.get('[data-testid="upload-history"]').should('be.visible');
    
    // Should show uploaded tracks
    cy.get('[data-testid="uploaded-track"]').should('have.length.greaterThan', 0);
    
    // Check track information
    cy.get('[data-testid="uploaded-track"]').first().within(() => {
      cy.get('[data-testid="track-title"]').should('be.visible');
      cy.get('[data-testid="upload-date"]').should('be.visible');
      cy.get('[data-testid="track-status"]').should('be.visible');
    });
  });

  it('should allow re-uploading failed uploads', () => {
    cy.visit('/profile/uploads');
    
    // Find failed upload
    cy.get('[data-testid="uploaded-track"]').within(() => {
      cy.get('[data-testid="track-status"]').contains('Failed').parent().within(() => {
        cy.get('[data-testid="retry-upload"]').click();
      });
    });
    
    // Should open retry modal
    cy.get('[data-testid="retry-modal"]').should('be.visible');
    
    // Retry upload
    cy.get('[data-testid="retry-submit"]').click();
    
    // Should show processing status
    cy.get('[data-testid="processing-status"]').should('be.visible');
  });
});
