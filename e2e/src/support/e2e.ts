// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands';

// The PWA's service worker installs on the first visit and serves index.html
// from its cache on later ones, bypassing what Cypress injects into the page,
// so cy.clock never reaches the app and it renders against the real date.
// These tests do not exercise the worker, so keep it from registering.
Cypress.on('window:before:load', (win) => {
  delete (Object.getPrototypeOf(win.navigator) as { serviceWorker?: unknown })
    .serviceWorker;
});
