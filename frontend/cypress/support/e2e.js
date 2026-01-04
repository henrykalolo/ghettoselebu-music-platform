// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add custom commands or override existing commands
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="username"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('register', (userData) => {
  cy.visit('/register');
  cy.get('input[name="username"]').type(userData.username);
  cy.get('input[name="email"]').type(userData.email);
  cy.get('input[name="password"]').type(userData.password);
  cy.get('input[name="password_confirm"]').type(userData.password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/register');
});

// Add audio file upload command
Cypress.Commands.add('uploadAudio', (fileName, mimeType = 'audio/mp3') => {
  return cy.fixture(fileName, { encoding: null }).then(file => {
    return Cypress.Blob.base64StringToBlob(file.content, mimeType);
  });
});

// Mock audio element to prevent actual audio playback
Cypress.Commands.add('mockAudioElement', () => {
  cy.window().then((win) => {
    const mockAudio = {
      play: () => Promise.resolve(),
      pause: () => {},
      load: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      currentTime: 0,
      duration: 180,
      volume: 0.7,
      muted: false,
      paused: true,
      src: '',
    };
    
    // Mock the Audio constructor
    win.Audio = jest.fn().mockImplementation(() => mockAudio);
    
    // Mock existing audio elements
    cy.document().then((doc) => {
      const audioElements = doc.querySelectorAll('audio');
      audioElements.forEach(audio => {
        Object.assign(audio, mockAudio);
      });
    });
  });
});
