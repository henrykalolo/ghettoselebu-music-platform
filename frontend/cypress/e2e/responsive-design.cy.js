describe('Responsive Design', () => {
  beforeEach(() => {
    // Login user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpass123'
    };
    cy.register(userData);
  });

  it('should display correctly on mobile devices', () => {
    cy.viewport(375, 667); // iPhone 6/7/8
    
    cy.visit('/');
    
    // Check mobile navigation
    cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
    cy.get('[data-testid="desktop-nav"]').should('not.exist');
    
    // Open mobile menu
    cy.get('[data-testid="mobile-menu-button"]').click();
    cy.get('[data-testid="mobile-menu"]').should('be.visible');
    
    // Check mobile menu items
    cy.get('[data-testid="mobile-menu"]').within(() => {
      cy.get('[data-testid="nav-home"]').should('be.visible');
      cy.get('[data-testid="nav-tracks"]').should('be.visible');
      cy.get('[data-testid="nav-artists"]').should('be.visible');
    });
    
    // Close mobile menu
    cy.get('[data-testid="mobile-menu-button"]').click();
    cy.get('[data-testid="mobile-menu"]').should('not.exist');
  });

  it('should display correctly on tablet devices', () => {
    cy.viewport(768, 1024); // iPad
    
    cy.visit('/');
    
    // Check tablet navigation
    cy.get('[data-testid="desktop-nav"]').should('be.visible');
    cy.get('[data-testid="mobile-menu-button"]').should('not.exist');
    
    // Check content layout
    cy.get('[data-testid="content-grid"]').should('be.visible');
    cy.get('[data-testid="content-grid"]').should('have.class', 'grid-cols-2');
  });

  it('should display correctly on desktop devices', () => {
    cy.viewport(1280, 720); // Desktop
    
    cy.visit('/');
    
    // Check desktop navigation
    cy.get('[data-testid="desktop-nav"]').should('be.visible');
    cy.get('[data-testid="mobile-menu-button"]').should('not.exist');
    
    // Check content layout
    cy.get('[data-testid="content-grid"]').should('be.visible');
    cy.get('[data-testid="content-grid"]').should('have.class', 'grid-cols-3');
  });

  it('should adapt music player for mobile', () => {
    cy.viewport(375, 667);
    
    cy.visit('/');
    
    // Check mobile music player
    cy.get('[data-testid="mobile-player"]').should('be.visible');
    cy.get('[data-testid="desktop-player"]').should('not.exist');
    
    // Check mobile player controls
    cy.get('[data-testid="mobile-player"]').within(() => {
      cy.get('[data-testid="mobile-play-button"]').should('be.visible');
      cy.get('[data-testid="mobile-progress"]').should('be.visible');
      cy.get('[data-testid="mobile-volume"]').should('not.exist'); // Volume hidden on mobile
    });
  });

  it('should handle touch gestures on mobile', () => {
    cy.viewport(375, 667);
    
    cy.visit('/tracks');
    
    // Test swipe gestures on track list
    cy.get('[data-testid="track-item"]').first()
      .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      .trigger('touchmove', { touches: [{ clientX: 50, clientY: 100 }] })
      .trigger('touchend');
    
    // Should show swipe actions
    cy.get('[data-testid="swipe-actions"]').should('be.visible');
  });

  it('should maintain functionality across screen sizes', () => {
    // Test on desktop
    cy.viewport(1280, 720);
    cy.visit('/tracks');
    
    // Play track
    cy.get('[data-testid="track-item"]').first().click();
    cy.get('[data-testid="play-button"]').click();
    cy.get('[data-testid="pause-button"]').should('be.visible');
    
    // Resize to mobile
    cy.viewport(375, 667);
    
    // Should still be playing
    cy.get('[data-testid="mobile-pause-button"]').should('be.visible');
    
    // Test mobile controls
    cy.get('[data-testid="mobile-pause-button"]').click();
    cy.get('[data-testid="mobile-play-button"]').should('be.visible');
  });

  it('should handle orientation changes', () => {
    cy.viewport(667, 375); // Landscape mobile
    
    cy.visit('/');
    
    // Check landscape layout
    cy.get('[data-testid="landscape-layout"]').should('be.visible');
    
    // Rotate to portrait
    cy.viewport(375, 667);
    
    // Check portrait layout
    cy.get('[data-testid="portrait-layout"]').should('be.visible');
  });

  it('should display search correctly on mobile', () => {
    cy.viewport(375, 667);
    
    cy.visit('/');
    
    // Open mobile search
    cy.get('[data-testid="mobile-search-button"]').click();
    cy.get('[data-testid="mobile-search-modal"]').should('be.visible');
    
    // Test mobile search
    cy.get('[data-testid="mobile-search-input"]').type('test');
    cy.get('[data-testid="mobile-search-results"]').should('be.visible');
    
    // Close mobile search
    cy.get('[data-testid="mobile-search-close"]').click();
    cy.get('[data-testid="mobile-search-modal"]').should('not.exist');
  });

  it('should handle forms on mobile devices', () => {
    cy.viewport(375, 667);
    
    cy.visit('/upload');
    
    // Check mobile form layout
    cy.get('[data-testid="mobile-upload-form"]').should('be.visible');
    
    // Test form inputs on mobile
    cy.get('[data-testid="track-title"]').type('Mobile Test Track');
    cy.get('[data-testid="track-artist"]').type('Mobile Test Artist');
    
    // Test mobile file upload
    cy.get('[data-testid="mobile-file-input"]').should('be.visible');
  });

  it('should display social features correctly on mobile', () => {
    cy.viewport(375, 667);
    
    cy.visit('/tracks');
    
    // Click on track
    cy.get('[data-testid="track-item"]').first().click();
    
    // Check mobile social buttons
    cy.get('[data-testid="mobile-like-button"]').should('be.visible');
    cy.get('[data-testid="mobile-share-button"]').should('be.visible');
    cy.get('[data-testid="mobile-comment-button"]').should('be.visible');
    
    // Test mobile comments
    cy.get('[data-testid="mobile-comment-button"]').click();
    cy.get('[data-testid="mobile-comments-modal"]').should('be.visible');
  });

  it('should handle accessibility on mobile devices', () => {
    cy.viewport(375, 667);
    
    cy.visit('/');
    
    // Check mobile accessibility
    cy.get('[data-testid="mobile-menu-button"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="mobile-play-button"]').should('have.attr', 'aria-label');
    
    // Test keyboard navigation on mobile
    cy.get('body').tab();
    cy.focused().should('have.attr', 'data-testid', 'mobile-menu-button');
  });

  it('should optimize performance on mobile', () => {
    cy.viewport(375, 667);
    
    cy.visit('/tracks');
    
    // Check lazy loading on mobile
    cy.get('[data-testid="track-item"]').should('have.length', 10); // Initial load
    
    // Scroll to load more
    cy.scrollTo('bottom');
    
    // Should load more items
    cy.get('[data-testid="track-item"]').should('have.length.greaterThan', 10);
  });
});
