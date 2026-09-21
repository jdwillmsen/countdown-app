import { useState } from 'react';
import type { CountdownEvent } from '../../events/event';
import { selectHome } from '../../events/home';
import { EventPage } from './event-page';
import { NoUpcoming } from './no-upcoming';

export function HomePage({ events }: { events: readonly CountdownEvent[] }) {
  // Read the clock once per visit (not during render, for the react-hooks
  // purity rule). The timer handles the switch at start by itself; the
  // switch at end shows on the next load, which is fine for a
  // weekend-long window.
  const [now] = useState(() => Date.now());
  const state = selectHome(events, now);
  if (state.kind === 'none') return <NoUpcoming lastPast={state.lastPast} />;
  return (
    <EventPage
      event={state.event}
      nav={{ to: '/events', label: 'Past events', arrow: 'forward' }}
    />
  );
}
