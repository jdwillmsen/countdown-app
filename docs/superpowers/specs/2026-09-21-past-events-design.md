# Past events — design

## Goal

The app counts down to one hardcoded event. Once that event passes, the site
only says it has arrived, and nothing remembers earlier events. This design
lets the app hold many events. Each event has its own background, theme and
countdown. The home page keeps its current single-countdown feel, and a
separate archive lists past events.

## Decisions

| Question          | Decision                                                                                |
| ----------------- | --------------------------------------------------------------------------------------- |
| Where events live | A typed config file in the repo. Adding an event means a PR, then an automatic release. |
| Navigation        | `/` shows the featured event, `/events` the archive, `/events/:slug` one event.         |
| Theme             | Named presets. An event picks one by name and never sets raw colors.                    |
| Router            | React Router v7, library mode.                                                          |
| Seed data         | Boys Weekend 2024 and 2025, recovered from git history.                                 |

No backend, no admin UI, and no per-event color overrides. Each of these can
be added later without changing the shape of the event config.

## Data model

`src/events/events.ts` exports `events: readonly CountdownEvent[]`.

```ts
export interface CountdownEvent {
  slug: string; // URL segment, unique, kebab-case
  title: string; // shown above the timer
  start: string; // ISO 8601 with an explicit offset
  theme: ThemeName; // key into the theme presets
  background?: string; // imported asset URL; falls back to the theme's default
  completeMessage: string; // shown once `start` has passed
}
```

`start` must include an offset (`2025-07-17T16:30:00-05:00`). The current
code builds `new Date('07/17/2025 16:30:00')`, which is parsed in the
_viewer's_ time zone, so anyone outside the host's zone sees a countdown that
is off by their UTC difference. An explicit offset means everyone counts down
to the same instant.

Seed data:

| slug                | title        | start                     | theme |
| ------------------- | ------------ | ------------------------- | ----- |
| `boys-weekend-2024` | Boys Weekend | 2024-07-18T18:00:00-05:00 | camp  |
| `boys-weekend-2025` | Boys Weekend | 2025-07-17T16:30:00-05:00 | camp  |

Both use `camp_background.webp` and the message "Boys Weekend Is Here!".

A unit test validates the config. Slugs must be unique and kebab-case, every
`start` must parse and carry an offset, and every `theme` must exist. A
malformed event then fails CI and never reaches production.

## Themes

`src/themes/themes.ts` exports presets keyed by `ThemeName`
(`camp | lake | winter | party`). Each preset is a map of CSS custom
properties plus a default background:

```ts
interface Theme {
  vars: {
    '--frame-bg': string;
    '--card-bg': string;
    '--card-text': string;
    '--card-border': string;
    '--accent': string;
    '--font-family': string;
  };
  defaultBackground: string;
}
```

The event page root spreads `vars` into its `style`. The timer stylesheet
uses `var(--card-bg)` and the other properties in place of today's hardcoded
colors. `camp` reproduces the current look exactly. The first commit makes
that swap, and the page must look the same before and after it.

Every theme's text and card colors must meet WCAG AA contrast (4.5:1). A unit
test computes and asserts this, so adding a preset cannot quietly produce
unreadable text.

## Routes

| Path            | Renders                                                                       |
| --------------- | ----------------------------------------------------------------------------- |
| `/`             | `EventPage` for `selectFeaturedEvent(events, now)`, plus a "Past events" link |
| `/events`       | `EventArchive`: a card grid, newest first                                     |
| `/events/:slug` | `EventPage` for that event, with its date under the timer or complete message |
| anything else   | `NotFound`, which links to `/events`                                          |

If the config is empty, `/` shows a short "No events yet" message.

Deep links need two pieces:

- `public/_redirects` with `/* /index.html 200`, so Netlify serves the SPA for
  every path.
- The PWA service worker's `navigateFallback` (the vite-plugin-pwa default),
  so deep links also work offline.

## Components

- **`selectFeaturedEvent(events, now): CountdownEvent | undefined`**. A pure
  function in `src/events/featured.ts`, and the only rule that decides what
  everyone sees on `/`. The earliest event whose start is still ahead wins.
  If none is ahead, the most recent past event wins. The period during an
  event (after it starts, during the weekend itself) is the open policy
  question; the implementation settles it and a test pins it.
- **`EventPage({ event })`**. Applies the theme and background, renders
  `CountdownTimer`, and sets `document.title`.
- **`CountdownTimer`**. Its current API stays and it gains an optional `date`
  line. Its `useEffect` currently has no dependency array, so it tears down
  and re-creates the interval on every render. It will depend on `targetDate`
  and compute the first tick synchronously, so nothing flashes `0:0:0:0` on
  load.
- **`EventArchive`**. One card per event: thumbnail background, title,
  formatted date, and an "Upcoming" or "Past" badge. Each card links to
  `/events/:slug`.
- **`NotFound`**.

## PWA

The manifest name and short name change from "Boys Weekend Countdown" to
"Countdown", because the installed app now holds many events. The per-event
name goes in `document.title` instead.

## Testing

Unit tests (Vitest):

- `selectFeaturedEvent`: empty list, all upcoming, all past, a mix, exactly at
  `start`, two events with the same start, and the during-event policy.
- Config validation and theme contrast, as described above.
- `EventArchive`: newest first; the badge flips at `start`.
- `CountdownTimer`: renders the remaining time on the first render and
  switches to the complete state at the target time (fake timers).

E2E (Cypress, clock frozen with `cy.clock`):

- `/` counts down when the clock is before an event and shows the complete
  message after it.
- `/events` lists both seed events, newest first.
- A deep link to `/events/boys-weekend-2024` renders that event.
- An unknown slug renders not-found.

## Delivery

This work branches from the zero-touch release pipeline branch. Both change
`app.tsx` (the release version label) and the e2e spec, and the pipeline has
to exist for this feature to ship as a release. The merge is a `feat:` commit,
so it produces the first minor release through the automated path.
