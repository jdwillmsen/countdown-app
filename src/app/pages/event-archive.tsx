import type { CSSProperties } from 'react';
import { useState } from 'react';
import { Link } from 'react-router';
import { ThemedBackdrop } from '../../themes/themed-backdrop';
import { themes } from '../../themes/themes';
import {
  formatEventRange,
  startsAt,
  statusAt,
  type CountdownEvent,
} from '../../events/event';
import { useDocumentTitle } from '../use-document-title';
import styles from './pages.module.scss';

const BADGE = {
  upcoming: 'Upcoming',
  live: 'Happening now',
  past: 'Past',
} as const;

export function EventArchive({
  events,
}: {
  events: readonly CountdownEvent[];
}) {
  useDocumentTitle('Events · Countdown');
  // Read the clock once per visit (not during render, for the react-hooks
  // purity rule) so every tile's badge reflects the same instant.
  const [now] = useState(() => Date.now());
  const sorted = [...events].sort((a, b) => startsAt(b) - startsAt(a));
  return (
    <ThemedBackdrop theme="night">
      <main className={styles['archive']}>
        <h1>Events</h1>
        <ul className={styles['grid']} role="list">
          {sorted.map((e) => (
            <li key={e.slug}>
              <Link
                to={`/events/${e.slug}`}
                className={styles['tile']}
                style={themes[e.theme].vars as CSSProperties}
              >
                <div
                  className={styles['thumb']}
                  style={{
                    backgroundImage: e.background
                      ? `url(${e.background})`
                      : themes[e.theme].backdrop,
                  }}
                />
                <div className={styles['tile-body']}>
                  <strong>{e.title}</strong>
                  <span>{formatEventRange(e)}</span>
                  <span className={styles['badge']}>
                    {BADGE[statusAt(e, now)]}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <Link className={styles['nav']} to="/">
          <span aria-hidden="true">← </span>Home
        </Link>
      </main>
    </ThemedBackdrop>
  );
}
