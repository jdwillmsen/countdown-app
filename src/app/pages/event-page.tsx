import { useState } from 'react';
import { Link } from 'react-router';
import { ThemedBackdrop } from '../../themes/themed-backdrop';
import {
  formatEventDate,
  statusAt,
  type CountdownEvent,
} from '../../events/event';
import CountdownTimer from '../countdown-timer/countdown-timer';
import { useDocumentTitle } from '../use-document-title';
import styles from './pages.module.scss';

export interface EventPageProps {
  event: CountdownEvent;
  showDate?: boolean;
  nav: { to: string; label: string };
}

export function EventPage({ event, showDate, nav }: EventPageProps) {
  useDocumentTitle(`${event.title} · Countdown`);
  // Read the clock once per visit (not during render, for the react-hooks
  // purity rule), same pattern as home-page/event-archive.
  const [now] = useState(() => Date.now());
  // A past event never shows a stale "Is Here!" — its complete message only
  // applies while the event is live (spec: completeMessage runs start..end).
  const completeMessage =
    statusAt(event, now) === 'past'
      ? `${event.title} has wrapped up`
      : event.completeMessage;
  return (
    <ThemedBackdrop theme={event.theme} image={event.background}>
      <CountdownTimer
        title={`${event.title} Countdown`}
        targetDate={new Date(event.start)}
        completeMessage={completeMessage}
        date={showDate ? formatEventDate(event) : undefined}
      />
      <Link className={styles['nav']} to={nav.to}>
        {nav.label}
      </Link>
    </ThemedBackdrop>
  );
}
