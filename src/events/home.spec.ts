import type { CountdownEvent } from './event';
import { selectHome } from './home';

const make = (slug: string, start: string, end: string): CountdownEvent => ({
  slug,
  title: slug,
  start,
  end,
  theme: 'camp',
  timeZone: 'America/Chicago',
  completeMessage: 'Here',
});

const y24 = make(
  'y24',
  '2024-07-18T18:00:00-05:00',
  '2024-07-21T12:00:00-05:00',
);
const y25 = make(
  'y25',
  '2025-07-17T16:30:00-05:00',
  '2025-07-20T12:00:00-05:00',
);
const y26 = make(
  'y26',
  '2026-07-16T17:00:00-05:00',
  '2026-07-19T12:00:00-05:00',
);
const at = (iso: string) => Date.parse(iso);

describe('selectHome', () => {
  it('is none with no last event when there are no events', () => {
    expect(selectHome([], at('2025-01-01T00:00:00Z'))).toEqual({
      kind: 'none',
      lastPast: undefined,
    });
  });

  it('is none pointing at the most recent past event when all are over', () => {
    expect(selectHome([y25, y24], at('2025-09-01T00:00:00Z'))).toEqual({
      kind: 'none',
      lastPast: y25,
    });
  });

  it('counts down to the earliest upcoming event', () => {
    expect(selectHome([y26, y25], at('2025-01-01T00:00:00Z'))).toEqual({
      kind: 'upcoming',
      event: y25,
    });
  });

  it('is live from exactly start, and no longer live at exactly end', () => {
    expect(selectHome([y25], Date.parse(y25.start))).toEqual({
      kind: 'live',
      event: y25,
    });
    expect(selectHome([y25], Date.parse(y25.end))).toEqual({
      kind: 'none',
      lastPast: y25,
    });
  });

  it('prefers the live event over a later upcoming one', () => {
    expect(selectHome([y26, y25], at('2025-07-18T12:00:00-05:00'))).toEqual({
      kind: 'live',
      event: y25,
    });
  });

  it('picks the most recently started of two overlapping live events', () => {
    const early = make('early', '2025-07-17T00:00:00Z', '2025-07-25T00:00:00Z');
    const late = make('late', '2025-07-18T00:00:00Z', '2025-07-20T00:00:00Z');
    expect(selectHome([early, late], at('2025-07-19T00:00:00Z'))).toEqual({
      kind: 'live',
      event: late,
    });
  });
});
