// Pinned to the shipped config in src/events/events.ts, so the assertions stay
// the same no matter when the suite runs.
const START_2025 = Date.parse('2025-07-17T16:30:00-05:00');
const END_2025 = Date.parse('2025-07-20T12:00:00-05:00');

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('home', () => {
  it('counts down to the next event', () => {
    cy.clock(START_2025 - (2 * DAY + 3 * HOUR + 4 * MINUTE + 5 * SECOND));
    cy.visit('/');
    cy.contains('Boys Weekend Countdown');
    cy.contains('Days').prev().should('have.text', '2');
    cy.contains('Hours').prev().should('have.text', '3');
    cy.contains('Minutes').prev().should('have.text', '4');
    cy.contains('Seconds').prev().should('have.text', '5');
  });

  it('says the event is here while it is live', () => {
    cy.clock(START_2025 + HOUR);
    cy.visit('/');
    cy.contains('Boys Weekend Is Here!');
    cy.contains('Days').should('not.exist');
  });

  it('says nothing is coming up once the last event is over', () => {
    cy.clock(END_2025 + DAY);
    cy.visit('/');
    cy.contains('No upcoming events');
    cy.contains('a', 'Boys Weekend').click();
    cy.location('pathname').should('eq', '/events/boys-weekend-2025');
    cy.contains('Boys Weekend has wrapped up');
    cy.contains('Jul 17, 2025');
  });
});

describe('archive', () => {
  it('lists events newest first', () => {
    cy.clock(END_2025 + DAY);
    cy.visit('/events');
    cy.get('li').should('have.length', 2);
    cy.get('li')
      .first()
      .should('contain', 'Jul 17, 2025')
      .and('contain', 'Past');
    cy.get('li').last().should('contain', 'Jul 18, 2024');
  });

  it('deep-links to a single event', () => {
    cy.clock(END_2025 + DAY);
    cy.visit('/events/boys-weekend-2024');
    cy.contains('Boys Weekend has wrapped up');
    cy.contains('Jul 18, 2024');
  });

  it('shows not-found for an unknown event', () => {
    cy.clock(END_2025 + DAY);
    cy.visit('/events/nope');
    cy.contains('Event not found');
  });

  it('shows not-found for an unknown path', () => {
    cy.clock(END_2025 + DAY);
    cy.visit('/nope');
    cy.contains('Event not found');
  });
});
