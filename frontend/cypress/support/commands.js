// Custom commands for Cypress testing

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Custom command for checking if audio is playing
Cypress.Commands.add('isAudioPlaying', () => {
  cy.get('audio').then(($audio) => {
    const audio = $audio[0];
    return !audio.paused;
  });
});

// Custom command for checking if audio is paused
Cypress.Commands.add('isAudioPaused', () => {
  cy.get('audio').then(($audio) => {
    const audio = $audio[0];
    return audio.paused;
  });
});

// Custom command for getting current playback time
Cypress.Commands.add('getCurrentTime', () => {
  cy.get('audio').then(($audio) => {
    return $audio[0].currentTime;
  });
});

// Custom command for getting audio duration
Cypress.Commands.add('getDuration', () => {
  cy.get('audio').then(($audio) => {
    return $audio[0].duration;
  });
});

// Custom command for seeking to specific time
Cypress.Commands.add('seekTo', (time) => {
  cy.get('audio').then(($audio) => {
    $audio[0].currentTime = time;
  });
});

// Custom command for setting volume
Cypress.Commands.add('setVolume', (volume) => {
  cy.get('audio').then(($audio) => {
    $audio[0].volume = volume;
  });
});

// Custom command for checking if user is authenticated
Cypress.Commands.add('isAuthenticated', () => {
  cy.window().then((win) => {
    return !!win.localStorage.getItem('access_token');
  });
});

// Custom command for getting user profile
Cypress.Commands.add('getUserProfile', () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('access_token');
    if (token) {
      // Parse JWT token to get user info (simplified)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    }
    return null;
  });
});

// Custom command for waiting for audio to load
Cypress.Commands.add('waitForAudioLoad', () => {
  cy.get('audio').should('have.attr', 'src').and('not.be.empty');
  cy.get('audio', { timeout: 10000 }).should(($audio) => {
    expect($audio[0].duration).to.be.greaterThan(0);
  });
});

// Custom command for simulating audio playback
Cypress.Commands.add('simulatePlayback', (duration = 5000) => {
  cy.mockAudioElement();
  cy.get('audio').then(($audio) => {
    const audio = $audio[0];
    audio.paused = false;
    audio.currentTime = 0;
    
    // Simulate time progression
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      audio.currentTime = Math.min(elapsed / 1000, audio.duration);
      
      if (audio.currentTime >= audio.duration) {
        clearInterval(interval);
        audio.paused = true;
        audio.currentTime = 0;
      }
    }, 100);
    
    // Clear interval after duration
    setTimeout(() => clearInterval(interval), duration);
  });
});

// Custom command for checking if element is visible in viewport
Cypress.Commands.add('isInViewport', () => {
  cy.get('@element').then(($el) => {
    const rect = $el[0].getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });
});
