# Past Events Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the single hardcoded countdown into a set of themed events. The home page shows the live, upcoming or no-upcoming state, and there is a past-events archive with deep links.

**Architecture:** Events are a typed config in the repo. A pure `selectHome(events, now)` decides the home state. Themes are CSS custom-property presets applied by a shared `ThemedBackdrop`. React Router v8, declarative mode, maps `/`, `/events`, `/events/:slug` and `*` to pages.

**Tech Stack:** React 19, React Router 8.4.0, Vite 8, Vitest 4 with Testing Library, Cypress 15, Nx 23, pnpm 11, SCSS modules.

**Spec:** `docs/superpowers/specs/2026-09-21-past-events-design.md`

## Global Constraints

- Run all commands from the feature branch's worktree.
- The package manager is pnpm (`pnpm add`, `pnpm nx ...`). Never use npm or yarn.
- Pin `react-router` exactly at `8.4.0`. v8 still exports `BrowserRouter`, `MemoryRouter`, `Routes`, `Route`, `Link`, `useParams` and `Navigate`; this was checked.
- Event `start` and `end` are ISO 8601 strings **with an explicit offset** (`-05:00` or `Z`).
- Home rule: `live` (`start <= now < end`) beats `upcoming` (`start > now`, earliest first), which beats `none`. Among live events, the most recent start wins. `start` is inclusive and `end` is exclusive.
- The no-upcoming screen headline is exactly `No upcoming events`.
- The countdown title is `${event.title} Countdown`, which keeps the existing "Boys Weekend Countdown" text.
- The `camp` preset must reproduce today's look exactly: frame `rgba(0, 0, 0, 0.8)`, frame border `#fff`, card `rgba(255, 255, 255, 0.8)`, text `#333`, card border `#fff`, font inherited.
- WCAG AA: card text against the card composited over the frame and then over black **and** over white must be at least 4.5.
- Code comments explain why, never what. No ticket IDs or URLs in comments. Match the repo's existing comment density.
- Commits use Conventional Commits and end with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`. Use `feat:` only for user-visible behavior; use `refactor:`, `test:`, `build:` or `chore:` for the rest.
- Every task ends with `pnpm nx run-many -t lint test` green.

## File Structure

| File                                                                | Responsibility                                                          |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/themes/themes.ts`                                              | `ThemeName`, `Theme` and the preset map                                 |
| `src/themes/contrast.ts`                                            | Parse colors, alpha compositing, WCAG contrast ratio                    |
| `src/themes/themes.spec.ts`                                         | Contrast of every preset, and camp matching today's look                |
| `src/themes/contrast.spec.ts`                                       | Tests of the color math                                                 |
| `src/themes/themed-backdrop.tsx` (+ `.module.scss`, spec)           | Full-screen container that applies a theme's vars and backdrop or image |
| `src/events/event.ts`                                               | `CountdownEvent`, `startsAt`, `endsAt`, `statusAt`, `formatEventDate`   |
| `src/events/events.ts`                                              | The event config (seed data)                                            |
| `src/events/validate.ts` (+ spec)                                   | `validateEvents` and the config-is-valid test                           |
| `src/events/home.ts` (+ spec)                                       | `HomeState` and `selectHome`                                            |
| `src/app/countdown-timer/*`                                         | Timer: interval fix, synchronous first tick, `date` line, CSS vars      |
| `src/app/use-document-title.ts`                                     | Sets `document.title`                                                   |
| `src/app/pages/event-page.tsx`                                      | One event in its theme                                                  |
| `src/app/pages/home-page.tsx`                                       | Switches on `HomeState`                                                 |
| `src/app/pages/no-upcoming.tsx`                                     | The no-upcoming screen                                                  |
| `src/app/pages/event-archive.tsx`                                   | Archive grid                                                            |
| `src/app/pages/event-detail.tsx`                                    | `/events/:slug` lookup                                                  |
| `src/app/pages/not-found.tsx`                                       | Unknown path or slug                                                    |
| `src/app/pages/pages.module.scss`                                   | Shared card, nav and grid styles, all driven by theme vars              |
| `src/app/app.tsx`, `src/main.tsx`                                   | Routes and `BrowserRouter`                                              |
| `public/_redirects`, `vite.config.ts`, `index.html`, `project.json` | SPA fallback, PWA name and title, static server SPA mode                |
| `e2e/src/e2e/app.cy.ts`                                             | End-to-end flows with a frozen clock                                    |

---

### Task 1: Theme presets, contrast guard, themed backdrop

**Files:**

- Create: `src/themes/themes.ts`, `src/themes/contrast.ts`, `src/themes/contrast.spec.ts`, `src/themes/themes.spec.ts`, `src/themes/themed-backdrop.tsx`, `src/themes/themed-backdrop.module.scss`, `src/themes/themed-backdrop.spec.tsx`
- Modify: `src/app/countdown-timer/countdown-timer.module.scss` (replace hardcoded colors with vars), `src/app/app.tsx` (use `ThemedBackdrop` with `camp`), `src/app/app.module.scss` (drop `.container`)

**Interfaces:**

- Produces: `type ThemeName = 'camp' | 'lake' | 'winter' | 'party' | 'night'`; `themes: Record<ThemeName, Theme>`; `ThemedBackdrop({ theme: ThemeName; image?: string; children })`; `contrastRatio(a: Rgb, b: Rgb): number`; `parseColor(css: string): Rgba`; `over(top: Rgba, bottom: Rgb): Rgb`.

- [ ] **Step 1: Write the failing contrast math tests.** Create `src/themes/contrast.spec.ts`:

