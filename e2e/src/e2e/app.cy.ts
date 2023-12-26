describe('e2e', () => {
  beforeEach(() => cy.visit('/'));

  it('should be setup correctly', () => {
    if (new Date('07/18/2024 18:00:00').getTime() - new Date().getTime() > 0) {
      cy.contains('Boys Weekend Countdown');
      cy.contains('Days');
      cy.contains('Hours');
      cy.contains('Minutes');
      cy.contains('Seconds');
    } else {
      cy.contains('Boys Weekend Is Here!');
    }
  });
});
