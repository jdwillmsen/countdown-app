import {
  endsAt,
  formatEventDates,
  formatEventRange,
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
  timeZone: 'America/Chicago',
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

  // Intl pads the range dash with thin spaces; compare the words, not the glyphs.
  const words = (s: string) => s.replace(/\s+/g, ' ');

  it('formats the days the event spans', () => {
    expect(words(formatEventDates(event))).toBe('Jul 17 – 20, 2025');
  });

  it('formats the full range with times and zone', () => {
    expect(words(formatEventRange(event))).toBe(
      'Thu, Jul 17, 2025, 4:30 PM CDT – Sun, Jul 20, 2025, 12:00 PM CDT',
    );
  });

  it("shows times in the event's time zone, not the viewer's", () => {
    const west = { ...event, timeZone: 'America/Los_Angeles' };
    expect(words(formatEventRange(west))).toBe(
      'Thu, Jul 17, 2025, 2:30 PM PDT – Sun, Jul 20, 2025, 10:00 AM PDT',
    );
  });
});
