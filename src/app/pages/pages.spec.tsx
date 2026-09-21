import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, vi } from 'vitest';
import App from '../app';
import type { CountdownEvent } from '../../events/event';

const make = (
  slug: string,
  title: string,
  start: string,
  end: string,
): CountdownEvent => ({
  slug,
  title,
  start,
  end,
  theme: 'camp',
  completeMessage: `${title} Is Here!`,
});
const older = make(
  'trip-2024',
  'Trip',
  '2024-07-18T18:00:00-05:00',
  '2024-07-21T12:00:00-05:00',
);
const newer = make(
  'trip-2025',
  'Trip',
  '2025-07-17T16:30:00-05:00',
  '2025-07-20T12:00:00-05:00',
);
const list = [older, newer];

const renderAt = (path: string, now: string) => {
  vi.setSystemTime(Date.parse(now));
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App events={list} />
    </MemoryRouter>,
  );
};

describe('pages', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('home counts down to the next event', () => {
    renderAt('/', '2025-07-01T00:00:00Z');
    expect(screen.getByText('Trip Countdown')).toBeTruthy();
    expect(document.title).toBe('Trip · Countdown');
  });

  it('home says the event is here while it is live', () => {
    renderAt('/', '2025-07-18T12:00:00-05:00');
    expect(screen.getByText('Trip Is Here!')).toBeTruthy();
  });

  it('home says nothing is coming and links the latest event once all are over', () => {
    renderAt('/', '2025-09-01T00:00:00Z');
    expect(screen.getByText('No upcoming events')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Trip' }).getAttribute('href'),
    ).toBe('/events/trip-2025');
    expect(screen.getByText(/Jul 17, 2025/)).toBeTruthy();
  });

  it('home with no events at all shows only the headline', () => {
    vi.setSystemTime(Date.parse('2025-09-01T00:00:00Z'));
    render(
      <MemoryRouter initialEntries={['/']}>
        <App events={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByText('No upcoming events')).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('archive lists newest first with status badges', () => {
    renderAt('/events', '2025-07-18T12:00:00-05:00');
    const cards = screen.getAllByRole('listitem');
    expect(within(cards[0]).getByText('Jul 17, 2025')).toBeTruthy();
    expect(within(cards[0]).getByText('Happening now')).toBeTruthy();
    expect(within(cards[1]).getByText('Past')).toBeTruthy();
  });

  it('detail page for a past event says it has wrapped up', () => {
    renderAt('/events/trip-2024', '2025-09-01T00:00:00Z');
    expect(screen.getByText('Trip has wrapped up')).toBeTruthy();
    expect(screen.getByText('Jul 18, 2024')).toBeTruthy();
  });

  it('detail page for a live event still says it is here', () => {
    renderAt('/events/trip-2025', '2025-07-18T12:00:00-05:00');
    expect(screen.getByText('Trip Is Here!')).toBeTruthy();
  });

  it('unknown slugs show not-found', () => {
    renderAt('/events/nope', '2025-09-01T00:00:00Z');
    expect(screen.getByText('Event not found')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'See all events' }).getAttribute('href'),
    ).toBe('/events');
  });

  it('unknown paths show not-found', () => {
    renderAt('/nope', '2025-09-01T00:00:00Z');
    expect(screen.getByText('Event not found')).toBeTruthy();
  });
});
