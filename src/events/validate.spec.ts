import type { CountdownEvent } from './event';
import { events } from './events';
import { validateEvents } from './validate';

const ok: CountdownEvent = {
  slug: 'a-b',
  title: 'A',
  start: '2025-07-17T16:30:00-05:00',
  end: '2025-07-20T12:00:00-05:00',
  theme: 'camp',
  completeMessage: 'Here',
};

describe('validateEvents', () => {
  it('accepts the shipped config', () => {
    expect(validateEvents(events)).toEqual([]);
  });

  it('rejects duplicate slugs', () => {
    expect(validateEvents([ok, ok])).toEqual(['a-b: duplicate slug']);
  });

  it('rejects slugs that are not kebab-case', () => {
    expect(validateEvents([{ ...ok, slug: 'A B' }])).toEqual([
      'A B: slug must be kebab-case',
    ]);
  });

  it('rejects dates without an offset', () => {
    expect(validateEvents([{ ...ok, start: '2025-07-17T16:30:00' }])).toEqual([
      'a-b: start must be ISO 8601 with an offset',
    ]);
  });

  it('rejects an end that is not after the start', () => {
    expect(validateEvents([{ ...ok, end: ok.start }])).toEqual([
      'a-b: end must be after start',
    ]);
  });

  it('rejects unknown themes', () => {
    expect(
      validateEvents([{ ...ok, theme: 'disco' as CountdownEvent['theme'] }]),
    ).toEqual(['a-b: unknown theme "disco"']);
  });
});
