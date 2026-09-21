import { endsAt, startsAt, statusAt, type CountdownEvent } from './event';

export type HomeState =
  | { kind: 'live'; event: CountdownEvent }
  | { kind: 'upcoming'; event: CountdownEvent }
  | { kind: 'none'; lastPast?: CountdownEvent };

export function selectHome(
  list: readonly CountdownEvent[],
  now: number,
): HomeState {
  const byStatus = (s: string) => list.filter((e) => statusAt(e, now) === s);

  // A live event beats an upcoming one, so the page keeps saying "Is Here!"
  // for the whole weekend and does not jump to next year's countdown.
  const live = byStatus('live').sort((a, b) => startsAt(b) - startsAt(a))[0];
  if (live) return { kind: 'live', event: live };

  const upcoming = byStatus('upcoming').sort(
    (a, b) => startsAt(a) - startsAt(b),
  )[0];
  if (upcoming) return { kind: 'upcoming', event: upcoming };

  const lastPast = byStatus('past').sort((a, b) => endsAt(b) - endsAt(a))[0];
  return { kind: 'none', lastPast };
}