```ts
import { contrastRatio, over, parseColor } from './contrast';

describe('contrast', () => {
  it('parses hex and rgba', () => {
    expect(parseColor('#333')).toEqual({ r: 51, g: 51, b: 51, a: 1 });
    expect(parseColor('#1e6fa8')).toEqual({ r: 30, g: 111, b: 168, a: 1 });
    expect(parseColor('rgba(255, 255, 255, 0.8)')).toEqual({
      r: 255,
      g: 255,
      b: 255,
      a: 0.8,
    });
  });

  it('composites a translucent color over an opaque one', () => {
    expect(
      over(parseColor('rgba(0, 0, 0, 0.5)'), { r: 255, g: 255, b: 255 }),
    ).toEqual({
      r: 127.5,
      g: 127.5,
      b: 127.5,
    });
  });

  it('computes the WCAG ratio', () => {
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5);
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5);
  });
});
```

- [ ] **Step 2: Run it and watch it fail.** `pnpm nx test countdown-app -- src/themes/contrast.spec.ts` should fail with "Failed to resolve import './contrast'".

- [ ] **Step 3: Implement `src/themes/contrast.ts`.**

```ts
export interface Rgb {
  r: number;
  g: number;
  b: number;
}
export interface Rgba extends Rgb {
  a: number;
}

export function parseColor(css: string): Rgba {
  const hex = css.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h =
      hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1];
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: 1,
    };
  }
  const rgba = css.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/,
  );
  if (rgba) {
    return {
      r: Number(rgba[1]),
      g: Number(rgba[2]),
      b: Number(rgba[3]),
      a: rgba[4] === undefined ? 1 : Number(rgba[4]),
    };
  }
  throw new Error(`Unsupported color: ${css}`);
}

export function over(top: Rgba, bottom: Rgb): Rgb {
  const mix = (t: number, b: number) => t * top.a + b * (1 - top.a);
  return {
    r: mix(top.r, bottom.r),
    g: mix(top.g, bottom.g),
    b: mix(top.b, bottom.b),
  };
}

function luminance({ r, g, b }: Rgb): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
```

- [ ] **Step 4: Run it and watch it pass.** Same command as Step 2; expect PASS.

- [ ] **Step 5: Write the failing theme tests.** Create `src/themes/themes.spec.ts`:

```ts
import { contrastRatio, over, parseColor } from './contrast';
import { themes, type ThemeName } from './themes';

const BLACK = { r: 0, g: 0, b: 0 };
const WHITE = { r: 255, g: 255, b: 255 };

describe('themes', () => {
  // A background photo can be anything, so a translucent card has to stay
  // readable over both extremes it could show through.
  it.each(Object.keys(themes) as ThemeName[])(
    '%s card text meets WCAG AA',
    (name) => {
      const { vars } = themes[name];
      for (const photo of [BLACK, WHITE]) {
        const frame = over(parseColor(vars['--frame-bg']), photo);
        const card = over(parseColor(vars['--card-bg']), frame);
        const text = over(parseColor(vars['--card-text']), card);
        expect(contrastRatio(text, card)).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it('camp reproduces the original look', () => {
    expect(themes.camp.vars).toEqual({
      '--frame-bg': 'rgba(0, 0, 0, 0.8)',
      '--frame-border': '#fff',
      '--card-bg': 'rgba(255, 255, 255, 0.8)',
      '--card-text': '#333',
      '--card-border': '#fff',
      '--accent': '#2f5d3a',
      '--font-family': 'inherit',
    });
  });
});
```

- [ ] **Step 6: Run it and watch it fail** (missing module).

- [ ] **Step 7: Implement `src/themes/themes.ts`.**

```ts
export type ThemeName = 'camp' | 'lake' | 'winter' | 'party' | 'night';

export type ThemeVars = Record<
  | '--frame-bg'
  | '--frame-border'
  | '--card-bg'
  | '--card-text'
  | '--card-border'
  | '--accent'
  | '--font-family',
  string
>;

export interface Theme {
  vars: ThemeVars;
  // Shown when an event has no photo of its own.
  backdrop: string;
}

export const themes: Record<ThemeName, Theme> = {
  camp: {
    vars: {
      '--frame-bg': 'rgba(0, 0, 0, 0.8)',
      '--frame-border': '#fff',
      '--card-bg': 'rgba(255, 255, 255, 0.8)',
      '--card-text': '#333',
      '--card-border': '#fff',
      '--accent': '#2f5d3a',
      '--font-family': 'inherit',
    },
    backdrop: 'linear-gradient(#2d4a36, #0d1a12)',
  },
  lake: {
    vars: {
      '--frame-bg': 'rgba(4, 30, 56, 0.8)',
      '--frame-border': '#e0f2ff',
      '--card-bg': 'rgba(240, 248, 255, 0.9)',
      '--card-text': '#0b3050',
      '--card-border': '#e0f2ff',
      '--accent': '#1e6fa8',
      '--font-family': "'Trebuchet MS', sans-serif",
    },
    backdrop: 'linear-gradient(#5aa9e6, #0b3050)',
  },
  winter: {
    vars: {
      '--frame-bg': 'rgba(20, 30, 48, 0.8)',
      '--frame-border': '#fff',
      '--card-bg': 'rgba(255, 255, 255, 0.9)',
      '--card-text': '#1c2a3a',
      '--card-border': '#fff',
      '--accent': '#3a7bd5',
      '--font-family': 'Georgia, serif',
    },
    backdrop: 'linear-gradient(#dfe9f3, #8aa5c1)',
  },
  party: {
    vars: {
      '--frame-bg': 'rgba(40, 0, 50, 0.85)',
      '--frame-border': '#ffd23f',
      '--card-bg': 'rgba(255, 250, 235, 0.92)',
      '--card-text': '#3d0a4f',
      '--card-border': '#ffd23f',
      '--accent': '#d6246e',
      '--font-family': "'Arial Rounded MT Bold', Arial, sans-serif",
    },
    backdrop: 'linear-gradient(135deg, #ff5f6d, #845ec2)',
  },
  night: {
    vars: {
      '--frame-bg': 'rgba(0, 0, 0, 0.8)',
      '--frame-border': 'rgba(255, 255, 255, 0.6)',
      '--card-bg': 'rgba(24, 24, 32, 0.9)',
      '--card-text': '#f2f2f2',
      '--card-border': 'rgba(255, 255, 255, 0.6)',
      '--accent': '#9ecbff',
      '--font-family': 'inherit',
    },
    backdrop: 'linear-gradient(#141e30, #243b55)',
  },
};
```

