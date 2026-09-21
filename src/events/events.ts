import campBackground from '../assets/camp_background.webp';
import type { CountdownEvent } from './event';

export const events: readonly CountdownEvent[] = [
  {
    slug: 'boys-weekend-2024',
    title: 'Boys Weekend',
    start: '2024-07-18T18:00:00-05:00',
    end: '2024-07-21T12:00:00-05:00',
    theme: 'camp',
    background: campBackground,
    completeMessage: 'Boys Weekend Is Here!',
  },
  {
    slug: 'boys-weekend-2025',
    title: 'Boys Weekend',
    start: '2025-07-17T16:30:00-05:00',
    end: '2025-07-20T12:00:00-05:00',
    theme: 'camp',
    background: campBackground,
    completeMessage: 'Boys Weekend Is Here!',
  },
];
