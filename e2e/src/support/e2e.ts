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

// A property on the page's global rather than a WeakSet of windows: the AUT
// iframe's contentWindow keeps its identity across navigations, but its
// globals are fresh for every page.
const HOOKED = '__cypressBeforeLoadRan';
type Hookable = Window & { [HOOKED]?: true };

// Once the PWA's service worker has installed and claimed the page, it answers
// later navigations from its precache, so they never reach the Cypress proxy
// that injects the window:before:load hook. cy.clock then never reaches the
// app, which renders against the real date. Registration is slow through the
// proxy, so whether the worker takes over mid-spec, and which test it hits,
// depends on runner timing. These tests do not exercise the worker, so keep
// it from registering at all.
Cypress.on('window:before:load', (win) => {
  (win as Hookable)[HOOKED] = true;
  delete (Object.getPrototypeOf(win.navigator) as { serviceWorker?: unknown })
    .serviceWorker;
});

// A page that skipped the hook runs on the real clock, and a test whose
// assertions also hold for today's date passes without having tested
// anything. Fail the visit instead.
Cypress.Commands.overwrite('visit', (visit, ...args) =>
  visit(...args).then((win) => {
    if (!(win as Hookable)[HOOKED]) {
      throw new Error(
        "This page loaded without Cypress's window:before:load hook, so cy.clock and other stubs never reached it. Is a service worker serving it from cache?",
      );
    }
    return win;
  }),
);