- [ ] **Step 8: Run the theme tests.** Expect PASS. If a preset fails contrast, darken its `--card-text` (never lighten the card); don't loosen the test.

- [ ] **Step 9: Write the failing backdrop test.** Create `src/themes/themed-backdrop.spec.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { ThemedBackdrop } from './themed-backdrop';

describe('ThemedBackdrop', () => {
  it('applies the theme vars and the photo when given one', () => {
    render(
      <ThemedBackdrop theme="lake" image="/photo.webp">
        <p>inside</p>
      </ThemedBackdrop>,
    );
    const root = screen.getByText('inside').parentElement as HTMLElement;
    expect(root.style.getPropertyValue('--card-text')).toBe('#0b3050');
    expect(root.style.backgroundImage).toContain('/photo.webp');
  });

  it('falls back to the theme backdrop without a photo', () => {
    render(
      <ThemedBackdrop theme="night">
        <p>inside</p>
      </ThemedBackdrop>,
    );
    const root = screen.getByText('inside').parentElement as HTMLElement;
    expect(root.style.backgroundImage).toContain('linear-gradient');
  });
});
```

- [ ] **Step 10: Run it and watch it fail**, then implement `src/themes/themed-backdrop.tsx` and its stylesheet:

```tsx
import type { CSSProperties, ReactNode } from 'react';
import styles from './themed-backdrop.module.scss';
import { themes, type ThemeName } from './themes';

export interface ThemedBackdropProps {
  theme: ThemeName;
  image?: string;
  children: ReactNode;
}

export function ThemedBackdrop({
  theme,
  image,
  children,
}: ThemedBackdropProps) {
  const { vars, backdrop } = themes[theme];
  const style = {
    ...vars,
    backgroundImage: image ? `url(${image})` : backdrop,
  } as CSSProperties;
  return (
    <div className={styles['backdrop']} style={style}>
      {children}
    </div>
  );
}

export default ThemedBackdrop;
```

```scss
.backdrop {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 100vh;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  font-family: var(--font-family);
}
```

- [ ] **Step 11: Move the timer to CSS variables.** In `countdown-timer.module.scss`:
  - `.timer-container`: `background-color: var(--frame-bg); border: solid 1px var(--frame-border);`
  - `.timer-wrapper`: `border: solid 1px var(--card-border); color: var(--card-text); background-color: var(--card-bg);`
  - In both media queries: `border: solid 2px var(--frame-border)` on `.timer-container` and `var(--card-border)` on `.timer-wrapper`.

  In `app.tsx`, replace the outer `div` and its inline style with `<ThemedBackdrop theme="camp" image={background}>`. Delete `.container` from `app.module.scss` and keep `.version`.

- [ ] **Step 12: Verify nothing visibly changed.** Run `pnpm nx run-many -t lint test build`; expect green. Run `pnpm nx run e2e:e2e-ci`; expect the 2 existing specs to pass unchanged.

- [ ] **Step 13: Commit.**

```bash
git add src/themes src/app
git commit -m "refactor: drive the countdown's colors from theme presets

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Event model, seed config, validation

**Files:**

- Create: `src/events/event.ts`, `src/events/event.spec.ts`, `src/events/events.ts`, `src/events/validate.ts`, `src/events/validate.spec.ts`

**Interfaces:**

- Consumes: `ThemeName`, `themes` (Task 1)
- Produces:

```ts
interface CountdownEvent {
  slug: string;
  title: string;
  start: string;
  end: string;
  theme: ThemeName;
  background?: string;
  completeMessage: string;
}
type EventStatus = 'upcoming' | 'live' | 'past';
startsAt(e: CountdownEvent): number; // epoch ms
endsAt(e: CountdownEvent): number;
statusAt(e: CountdownEvent, now: number): EventStatus;
formatEventDate(e: CountdownEvent): string; // e.g. "Jul 17, 2025"
events: readonly CountdownEvent[];
validateEvents(list: readonly CountdownEvent[]): string[]; // [] when valid
```

- [ ] **Step 1: Write the failing model tests** in `src/events/event.spec.ts`:

```ts
import {
  endsAt,
  formatEventDate,
  startsAt,
  statusAt,
  type CountdownEvent,
} from './event';

const event: CountdownEvent = {
  slug: 'e',
  title: 'E',
  start: '2025-07-17T16:30:00-05:00',
  end: '2025-07-20T12:00:00-05:00',
  theme: 'camp',
  completeMessage: 'Here',
};

