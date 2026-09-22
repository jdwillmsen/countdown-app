# Past events — design

## Goal

The app counts down to one hardcoded event. Once that event passes, the site
only says it has arrived, and nothing remembers earlier events. This design
lets the app hold many events. Each event has its own background, theme and
countdown. The home page keeps its current single-countdown feel, and a
separate archive lists past events. When nothing is coming up, the home
page says so plainly instead of showing a stale "Is Here!" screen.

## Decisions

| Question          | Decision                                                                                |
| ----------------- | --------------------------------------------------------------------------------------- |
| Where events live | A typed config file in the repo. Adding an event means a PR, then an automatic release. |
| Navigation        | `/` shows the featured event, `/events` the archive, `/events/:slug` one event.         |
| Theme             | Named presets. An event picks one by name and never sets raw colors.                    |
| Router            | React Router v8, declarative mode.                                                      |
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
  end: string; // same format; when the event is over
  theme: ThemeName; // key into the theme presets
  background?: string; // imported asset URL; falls back to the theme's default
  completeMessage: string; // shown from `start` until `end`
}
```

`start` must include an offset (`2025-07-17T16:30:00-05:00`). The current
code builds `new Date('07/17/2025 16:30:00')`, which is parsed in the
_viewer's_ time zone, so anyone outside the host's zone sees a countdown that
is off by their UTC difference. An explicit offset means everyone counts down
to the same instant.

`end` is required rather than defaulted. The home page's behavior depends on
whether an event is in progress, and a hidden default duration would make
that behavior hard to predict when someone adds an event.

Seed data:

| slug                | title        | start                     | end                       | theme |
| ------------------- | ------------ | ------------------------- | ------------------------- | ----- |
| `boys-weekend-2024` | Boys Weekend | 2024-07-18T18:00:00-05:00 | 2024-07-21T20:00:00-05:00 | camp  |
| `boys-weekend-2025` | Boys Weekend | 2025-07-17T18:00:00-05:00 | 2025-07-20T20:00:00-05:00 | camp  |
| `boys-weekend-2026` | Boys Weekend | 2026-07-16T16:00:00-05:00 | 2026-07-19T20:00:00-05:00 | camp  |

All three run Thursday to Sunday 8pm in `America/Chicago`, starting at 6pm
in 2024 and 2025 and 4pm in 2026. Each event names its IANA `timeZone`, and
event pages and the archive show the full range in that zone (for example
"Thu, Jul 16, 2026, 4:00 PM CDT – Sun, Jul 19, 2026, 8:00 PM CDT").

Both use `camp_background.webp` and the message "Boys Weekend Is Here!".

A unit test validates the config. Slugs must be unique and kebab-case, every
`start` and `end` must parse and carry an offset, `end` must be after
`start`, and every `theme` must exist. A
malformed event then fails CI and never reaches production.

## Themes

`src/themes/themes.ts` exports presets keyed by `ThemeName`
(`camp | lake | winter | party | night`). Each preset is a map of CSS custom
properties plus a backdrop:

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
  backdrop: string; // a CSS gradient, used when the event has no image
}
```

Only `camp` has a photo (`camp_background.webp`). The other presets would
need an image for every event, so each preset has a gradient `backdrop`
instead, and an event's `background` image overrides it. `night` is the
neutral preset used by the pages that are not an event: no-upcoming, the
archive, and not-found.

The event page root spreads `vars` into its `style`. The timer stylesheet
uses `var(--card-bg)` and the other properties in place of today's hardcoded
colors. `camp` reproduces the current look exactly. The first commit makes
that swap, and the page must look the same before and after it.

Every theme's text and card colors must meet WCAG AA contrast (4.5:1). The
card and frame colors are translucent, so the test composites them over both
pure black and pure white (the extremes a background photo can show) and
asserts both cases. It computes this, so adding a preset cannot quietly produce
unreadable text.

## Routes

