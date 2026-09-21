import type { ThemeName } from '../themes/themes';

export interface CountdownEvent {
  slug: string;
  title: string;
  start: string;
  end: string;
  theme: ThemeName;
  background?: string;
  completeMessage: string;
}

export type EventStatus = 'upcoming' | 'live' | 'past';

export const startsAt = (e: CountdownEvent) => Date.parse(e.start);
export const endsAt = (e: CountdownEvent) => Date.parse(e.end);

export function statusAt(e: CountdownEvent, now: number): EventStatus {
  if (now < startsAt(e)) return 'upcoming';
  return now < endsAt(e) ? 'live' : 'past';
}

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export function formatEventDate(e: CountdownEvent): string {
  return dateFormat.format(startsAt(e));
}
