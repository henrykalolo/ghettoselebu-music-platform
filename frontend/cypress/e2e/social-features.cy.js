describe('Social Features', () => {
  beforeEach(() => {
    // Login user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpass123'
    };
    cy.register(userData);
  });

  it('should like and unlike tracks', () => {
    cy.visit('/tracks');
    
    // Click on first track
    cy.get('[data-testid="track-item"]').first().click();
    
    // Check initial like state
    cy.get('[data-testid="like-button"]').should('be.visible');
    cy.get('[data-testid="like-button"]').should('not.have.class', 'liked');
    
    // Like the track
    cy.get('[data-testid="like-button"]').click();
    
    // Should show liked state
    cy.get('[data-testid="like-button"]').should('have.class', 'liked');
    cy.get('[data-testid="like-count"]').should('contain', '1');
    
    // Unlike the track
    cy.get('[data-testid="like-button"]').click();
    
    // Should show unliked state
    cy.get('[data-testid="like-button"]').should('not.have.class', 'liked');
  });

  it('should add comments to tracks', () => {
    cy.visit('/tracks');
    
    // Click on first track
    cy.get('[data-testid="track-item"]').first().click();
    
    // Check comment section
    cy.get('[data-testid="comments-section"]').should('be.visible');
    
    // Add a comment
    cy.get('[data-testid="comment-input"]').type('Great track! Love the vibe.');
    cy.get('[data-testid="comment-submit"]').click();
    
    // Should show new comment
    cy.get('[data-testid="comment-item"]').should('contain', 'Great track! Love the vibe.');
    cy.get('[data-testid="comment-item"]').should('contain', 'testuser');
  });

  it('should reply to comments', () => {
    cy.visit('/tracks');
    
    // Click on first track
    cy.get('[data-testid="track-item"]').first().click();
    
    // Add initial comment
    cy.get('[data-testid="comment-input"]').type('Original comment');
    cy.get('[data-testid="comment-submit"]').click();
    
    // Reply to the comment
    cy.get('[data-testid="comment-item"]').first().within(() => {
      cy.get('[data-testid="reply-button"]').click();
    });
    
    cy.get('[data-testid="reply-input"]').type('This is a reply');
    cy.get('[data-testid="reply-submit"]').click();
    
    // Should show reply
    cy.get('[data-testid="reply-item"]').should('contain', 'This is a reply');
  });

  it('should share content', () => {
    cy.visit('/tracks');
    
    // Click on first track
    cy.get('[data-testid="track-item"]').first().click();
    
    // Click share button
    cy.get('[data-testid="share-button"]').click();
    
    // Should open share modal
    cy.get('[data-testid="share-modal"]').should('be.visible');
    
    // Add caption and share
    cy.get('[data-testid="share-caption"]').type('Check out this amazing track!');
    cy.get('[data-testid="share-submit"]').click();
    
    // Should close modal and show success message
    cy.get('[data-testid="share-modal"]').should('not.exist');
    cy.get('[data-testid="success-message"]').should('contain', 'Shared successfully');
  });

  it('should follow and unfollow artists', () => {
    cy.visit('/artists');
    
    // Click on first artist
    cy.get('[data-testid="artist-item"]').first().click();
    
    // Check initial follow state
    cy.get('[data-testid="follow-button"]').should('be.visible');
    cy.get('[data-testid="follow-button"]').should('contain', 'Follow');
    
    // Follow the artist
    cy.get('[data-testid="follow-button"]').click();
    
    // Should show following state
    cy.get('[data-testid="follow-button"]').should('contain', 'Following');
    cy.get('[data-testid="followers-count"]').should('contain', '1');
    
    // Unfollow the artist
    cy.get('[data-testid="follow-button"]').click();
    
    // Should show follow state again
    cy.get('[data-testid="follow-button"]').should('contain', 'Follow');
  });

  it('should create and manage playlists', () => {
    cy.visit('/playlists');
    
    // Create new playlist
    cy.get('[data-testid="create-playlist-button"]').click();
    
    // Fill playlist details
    cy.get('[data-testid="playlist-name"]').type('My Favorite Tracks');
    cy.get('[data-testid="playlist-description"]').type('A collection of my favorite songs');
    cy.get('[data-testid="playlist-submit"]').click();
    
    // Should navigate to playlist detail page
    cy.url().should('match', /\/playlists\/[^\/]+/);
    cy.get('[data-testid="playlist-title"]').should('contain', 'My Favorite Tracks');
    
    // Add tracks to playlist
    cy.get('[data-testid="add-tracks-button"]').click();
    
    // Select tracks and add them
    cy.get('[data-testid="track-checkbox"]').first().check();
    cy.get('[data-testid="add-selected-tracks"]').click();
    
    // Should show tracks in playlist
    cy.get('[data-testid="playlist-tracks"]').should('have.length.greaterThan', 0);
  });

  it('should display user profile with activity', () => {
    cy.visit('/profile');
    
    // Check profile information
    cy.get('[data-testid="profile-username"]').should('contain', 'testuser');
    cy.get('[data-testid="profile-email"]').should('contain', 'test@example.com');
    
    // Check activity sections
    cy.get('[data-testid="recent-activity"]').should('be.visible');
    cy.get('[data-testid="favorite-tracks"]').should('be.visible');
    cy.get('[data-testid="playlists"]').should('be.visible');
  });

  it('should display user feed with social activity', () => {
    cy.visit('/feed');
    
    // Check feed items
    cy.get('[data-testid="feed-item"]').should('have.length.greaterThan', 0);
    
    // Check feed item content
    cy.get('[data-testid="feed-item"]').first().within(() => {
      cy.get('[data-testid="feed-user"]').should('be.visible');
      cy.get('[data-testid="feed-action"]').should('be.visible');
      cy.get('[data-testid="feed-content"]').should('be.visible');
    });
  });

  it('should handle notifications', () => {
    cy.visit('/notifications');
    
    // Check notifications section
    cy.get('[data-testid="notifications-list"]').should('be.visible');
    
    // Should show notification types
    cy.get('[data-testid="notification-item"]').should('have.length.greaterThan', 0);
    
    // Mark notification as read
    cy.get('[data-testid="notification-item"]').first().within(() => {
      cy.get('[data-testid="mark-read"]').click();
    });
    
    // Should update notification state
    cy.get('[data-testid="notification-item"]').first().should('have.class', 'read');
  });

  it('should search and follow other users', () => {
    cy.visit('/search');
    
    // Search for users
    cy.get('[data-testid="search-type"]').select('Users');
    cy.get('[data-testid="search-input"]').type('test');
    cy.get('[data-testid="search-submit"]').click();
    
    // Should show user results
    cy.get('[data-testid="user-item"]').should('have.length.greaterThan', 0);
    
    // Follow a user
    cy.get('[data-testid="user-item"]').first().within(() => {
      cy.get('[data-testid="follow-user"]').click();
    });
    
    // Should update follow state
    cy.get('[data-testid="user-item"]').first().within(() => {
      cy.get('[data-testid="follow-user"]').should('contain', 'Following');
    });
  });

  it('should handle social interactions on mobile', () => {
    // Simulate mobile viewport
    cy.viewport(375, 667);
    
    cy.visit('/tracks');
    
    // Click on first track
    cy.get('[data-testid="track-item"]').first().click();
    
    // Should show mobile-optimized social buttons
    cy.get('[data-testid="mobile-like-button"]').should('be.visible');
    cy.get('[data-testid="mobile-share-button"]').should('be.visible');
    
    // Test mobile interactions
    cy.get('[data-testid="mobile-like-button"]').click();
    cy.get('[data-testid="mobile-like-button"]').should('have.class', 'liked');
  });
});
