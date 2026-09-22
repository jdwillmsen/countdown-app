import type { ThemeName } from '../themes/themes';

export interface CountdownEvent {
  slug: string;
  title: string;
  start: string;
  end: string;
  theme: ThemeName;
  // IANA zone the event happens in; dates and times display in it, so
  // everyone sees the local time of the event rather than their own.
  timeZone: string;
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

export function formatEventDates(e: CountdownEvent): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeZone: e.timeZone,
  }).formatRange(startsAt(e), endsAt(e));
}

export function formatEventRange(e: CountdownEvent): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: e.timeZone,
    timeZoneName: 'short',
  }).formatRange(startsAt(e), endsAt(e));
}
