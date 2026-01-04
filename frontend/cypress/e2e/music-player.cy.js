describe('Music Player Functionality', () => {
  beforeEach(() => {
    // Mock audio element to prevent actual audio playback
    cy.mockAudioElement();
    
    // Login user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpass123'
    };
    cy.register(userData);
  });

  it('should display music player with track information', () => {
    cy.visit('/');
    
    // Check if player is visible
    cy.get('[data-testid="music-player"]').should('be.visible');
    
    // Check if track information is displayed
    cy.get('[data-testid="track-title"]').should('be.visible');
    cy.get('[data-testid="track-artist"]').should('be.visible');
  });

  it('should play and pause music when play/pause button is clicked', () => {
    cy.visit('/');
    
    // Initially should show play button
    cy.get('[data-testid="play-button"]').should('be.visible');
    cy.get('[data-testid="pause-button"]').should('not.exist');
    
    // Click play button
    cy.get('[data-testid="play-button"]').click();
    
    // Should show pause button and hide play button
    cy.get('[data-testid="pause-button"]').should('be.visible');
    cy.get('[data-testid="play-button"]').should('not.exist');
    
    // Click pause button
    cy.get('[data-testid="pause-button"]').click();
    
    // Should show play button again
    cy.get('[data-testid="play-button"]').should('be.visible');
    cy.get('[data-testid="pause-button"]').should('not.exist');
  });

  it('should navigate to next and previous tracks', () => {
    cy.visit('/');
    
    // Check navigation buttons are present
    cy.get('[data-testid="previous-button"]').should('be.visible');
    cy.get('[data-testid="next-button"]').should('be.visible');
    
    // Click next button
    cy.get('[data-testid="next-button"]').click();
    
    // Should update track information (assuming there are multiple tracks)
    cy.get('[data-testid="track-title"]').should('be.visible');
    
    // Click previous button
    cy.get('[data-testid="previous-button"]').click();
    
    // Should update track information
    cy.get('[data-testid="track-title"]').should('be.visible');
  });

  it('should adjust volume when volume slider is changed', () => {
    cy.visit('/');
    
    // Check volume controls
    cy.get('[data-testid="volume-slider"]').should('be.visible');
    cy.get('[data-testid="volume-button"]').should('be.visible');
    
    // Get initial volume
    cy.get('[data-testid="volume-slider"]').invoke('val').as('initialVolume');
    
    // Change volume
    cy.get('[data-testid="volume-slider"]').invoke('val', '0.5').trigger('input');
    
    // Verify volume changed
    cy.get('[data-testid="volume-slider"]').invoke('val').should('not.equal', '@initialVolume');
  });

  it('should mute/unmute when volume button is clicked', () => {
    cy.visit('/');
    
    // Check initial state (not muted)
    cy.get('[data-testid="volume-button"]').should('not.have.class', 'muted');
    
    // Click volume button to mute
    cy.get('[data-testid="volume-button"]').click();
    
    // Should be muted
    cy.get('[data-testid="volume-button"]').should('have.class', 'muted');
    
    // Click again to unmute
    cy.get('[data-testid="volume-button"]').click();
    
    // Should be unmuted
    cy.get('[data-testid="volume-button"]').should('not.have.class', 'muted');
  });

  it('should seek when progress bar is clicked', () => {
    cy.visit('/');
    
    // Check progress bar
    cy.get('[data-testid="progress-bar"]').should('be.visible');
    
    // Click on progress bar to seek
    cy.get('[data-testid="progress-bar"]').click('center');
    
    // Should update current time
    cy.get('[data-testid="current-time"]').should('be.visible');
  });

  it('should display time information correctly', () => {
    cy.visit('/');
    
    // Check time displays
    cy.get('[data-testid="current-time"]').should('be.visible');
    cy.get('[data-testid="total-time"]').should('be.visible');
    
    // Should display in MM:SS format
    cy.get('[data-testid="current-time"]').should('match', /\d{1,2}:\d{2}/);
    cy.get('[data-testid="total-time"]').should('match', /\d{1,2}:\d{2}/);
  });

  it('should handle track selection from track list', () => {
    cy.visit('/');
    
    // Navigate to tracks page
    cy.get('[data-testid="nav-tracks"]').click();
    cy.url().should('include', '/tracks');
    
    // Click on first track
    cy.get('[data-testid="track-item"]').first().click();
    
    // Should navigate to track detail page
    cy.url().should('match', /\/tracks\/[^\/]+/);
    
    // Click play button on track detail page
    cy.get('[data-testid="play-track-button"]').click();
    
    // Should start playing the track
    cy.get('[data-testid="pause-button"]').should('be.visible');
  });

  it('should handle audio loading states', () => {
    cy.visit('/');
    
    // Check if loading state is handled
    cy.get('[data-testid="music-player"]').should('be.visible');
    
    // Should not show loading state initially
    cy.get('[data-testid="loading-indicator"]').should('not.exist');
    
    // Simulate loading a new track
    cy.get('[data-testid="track-item"]').first().click();
    
    // Should handle loading appropriately
    cy.get('[data-testid="music-player"]').should('be.visible');
  });

  it('should handle empty playlist gracefully', () => {
    // Clear any existing tracks (this would depend on your implementation)
    cy.visit('/');
    
    // Player should still be visible even with no tracks
    cy.get('[data-testid="music-player"]').should('be.visible');
    
    // Should show appropriate empty state
    cy.get('[data-testid="no-tracks-message"]').should('be.visible');
  });

  it('should maintain playback state during navigation', () => {
    cy.visit('/');
    
    // Start playing a track
    cy.get('[data-testid="play-button"]').click();
    cy.get('[data-testid="pause-button"]').should('be.visible');
    
    // Navigate to different page
    cy.get('[data-testid="nav-artists"]').click();
    cy.url().should('include', '/artists');
    
    // Player should still be visible and playing
    cy.get('[data-testid="music-player"]').should('be.visible');
    cy.get('[data-testid="pause-button"]').should('be.visible');
  });
});
