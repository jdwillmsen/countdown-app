import { Link } from 'react-router';
import { ThemedBackdrop } from '../../themes/themed-backdrop';
import { useDocumentTitle } from '../use-document-title';
import styles from './pages.module.scss';

export function NotFound() {
  useDocumentTitle('Not found · Countdown');
  return (
    <ThemedBackdrop theme="night">
      <div className={styles['card']}>
        <div className={styles['card-inner']}>
          <h1>Event not found</h1>
          <p>
            <Link to="/events">See all events</Link>
          </p>
        </div>
      </div>
    </ThemedBackdrop>
  );
}