| Path            | Renders                                                                             |
| --------------- | ----------------------------------------------------------------------------------- |
| `/`             | `HomePage`: the featured event, or the no-upcoming state, plus a "Past events" link |
| `/events`       | `EventArchive`: a card grid, newest first                                           |
| `/events/:slug` | `EventPage` for that event, with its date under the timer or complete message       |
| anything else   | `NotFound`, which links to `/events`                                                |

### Home page states

`selectHome(events, now)` returns one of three states:

| State      | When                                    | `/` shows                                            |
| ---------- | --------------------------------------- | ---------------------------------------------------- |
| `live`     | some event has `start <= now < end`     | that event's complete message, in its theme          |
| `upcoming` | otherwise, some event has `start > now` | a countdown to the earliest such event, in its theme |
| `none`     | neither                                 | the no-upcoming screen                               |

`live` wins over `upcoming`, so during the weekend the page still says "Is
Here!" and does not jump ahead to next year's countdown. If two events are
live at once, the one that started most recently wins.

The no-upcoming screen uses the `night` preset. It says
"No upcoming events", names the most recent past event with its date as a
link to `/events/:slug`, and links to the archive. With an empty config it
shows only "No upcoming events" and no links. The current production state
(the only event is from 2025) becomes this screen.

Deep links need two pieces:

- `public/_redirects` with `/* /index.html 200`, so Netlify serves the SPA for
  every path.
- The PWA service worker's `navigateFallback` (the vite-plugin-pwa default),
  so deep links also work offline.

## Components

- **`selectHome(events, now): HomeState`**. A pure function in
  `src/events/home.ts` that returns a discriminated union
  (`{ kind: 'live' | 'upcoming', event } | { kind: 'none', lastPast? }`).
  It is the only rule that decides what everyone sees on `/`, and it
  implements the table above.
- **`HomePage`**. Switches on the `HomeState`: `EventPage` for `live` and
  `upcoming`, and `NoUpcoming` for `none`.
- **`NoUpcoming({ lastPast })`**. The no-upcoming screen.
- **`EventPage({ event })`**. Applies the theme and background, renders
  `CountdownTimer`, and sets `document.title`.
- **`CountdownTimer`**. Its current API stays and it gains an optional `date`
  line. Its `useEffect` currently has no dependency array, so it tears down
  and re-creates the interval on every render. It will depend on `targetDate`
  and compute the first tick synchronously, so nothing flashes `0:0:0:0` on
  load.
- **`EventArchive`**. One card per event: thumbnail background, title,
  formatted date, and an "Upcoming", "Happening now" or "Past" badge. Each card links to
  `/events/:slug`.
- **`NotFound`**.

## PWA

The manifest name and short name change from "Boys Weekend Countdown" to
"Countdown", because the installed app now holds many events. The per-event
name goes in `document.title` instead.

## Testing

Unit tests (Vitest):

- `selectHome`: empty list; all past (returns `none` with the latest past
  event); all upcoming (returns the earliest); exactly at `start` and exactly
  at `end` (boundaries: `start` is inclusive, `end` is exclusive); a live
  event plus a later upcoming one (`live` wins); two overlapping live events.
- Config validation and theme contrast, as described above.
- `EventArchive`: newest first; the badge is "Upcoming" before `start`,
  "Happening now" between `start` and `end`, and "Past" after `end`.
- `CountdownTimer`: renders the remaining time on the first render and
  switches to the complete state at the target time (fake timers).

E2E (Cypress, clock frozen with `cy.clock`):

- `/` counts down when the clock is before an event, shows the complete
  message while the event is live, and shows "No upcoming events" with a link
  to the latest event once it has ended.
- `/events` lists both seed events, newest first.
- A deep link to `/events/boys-weekend-2024` renders that event.
- An unknown slug renders not-found.

## Delivery

This work branches from the zero-touch release pipeline branch. Both change
`app.tsx` (the release version label) and the e2e spec, and the pipeline has
to exist for this feature to ship as a release. The merge is a `feat:` commit,
so it produces the first minor release through the automated path.
