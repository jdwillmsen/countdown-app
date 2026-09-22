import { themes } from '../themes/themes';
import { endsAt, startsAt, type CountdownEvent } from './event';

// An offset is mandatory: without one the date is read in each viewer's own
// time zone, and people in different zones count down to different instants.
const ISO_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/;
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function validateEvents(list: readonly CountdownEvent[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const e of list) {
    if (seen.has(e.slug)) errors.push(`${e.slug}: duplicate slug`);
    seen.add(e.slug);
    if (!KEBAB.test(e.slug)) errors.push(`${e.slug}: slug must be kebab-case`);
    for (const field of ['start', 'end'] as const) {
      if (
        !ISO_WITH_OFFSET.test(e[field]) ||
        Number.isNaN(Date.parse(e[field]))
      ) {
        errors.push(`${e.slug}: ${field} must be ISO 8601 with an offset`);
      }
    }
    if (endsAt(e) <= startsAt(e))
      errors.push(`${e.slug}: end must be after start`);
    if (!isTimeZone(e.timeZone)) {
      errors.push(`${e.slug}: unknown time zone "${e.timeZone}"`);
    }
    if (!(e.theme in themes))
      errors.push(`${e.slug}: unknown theme "${e.theme as string}"`);
  }
  return errors;
}

function isTimeZone(zone: string): boolean {
  // An undefined zone is silently the viewer's own, so it must be named.
  if (!zone) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}
