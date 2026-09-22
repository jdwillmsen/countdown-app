import campBackground from '../assets/camp_background.webp';
import type { CountdownEvent } from './event';

export const events: readonly CountdownEvent[] = [
  {
    slug: 'boys-weekend-2024',
    title: 'Boys Weekend',
    start: '2024-07-18T18:00:00-05:00',
    end: '2024-07-21T20:00:00-05:00',
    theme: 'camp',
    timeZone: 'America/Chicago',
    background: campBackground,
    completeMessage: 'Boys Weekend Is Here!',
  },
  {
    slug: 'boys-weekend-2025',
    title: 'Boys Weekend',
    start: '2025-07-17T18:00:00-05:00',
    end: '2025-07-20T20:00:00-05:00',
    theme: 'camp',
    timeZone: 'America/Chicago',
    background: campBackground,
    completeMessage: 'Boys Weekend Is Here!',
  },
  {
    slug: 'boys-weekend-2026',
    title: 'Boys Weekend',
    start: '2026-07-16T16:00:00-05:00',
    end: '2026-07-19T20:00:00-05:00',
    theme: 'camp',
    timeZone: 'America/Chicago',
    background: campBackground,
    completeMessage: 'Boys Weekend Is Here!',
  },
];