describe('event', () => {
  it('reads the offset, not the viewer time zone', () => {
    expect(startsAt(event)).toBe(Date.UTC(2025, 6, 17, 21, 30));
    expect(endsAt(event)).toBe(Date.UTC(2025, 6, 20, 17, 0));
  });

  it('is upcoming before start, live from start until end, past from end', () => {
    expect(statusAt(event, startsAt(event) - 1)).toBe('upcoming');
    expect(statusAt(event, startsAt(event))).toBe('live');
    expect(statusAt(event, endsAt(event) - 1)).toBe('live');
    expect(statusAt(event, endsAt(event))).toBe('past');
  });

  it('formats the start date', () => {
    expect(formatEventDate(event)).toBe('Jul 17, 2025');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**, then implement `src/events/event.ts`:

```ts
import type { ThemeName } from '../themes/themes';

export interface CountdownEvent {
  slug: string;
  title: string;
  start: string;
  end: string;
  theme: ThemeName;
  background?: string;
  completeMessage: string;
}

export type EventStatus = 'upcoming' | 'live' | 'past';

export const startsAt = (e: CountdownEvent) => Date.parse(e.start);
export const endsAt = (e: CountdownEvent) => Date.parse(e.end);

export function statusAt(e: CountdownEvent, now: number): EventStatus {
  if (now < startsAt(e)) return 'upcoming';
  return now < endsAt(e) ? 'live' : 'past';
}

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export function formatEventDate(e: CountdownEvent): string {
  return dateFormat.format(startsAt(e));
}
```

Note: `formatEventDate` uses the viewer's time zone. Both seed events start in the evening Central time, which is the same calendar day in UTC, so the test holds in CI (UTC) and locally.

- [ ] **Step 3: Run it and watch it pass.**

- [ ] **Step 4: Write the failing validation tests** in `src/events/validate.spec.ts`:

```ts
import type { CountdownEvent } from './event';
import { events } from './events';
import { validateEvents } from './validate';

const ok: CountdownEvent = {
  slug: 'a-b',
  title: 'A',
  start: '2025-07-17T16:30:00-05:00',
  end: '2025-07-20T12:00:00-05:00',
  theme: 'camp',
  completeMessage: 'Here',
};

describe('validateEvents', () => {
  it('accepts the shipped config', () => {
    expect(validateEvents(events)).toEqual([]);
  });

  it('rejects duplicate slugs', () => {
    expect(validateEvents([ok, ok])).toEqual(['a-b: duplicate slug']);
  });

  it('rejects slugs that are not kebab-case', () => {
    expect(validateEvents([{ ...ok, slug: 'A B' }])).toEqual([
      'A B: slug must be kebab-case',
    ]);
  });

  it('rejects dates without an offset', () => {
    expect(validateEvents([{ ...ok, start: '2025-07-17T16:30:00' }])).toEqual([
      'a-b: start must be ISO 8601 with an offset',
    ]);
  });

  it('rejects an end that is not after the start', () => {
    expect(validateEvents([{ ...ok, end: ok.start }])).toEqual([
      'a-b: end must be after start',
    ]);
  });

  it('rejects unknown themes', () => {
    expect(
      validateEvents([{ ...ok, theme: 'disco' as CountdownEvent['theme'] }]),
    ).toEqual(['a-b: unknown theme "disco"']);
  });
});
```

- [ ] **Step 5: Run it and watch it fail**, then implement `src/events/validate.ts` and `src/events/events.ts`:

```ts
import { themes } from '../themes/themes';
import { endsAt, startsAt, type CountdownEvent } from './event';

// An offset is mandatory: without one the date is read in each viewer's own
// time zone, and people in different zones count down to different instants.
const ISO_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/;
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function validateEvents(list: readonly CountdownEvent[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const e of list) {
    if (seen.has(e.slug)) errors.push(`${e.slug}: duplicate slug`);
    seen.add(e.slug);
    if (!KEBAB.test(e.slug)) errors.push(`${e.slug}: slug must be kebab-case`);
    for (const field of ['start', 'end'] as const) {
      if (
        !ISO_WITH_OFFSET.test(e[field]) ||
        Number.isNaN(Date.parse(e[field]))
      ) {
        errors.push(`${e.slug}: ${field} must be ISO 8601 with an offset`);
      }
    }
    if (endsAt(e) <= startsAt(e))
      errors.push(`${e.slug}: end must be after start`);
    if (!(e.theme in themes))
      errors.push(`${e.slug}: unknown theme "${e.theme}"`);
  }
  return errors;
}
```

```ts
import campBackground from '../assets/camp_background.webp';
import type { CountdownEvent } from './event';

export const events: readonly CountdownEvent[] = [
  {
    slug: 'boys-weekend-2024',
    title: 'Boys Weekend',
    start: '2024-07-18T18:00:00-05:00',
    end: '2024-07-21T12:00:00-05:00',
    theme: 'camp',
    background: campBackground,
    completeMessage: 'Boys Weekend Is Here!',
  },
  {
    slug: 'boys-weekend-2025',
    title: 'Boys Weekend',
    start: '2025-07-17T16:30:00-05:00',
    end: '2025-07-20T12:00:00-05:00',
    theme: 'camp',
    background: campBackground,
    completeMessage: 'Boys Weekend Is Here!',
  },
];
```

- [ ] **Step 6: Run the tests and watch them pass.** `pnpm nx run-many -t lint test` should be green.

- [ ] **Step 7: Commit** with `feat: model events with explicit time-zone offsets` and the Co-Authored-By trailer.

---

### Task 3: Home state selector

**Files:**

- Create: `src/events/home.ts`, `src/events/home.spec.ts`

**Interfaces:**

- Consumes: `CountdownEvent`, `startsAt`, `endsAt`, `statusAt` (Task 2)
- Produces:

```ts
type HomeState =
  | { kind: 'live'; event: CountdownEvent }
  | { kind: 'upcoming'; event: CountdownEvent }
  | { kind: 'none'; lastPast?: CountdownEvent };
selectHome(list: readonly CountdownEvent[], now: number): HomeState;
```

- [ ] **Step 1: Write the failing tests** in `src/events/home.spec.ts`:

```ts
import type { CountdownEvent } from './event';
import { selectHome } from './home';

const make = (slug: string, start: string, end: string): CountdownEvent => ({
  slug,
  title: slug,
  start,
  end,
  theme: 'camp',
  completeMessage: 'Here',
});

const y24 = make(
  'y24',
  '2024-07-18T18:00:00-05:00',
  '2024-07-21T12:00:00-05:00',
);
const y25 = make(
  'y25',
  '2025-07-17T16:30:00-05:00',
  '2025-07-20T12:00:00-05:00',
);
const y26 = make(
  'y26',
  '2026-07-16T17:00:00-05:00',
  '2026-07-19T12:00:00-05:00',
);
const at = (iso: string) => Date.parse(iso);

describe('selectHome', () => {
  it('is none with no last event when there are no events', () => {
    expect(selectHome([], at('2025-01-01T00:00:00Z'))).toEqual({
      kind: 'none',
      lastPast: undefined,
    });
  });

  it('is none pointing at the most recent past event when all are over', () => {
    expect(selectHome([y25, y24], at('2025-09-01T00:00:00Z'))).toEqual({
      kind: 'none',
      lastPast: y25,
    });
  });

  it('counts down to the earliest upcoming event', () => {
    expect(selectHome([y26, y25], at('2025-01-01T00:00:00Z'))).toEqual({
      kind: 'upcoming',
      event: y25,
    });
  });

  it('is live from exactly start, and no longer live at exactly end', () => {
    expect(selectHome([y25], Date.parse(y25.start))).toEqual({
      kind: 'live',
      event: y25,
    });
    expect(selectHome([y25], Date.parse(y25.end))).toEqual({
      kind: 'none',
      lastPast: y25,
    });
  });

  it('prefers the live event over a later upcoming one', () => {
    expect(selectHome([y26, y25], at('2025-07-18T12:00:00-05:00'))).toEqual({
      kind: 'live',
      event: y25,
    });
  });

  it('picks the most recently started of two overlapping live events', () => {
    const early = make('early', '2025-07-17T00:00:00Z', '2025-07-25T00:00:00Z');
    const late = make('late', '2025-07-18T00:00:00Z', '2025-07-20T00:00:00Z');
    expect(selectHome([early, late], at('2025-07-19T00:00:00Z'))).toEqual({
      kind: 'live',
      event: late,
    });
  });
});
```

- [ ] **Step 2: Run it and watch it fail**, then implement `src/events/home.ts`:

```ts
import { endsAt, startsAt, statusAt, type CountdownEvent } from './event';

export type HomeState =
  | { kind: 'live'; event: CountdownEvent }
  | { kind: 'upcoming'; event: CountdownEvent }
  | { kind: 'none'; lastPast?: CountdownEvent };

export function selectHome(
  list: readonly CountdownEvent[],
  now: number,
): HomeState {
  const byStatus = (s: string) => list.filter((e) => statusAt(e, now) === s);

  // A live event beats an upcoming one, so the page keeps saying "Is Here!"
  // for the whole weekend and does not jump to next year's countdown.
  const live = byStatus('live').sort((a, b) => startsAt(b) - startsAt(a))[0];
  if (live) return { kind: 'live', event: live };

  const upcoming = byStatus('upcoming').sort(
    (a, b) => startsAt(a) - startsAt(b),
  )[0];
  if (upcoming) return { kind: 'upcoming', event: upcoming };

  const lastPast = byStatus('past').sort((a, b) => endsAt(b) - endsAt(a))[0];
  return { kind: 'none', lastPast };
}
```

- [ ] **Step 3: Run it and watch it pass.** Then run `pnpm nx run-many -t lint test`.

- [ ] **Step 4: Commit** with `feat: decide what the home page shows from the event list` and the trailer.

---

### Task 4: Countdown timer fixes

**Files:**

- Modify: `src/app/countdown-timer/countdown-timer.tsx`, `src/app/countdown-timer/countdown-timer.spec.tsx`, `src/app/countdown-timer/countdown-timer.module.scss` (add `.timer-date`)

**Interfaces:**

- Produces: `CountdownTimer({ targetDate: Date; title?: string; completeMessage?: string; date?: string })`. `date`, when set, is rendered in an element with class `timer-date` under both the countdown and the complete message.

- [ ] **Step 1: Replace the spec with failing behavior tests.**

```tsx
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import CountdownTimer from './countdown-timer';

const segment = (label: string) =>
  screen.getByText(label).previousElementSibling?.textContent;

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.UTC(2025, 0, 1, 0, 0, 0));
  });
  afterEach(() => vi.useRealTimers());

  it('shows the remaining time on the very first render', () => {
    const target = new Date(Date.UTC(2025, 0, 3, 3, 4, 5));
    render(<CountdownTimer targetDate={target} title="T" />);
    expect(segment('Days')).toBe('2');
    expect(segment('Hours')).toBe('3');
    expect(segment('Minutes')).toBe('4');
    expect(segment('Seconds')).toBe('5');
  });

  it('switches to the complete message when the target arrives', () => {
    const target = new Date(Date.UTC(2025, 0, 1, 0, 0, 2));
    render(<CountdownTimer targetDate={target} completeMessage="Here!" />);
    expect(screen.queryByText('Here!')).toBeNull();
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText('Here!')).toBeTruthy();
  });

  it('shows the date line in both states', () => {
    const { rerender } = render(
      <CountdownTimer
        targetDate={new Date(Date.UTC(2030, 0, 1))}
        date="Jan 1, 2030"
      />,
    );
    expect(screen.getByText('Jan 1, 2030')).toBeTruthy();
    rerender(
      <CountdownTimer
        targetDate={new Date(Date.UTC(2020, 0, 1))}
        date="Jan 1, 2020"
      />,
    );
    expect(screen.getByText('Jan 1, 2020')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run it and watch it fail.** The first test fails because the current timer renders `0` until the first interval tick.

- [ ] **Step 3: Rewrite `countdown-timer.tsx`.** Keep the existing JSX structure and class names, add the date line, and change the state handling:

```tsx
import styles from './countdown-timer.module.scss';
import { useEffect, useState } from 'react';

export interface CountdownTimerProps {
  targetDate: Date;
  title?: string;
  completeMessage?: string;
  date?: string;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function CountdownTimer(props: CountdownTimerProps) {
  const { completeMessage = 'Complete', title, date } = props;
  const target = props.targetDate.getTime();
  // Read the clock during the first render so the page never flashes 0:0:0:0
  // while waiting for the first interval tick.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), SECOND);
    return () => clearInterval(interval);
  }, [target]);

  const remaining = target - now;
  const dateLine = date && <div className={styles['timer-date']}>{date}</div>;

  if (remaining <= 0) {
    return (
      <div className={styles['timer-container']}>
        <div className={styles['timer-wrapper']}>
          <div className={styles['timer-inner']}>
            <h1 className={styles['timer-complete']}>{completeMessage}</h1>
          </div>
          {dateLine}
        </div>
      </div>
    );
  }

  const segments = [
    ['Days', Math.floor(remaining / DAY)],
    ['Hours', Math.floor((remaining % DAY) / HOUR)],
    ['Minutes', Math.floor((remaining % HOUR) / MINUTE)],
    ['Seconds', Math.floor((remaining % MINUTE) / SECOND)],
  ] as const;

  return (
    <div className={styles['timer-container']}>
      <div className={styles['timer-wrapper']}>
        <div className={styles['timer-title']}>{title}</div>
        <div className={styles['timer-inner']}>
          {segments.map(([label, value], i) => (
            <div key={label} style={{ display: 'contents' }}>
              {i > 0 && <span className={styles['divider']}>:</span>}
              <div className={styles['timer-segment']}>
                <span className={styles['time']}>{value}</span>
                <span className={styles['label']}>{label}</span>
              </div>
            </div>
          ))}
        </div>
        {dateLine}
      </div>
    </div>
  );
}

export default CountdownTimer;
```

Add to the SCSS, at the base level (not inside a media query):

```scss
.timer-date {
  font-size: 12px;
  opacity: 0.8;
}
```

Inside each media query, bump `.timer-date` to `18px` (600px breakpoint) and `20px` (900px breakpoint).

- [ ] **Step 4: Run the tests and watch them pass**, then run `pnpm nx run-many -t lint test`. If `react-hooks` 7 complains about `props.targetDate` identity, the `[target]` dependency (a number) is already the fix; don't add `targetDate` to the array.

- [ ] **Step 5: Commit** with `fix: show the countdown on first paint and stop re-arming the timer every render` and the trailer.

---

### Task 5: Pages, routing, SPA fallback, PWA name

**Files:**

- Add dependency: `pnpm add react-router@8.4.0` (it goes in `dependencies`, exact version)
- Create: `src/app/use-document-title.ts`, `src/app/pages/pages.module.scss`, `src/app/pages/event-page.tsx`, `src/app/pages/home-page.tsx`, `src/app/pages/no-upcoming.tsx`, `src/app/pages/event-archive.tsx`, `src/app/pages/event-detail.tsx`, `src/app/pages/not-found.tsx`, `src/app/pages/pages.spec.tsx`, `public/_redirects`
- Modify: `src/app/app.tsx`, `src/app/app.spec.tsx`, `src/main.tsx`, `vite.config.ts` (manifest name), `index.html` (`<title>`), `project.json` (`serve-static` SPA mode)

**Interfaces:**

- Consumes: `ThemedBackdrop` (Task 1); `CountdownEvent`, `startsAt`, `statusAt`, `formatEventDate`, `events` (Task 2); `selectHome` (Task 3); `CountdownTimer` with `date` (Task 4)
- Produces: `App({ events?: readonly CountdownEvent[] })`, which must be rendered inside a router. Every page takes `events` as a prop so tests can inject fixtures.

- [ ] **Step 1: Write failing page tests** in `src/app/pages/pages.spec.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, vi } from 'vitest';
import App from '../app';
import type { CountdownEvent } from '../../events/event';

const make = (
  slug: string,
  title: string,
  start: string,
  end: string,
): CountdownEvent => ({
  slug,
  title,
  start,
  end,
  theme: 'camp',
  completeMessage: `${title} Is Here!`,
});
const older = make(
  'trip-2024',
  'Trip',
  '2024-07-18T18:00:00-05:00',
  '2024-07-21T12:00:00-05:00',
);
const newer = make(
  'trip-2025',
  'Trip',
  '2025-07-17T16:30:00-05:00',
  '2025-07-20T12:00:00-05:00',
);
const list = [older, newer];

const renderAt = (path: string, now: string) => {
  vi.setSystemTime(Date.parse(now));
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App events={list} />
    </MemoryRouter>,
  );
};

describe('pages', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('home counts down to the next event', () => {
    renderAt('/', '2025-07-01T00:00:00Z');
    expect(screen.getByText('Trip Countdown')).toBeTruthy();
    expect(document.title).toBe('Trip · Countdown');
  });

  it('home says the event is here while it is live', () => {
    renderAt('/', '2025-07-18T12:00:00-05:00');
    expect(screen.getByText('Trip Is Here!')).toBeTruthy();
  });

  it('home says nothing is coming and links the latest event once all are over', () => {
    renderAt('/', '2025-09-01T00:00:00Z');
    expect(screen.getByText('No upcoming events')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Trip' }).getAttribute('href'),
    ).toBe('/events/trip-2025');
    expect(screen.getByText(/Jul 17, 2025/)).toBeTruthy();
  });

  it('home with no events at all shows only the headline', () => {
    vi.setSystemTime(Date.parse('2025-09-01T00:00:00Z'));
    render(
      <MemoryRouter initialEntries={['/']}>
        <App events={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByText('No upcoming events')).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('archive lists newest first with status badges', () => {
    renderAt('/events', '2025-07-18T12:00:00-05:00');
    const cards = screen.getAllByRole('listitem');
    expect(within(cards[0]).getByText('Jul 17, 2025')).toBeTruthy();
    expect(within(cards[0]).getByText('Happening now')).toBeTruthy();
    expect(within(cards[1]).getByText('Past')).toBeTruthy();
  });

  it('detail page renders one event with its date', () => {
    renderAt('/events/trip-2024', '2025-09-01T00:00:00Z');
    expect(screen.getByText('Trip Is Here!')).toBeTruthy();
    expect(screen.getByText('Jul 18, 2024')).toBeTruthy();
  });

  it('unknown slugs and paths show not-found', () => {
    renderAt('/events/nope', '2025-09-01T00:00:00Z');
    expect(screen.getByText('Event not found')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'See all events' }).getAttribute('href'),
    ).toBe('/events');
  });
});
```

Update `src/app/app.spec.tsx` so its three existing tests wrap `<App />` in `<MemoryRouter>`.

- [ ] **Step 2: Run the tests and watch them fail** (missing `react-router`, missing pages).

- [ ] **Step 3: Install the router.** `pnpm add react-router@8.4.0`, then check that `package.json` shows `"react-router": "8.4.0"` with no caret. If it has one, run `pnpm add -E react-router@8.4.0`.

- [ ] **Step 4: Implement the shared pieces.**

`src/app/use-document-title.ts`:

```ts
import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
```

`src/app/pages/pages.module.scss`:

```scss
.card {
  background-color: var(--frame-bg);
  border: solid 2px var(--frame-border);
  border-radius: 4px;
  padding: 12px;
  max-width: min(640px, calc(100vw - 32px));
}

.card-inner {
  background-color: var(--card-bg);
  color: var(--card-text);
  border: solid 1px var(--card-border);
  border-radius: 4px;
  padding: 24px;
  text-align: center;

  a {
    color: var(--accent);
    font-weight: 700;
  }
}

.nav {
  position: fixed;
  left: 12px;
  bottom: 8px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.archive {
  width: min(960px, calc(100vw - 32px));
  padding: 32px 0;

  h1 {
    color: #fff;
    text-align: center;
  }
}

.grid {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.tile {
  display: block;
  border-radius: 6px;
  overflow: hidden;
  border: solid 2px var(--frame-border);
  background-color: var(--card-bg);
  color: var(--card-text);
  text-decoration: none;
}

.thumb {
  height: 120px;
  background-size: cover;
  background-position: center;
}

.tile-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge {
  align-self: flex-start;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  border: solid 1px currentColor;
}
```

- [ ] **Step 5: Implement the pages.**

`event-page.tsx`:

```tsx
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
```

`no-upcoming.tsx`:

```tsx
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
```

`home-page.tsx`:

```tsx
import type { CountdownEvent } from '../../events/event';
import { selectHome } from '../../events/home';
import { EventPage } from './event-page';
import { NoUpcoming } from './no-upcoming';

export function HomePage({ events }: { events: readonly CountdownEvent[] }) {
  // Evaluated once per visit. The timer handles the switch at start by itself;
  // the switch at end shows on the next load, which is fine for a weekend-long
  // window.
  const state = selectHome(events, Date.now());
  if (state.kind === 'none') return <NoUpcoming lastPast={state.lastPast} />;
  return (
    <EventPage
      event={state.event}
      nav={{ to: '/events', label: 'Past events →' }}
    />
  );
}
```

`event-archive.tsx`:

```tsx
import { Link } from 'react-router';
import { ThemedBackdrop } from '../../themes/themed-backdrop';
import { themes } from '../../themes/themes';
import {
  formatEventDate,
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
  useDocumentTitle('Past events · Countdown');
  const now = Date.now();
  const sorted = [...events].sort((a, b) => startsAt(b) - startsAt(a));
  return (
    <ThemedBackdrop theme="night">
      <main className={styles['archive']}>
        <h1>Events</h1>
        <ul className={styles['grid']}>
          {sorted.map((e) => (
            <li key={e.slug}>
              <Link
                to={`/events/${e.slug}`}
                className={styles['tile']}
                style={themes[e.theme].vars as React.CSSProperties}
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
                  <span>{formatEventDate(e)}</span>
                  <span className={styles['badge']}>
                    {BADGE[statusAt(e, now)]}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <Link className={styles['nav']} to="/">
          ← Home
        </Link>
      </main>
    </ThemedBackdrop>
  );
}
```

Import `type CSSProperties` from `react` rather than using `React.CSSProperties`, to match `themed-backdrop.tsx`.

`not-found.tsx`:

```tsx
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
```

`event-detail.tsx`:

```tsx
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
      nav={{ to: '/events', label: '← All events' }}
    />
  );
}
```

- [ ] **Step 6: Wire up the routes.** `src/app/app.tsx`:

```tsx
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
```

`src/main.tsx`: wrap `<App />` in `<BrowserRouter>`, imported from `react-router`.

- [ ] **Step 7: Add the SPA fallback, PWA name and title.**
  - `public/_redirects` contains the single line `/* /index.html 200`.
  - `vite.config.ts` manifest: `name: 'Countdown'`, `short_name: 'Countdown'`, `description: 'Countdowns to upcoming events, and the ones already past'`.
  - `index.html`: `<title>Countdown</title>`.
  - `project.json`, `serve-static` target options: add `"spa": true`, so Cypress deep links like `/events/boys-weekend-2024` get `index.html`. The `@nx/web:file-server` 23.2.1 schema has this option ("Redirect 404 errors to index.html"); this was checked.

- [ ] **Step 8: Run the tests and watch them pass.** `pnpm nx run-many -t lint test build` should be green.

- [ ] **Step 9: Check the service worker handles deep links offline.** `grep -o 'NavigationRoute[^;]*' dist/countdown-app/sw.js` must show a `NavigationRoute` bound to `index.html`. If it doesn't, set `workbox: { navigateFallback: 'index.html' }` in `VitePWA({...})` and rebuild.

- [ ] **Step 10: Commit** with `feat: browse past events and say when nothing is coming up` and the trailer.

---

### Task 6: End-to-end coverage

**Files:**

- Modify: `e2e/src/e2e/app.cy.ts`

**Interfaces:**

- Consumes: the seed config (Task 2) and the routes and copy (Task 5)

- [ ] **Step 1: Rewrite the spec.**

```ts
// Pinned to the shipped config in src/events/events.ts, so the assertions stay
// the same no matter when the suite runs.
const START_2025 = Date.parse('2025-07-17T16:30:00-05:00');
const END_2025 = Date.parse('2025-07-20T12:00:00-05:00');

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('home', () => {
  it('counts down to the next event', () => {
    cy.clock(START_2025 - (2 * DAY + 3 * HOUR + 4 * MINUTE + 5 * SECOND));
    cy.visit('/');
    cy.contains('Boys Weekend Countdown');
    cy.contains('Days').prev().should('have.text', '2');
    cy.contains('Hours').prev().should('have.text', '3');
    cy.contains('Minutes').prev().should('have.text', '4');
    cy.contains('Seconds').prev().should('have.text', '5');
  });

  it('says the event is here while it is live', () => {
    cy.clock(START_2025 + HOUR);
    cy.visit('/');
    cy.contains('Boys Weekend Is Here!');
    cy.contains('Days').should('not.exist');
  });

  it('says nothing is coming up once the last event is over', () => {
    cy.clock(END_2025 + DAY);
    cy.visit('/');
    cy.contains('No upcoming events');
    cy.contains('a', 'Boys Weekend').click();
    cy.location('pathname').should('eq', '/events/boys-weekend-2025');
    cy.contains('Jul 17, 2025');
  });
});

describe('archive', () => {
  it('lists events newest first', () => {
    cy.clock(END_2025 + DAY);
    cy.visit('/events');
    cy.get('li').should('have.length', 2);
    cy.get('li')
      .first()
      .should('contain', 'Jul 17, 2025')
      .and('contain', 'Past');
    cy.get('li').last().should('contain', 'Jul 18, 2024');
  });

  it('deep-links to a single event', () => {
    cy.clock(END_2025 + DAY);
    cy.visit('/events/boys-weekend-2024');
    cy.contains('Boys Weekend Is Here!');
    cy.contains('Jul 18, 2024');
  });

  it('shows not-found for an unknown event', () => {
    cy.clock(END_2025 + DAY);
    cy.visit('/events/nope');
    cy.contains('Event not found');
  });
});
```

- [ ] **Step 2: Run it.** `pnpm nx run e2e:e2e-ci` should report 6 passing. If a deep link 404s, Task 5 Step 7 (`spa`) isn't applied yet; fix that rather than weakening the test.

- [ ] **Step 3: Commit** with `test: cover the home states, archive and deep links end to end` and the trailer.

---

### Task 7: Final verification and PR

- [ ] **Step 1:** `pnpm nx format:check && pnpm nx run-many -t lint test build && pnpm nx run e2e:e2e-ci` must all be green. Record the output.
- [ ] **Step 2: Visual check.** Run `pnpm nx serve countdown-app`, open `/`, `/events`, `/events/boys-weekend-2024` and `/nope` at desktop width and at 375px (Playwright MCP or a browser). Save screenshots to the scratchpad for the PR. Check that the camp event looks the same as production v2.0.0.
- [ ] **Step 3:** Rebase on `origin/main`, push, and open a PR titled `feat: past events archive, themed events, and a no-upcoming state`. The body covers Why, What, the assumed end times (Sunday 12:00 Central), and the Evidence. End it with the Claude Code line.
- [ ] **Step 4:** After merge, confirm the Release workflow cuts `v2.1.0` and the live `/` shows "No upcoming events".
