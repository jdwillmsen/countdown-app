// Must match the target date in src/app/app.tsx. The clock is pinned relative
// to it so the spec asserts the same thing whether the event is past or future.
const TARGET = new Date('07/17/2025 16:30:00').getTime();

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('countdown', () => {
  it('counts down to the event', () => {
    cy.clock(TARGET - (2 * DAY + 3 * HOUR + 4 * MINUTE + 6 * SECOND));
    cy.visit('/');
    // The timer reads the clock only on its one-second interval, which exists
    // once the component has mounted -- tick before that and nothing happens.
    cy.contains('Boys Weekend Countdown');
    cy.tick(SECOND);

    cy.contains('Days').prev().should('have.text', '2');
    cy.contains('Hours').prev().should('have.text', '3');
    cy.contains('Minutes').prev().should('have.text', '4');
    cy.contains('Seconds').prev().should('have.text', '5');
  });

  it('shows the complete message once the event has started', () => {
    cy.clock(TARGET + HOUR);
    cy.visit('/');
    // The synchronous first render already reflects the elapsed target, so
    // the complete message appears without waiting for a tick.
    cy.contains('Boys Weekend Is Here!');
    cy.contains('Days').should('not.exist');
  });
});
