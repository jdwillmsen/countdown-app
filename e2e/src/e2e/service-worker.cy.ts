// Pinned to the shipped config in src/events/events.ts: an hour into Boys
// Weekend 2026.
const LIVE_2026 = Date.parse('2026-07-16T17:00:00-05:00');

describe('service worker', () => {
  it('never takes over the page, so cy.clock reaches every visit', () => {
    cy.visit('/');
    // Give a worker every chance to install and claim the page, which in a
    // normal run only happens when the runner is slow enough.
    cy.window().then({ timeout: 30000 }, (win) => {
      const sw = win.navigator.serviceWorker;
      if (!sw) return;
      return sw.ready.then(
        () =>
          sw.controller ??
          new Promise((resolve) =>
            sw.addEventListener('controllerchange', resolve, { once: true }),
          ),
      );
    });
    cy.clock(LIVE_2026);
    cy.visit('/');
    cy.contains('Boys Weekend Is Here!');
  });
});
