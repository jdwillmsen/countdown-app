import { useParams } from 'react-router';
import type { CountdownEvent } from '../../events/event';
import { EventPage } from './event-page';
import { NotFound } from './not-found';

export function EventDetail({ events }: { events: readonly CountdownEvent[] }) {
  const { slug } = useParams();
  const event = events.find((e) => e.slug === slug);
  if (!event) return <NotFound />;
  return (
    <EventPage
      event={event}
      showDate
      nav={{ to: '/events', label: 'All events', arrow: 'back' }}
    />
  );
}
