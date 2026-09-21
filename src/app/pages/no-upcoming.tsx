import { Link } from 'react-router';
import { ThemedBackdrop } from '../../themes/themed-backdrop';
import { formatEventDate, type CountdownEvent } from '../../events/event';
import { useDocumentTitle } from '../use-document-title';
import styles from './pages.module.scss';

export function NoUpcoming({ lastPast }: { lastPast?: CountdownEvent }) {
  useDocumentTitle('Countdown');
  return (
    <ThemedBackdrop theme="night">
      <div className={styles['card']}>
        <div className={styles['card-inner']}>
          <h1>No upcoming events</h1>
          {lastPast && (
            <>
              <p>
                Last up:{' '}
                <Link to={`/events/${lastPast.slug}`}>{lastPast.title}</Link> ·{' '}
                {formatEventDate(lastPast)}
              </p>
              <p>
                <Link to="/events">See past events</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </ThemedBackdrop>
  );
}
