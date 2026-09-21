import { Link } from 'react-router';
import { ThemedBackdrop } from '../../themes/themed-backdrop';
import { formatEventDate, type CountdownEvent } from '../../events/event';
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
  return (
    <ThemedBackdrop theme={event.theme} image={event.background}>
      <CountdownTimer
        title={`${event.title} Countdown`}
        targetDate={new Date(event.start)}
        completeMessage={event.completeMessage}
        date={showDate ? formatEventDate(event) : undefined}
      />
      <Link className={styles['nav']} to={nav.to}>
        {nav.label}
      </Link>
    </ThemedBackdrop>
  );
}
