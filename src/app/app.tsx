import { Route, Routes } from 'react-router';
import styles from './app.module.scss';
import { events as configuredEvents } from '../events/events';
import type { CountdownEvent } from '../events/event';
import { HomePage } from './pages/home-page';
import { EventArchive } from './pages/event-archive';
import { EventDetail } from './pages/event-detail';
import { NotFound } from './pages/not-found';

export function App({
  events = configuredEvents,
}: {
  events?: readonly CountdownEvent[];
}) {
  const version = import.meta.env.VITE_APP_VERSION;
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage events={events} />} />
        <Route path="/events" element={<EventArchive events={events} />} />
        <Route path="/events/:slug" element={<EventDetail events={events} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {version && <small className={styles['version']}>v{version}</small>}
    </>
  );
}

export default App;
