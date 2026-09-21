import {
  endsAt,
  formatEventDate,
  startsAt,
  statusAt,
  type CountdownEvent,
} from './event';

const event: CountdownEvent = {
  slug: 'e',
  title: 'E',
  start: '2025-07-17T16:30:00-05:00',
  end: '2025-07-20T12:00:00-05:00',
  theme: 'camp',
  completeMessage: 'Here',
};

describe('event', () => {
  it('reads the offset, not the viewer time zone', () => {
    expect(startsAt(event)).toBe(Date.UTC(2025, 6, 17, 21, 30));
    expect(endsAt(event)).toBe(Date.UTC(2025, 6, 20, 17, 0));
  });

  it('is upcoming before start, live from start until end, past from end', () => {
    expect(statusAt(event, startsAt(event) - 1)).toBe('upcoming');
    expect(statusAt(event, startsAt(event))).toBe('live');
    expect(statusAt(event, endsAt(event) - 1)).toBe('live');
    expect(statusAt(event, endsAt(event))).toBe('past');
  });

  it('formats the start date', () => {
    expect(formatEventDate(event)).toBe('Jul 17, 2025');
  });
});
