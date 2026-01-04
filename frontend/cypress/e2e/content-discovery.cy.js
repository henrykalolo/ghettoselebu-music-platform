describe('Content Discovery', () => {
  beforeEach(() => {
    // Login user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpass123'
    };
    cy.register(userData);
  });

  it('should browse and discover music content', () => {
    cy.visit('/');
    
    // Check navigation menu
    cy.get('[data-testid="nav-home"]').should('be.visible');
    cy.get('[data-testid="nav-tracks"]').should('be.visible');
    cy.get('[data-testid="nav-artists"]').should('be.visible');
    cy.get('[data-testid="nav-albums"]').should('be.visible');
    cy.get('[data-testid="nav-genres"]').should('be.visible');
  });

  it('should display tracks with proper information', () => {
    cy.visit('/tracks');
    
    // Check if tracks are displayed
    cy.get('[data-testid="track-item"]').should('have.length.greaterThan', 0);
    
    // Check track information
    cy.get('[data-testid="track-item"]').first().within(() => {
      cy.get('[data-testid="track-title"]').should('be.visible');
      cy.get('[data-testid="track-artist"]').should('be.visible');
      cy.get('[data-testid="track-duration"]').should('be.visible');
    });
  });

  it('should filter tracks by genre', () => {
    cy.visit('/tracks');
    
    // Check if genre filter is available
    cy.get('[data-testid="genre-filter"]').should('be.visible');
    
    // Select a genre
    cy.get('[data-testid="genre-filter"]').select('Hip-Hop');
    
    // Should filter results
    cy.get('[data-testid="track-item"]').should('have.length.greaterThan', 0);
    
    // Check if filtered tracks belong to selected genre
    cy.get('[data-testid="track-item"]').first().within(() => {
      cy.get('[data-testid="track-genre"]').should('contain', 'Hip-Hop');
    });
  });

  it('should search for music content', () => {
    cy.visit('/');
    
    // Check search functionality
    cy.get('[data-testid="search-input"]').should('be.visible');
    
    // Type search query
    cy.get('[data-testid="search-input"]').type('test');
    
    // Should show search results
    cy.get('[data-testid="search-results"]').should('be.visible');
    
    // Check if results contain search term
    cy.get('[data-testid="search-results"]').within(() => {
      cy.get('[data-testid="track-item"]').should('have.length.greaterThan', 0);
    });
  });

  it('should display artist profiles with detailed information', () => {
    cy.visit('/artists');
    
    // Click on first artist
    cy.get('[data-testid="artist-item"]').first().click();
    
    // Should navigate to artist detail page
    cy.url().should('match', /\/artists\/[^\/]+/);
    
    // Check artist information
    cy.get('[data-testid="artist-name"]').should('be.visible');
    cy.get('[data-testid="artist-bio"]').should('be.visible');
    cy.get('[data-testid="artist-image"]').should('be.visible');
    
    // Check artist's tracks and albums
    cy.get('[data-testid="artist-tracks"]').should('be.visible');
    cy.get('[data-testid="artist-albums"]').should('be.visible');
  });

  it('should display album information with track listing', () => {
    cy.visit('/albums');
    
    // Click on first album
    cy.get('[data-testid="album-item"]').first().click();
    
    // Should navigate to album detail page
    cy.url().should('match', /\/albums\/[^\/]+/);
    
    // Check album information
    cy.get('[data-testid="album-title"]').should('be.visible');
    cy.get('[data-testid="album-artist"]').should('be.visible');
    cy.get('[data-testid="album-cover"]').should('be.visible');
    
    // Check track listing
    cy.get('[data-testid="album-tracks"]').should('be.visible');
    cy.get('[data-testid="track-item"]').should('have.length.greaterThan', 0);
  });

  it('should handle pagination for large content lists', () => {
    cy.visit('/tracks');
    
    // Check if pagination controls are present
    cy.get('[data-testid="pagination"]').should('be.visible');
    
    // Check page information
    cy.get('[data-testid="page-info"]').should('be.visible');
    
    // Navigate to next page if available
    cy.get('[data-testid="next-page"]').then(($btn) => {
      if ($btn.is(':enabled')) {
        $btn.click();
        cy.url().should('include', 'page=2');
      }
    });
  });

  it('should sort content by different criteria', () => {
    cy.visit('/tracks');
    
    // Check sort options
    cy.get('[data-testid="sort-dropdown"]').should('be.visible');
    
    // Sort by title
    cy.get('[data-testid="sort-dropdown"]').select('Title');
    
    // Verify sorting (first track should come before last alphabetically)
    cy.get('[data-testid="track-item"]').first().invoke('text').as('firstTitle');
    cy.get('[data-testid="track-item"]').last().invoke('text').as('lastTitle');
    
    // Sort by date
    cy.get('[data-testid="sort-dropdown"]').select('Date Added');
  });

  it('should display featured and trending content', () => {
    cy.visit('/');
    
    // Check featured section
    cy.get('[data-testid="featured-tracks"]').should('be.visible');
    cy.get('[data-testid="featured-albums"]').should('be.visible');
    
    // Check trending section
    cy.get('[data-testid="trending-tracks"]').should('be.visible');
    cy.get('[data-testid="trending-artists"]').should('be.visible');
  });

  it('should handle empty search results gracefully', () => {
    cy.visit('/');
    
    // Search for non-existent content
    cy.get('[data-testid="search-input"]').type('nonexistentcontent12345');
    
    // Should show no results message
    cy.get('[data-testid="no-results"]').should('be.visible');
    cy.get('[data-testid="no-results"]').should('contain', 'No results found');
  });

  it('should display genre-based browsing', () => {
    cy.visit('/genres');
    
    // Check genre list
    cy.get('[data-testid="genre-item"]').should('have.length.greaterThan', 0);
    
    // Click on a genre
    cy.get('[data-testid="genre-item"]').first().click();
    
    // Should show content filtered by genre
    cy.url().should('match', /\/genres\/[^\/]+/);
    cy.get('[data-testid="genre-tracks"]').should('be.visible');
    cy.get('[data-testid="genre-artists"]').should('be.visible');
  });

  it('should handle content loading states', () => {
    cy.visit('/tracks');
    
    // Should show loading state initially
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    
    // Should hide loading state when content loads
    cy.get('[data-testid="loading-spinner"]').should('not.exist');
    cy.get('[data-testid="track-item"]').should('be.visible');
  });
});
