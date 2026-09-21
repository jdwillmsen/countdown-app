# Countdown App

[![CI](https://github.com/jdwillmsen/countdown-app/actions/workflows/ci.yml/badge.svg)](https://github.com/jdwillmsen/countdown-app/actions/workflows/ci.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/afd102e7-7bdb-423a-90df-9832bcbc8efa/deploy-status)](https://app.netlify.com/sites/boys-weekend-countdown/deploys)

A countdown to the next boys weekend, built with React, Vite and Nx and hosted
on Netlify.

## Develop

```sh
pnpm install
pnpm nx serve countdown-app            # http://localhost:4200
pnpm nx run-many -t lint test build    # what CI runs, plus e2e below
pnpm nx run e2e:e2e-ci                 # Cypress against the production build
```

Node comes from `.nvmrc` and pnpm from the `packageManager` field in
`package.json`.

## Release & deploy

Releases are automatic. After CI passes on a push to `main`, the Release
workflow runs [semantic-release](https://semantic-release.gitbook.io/), which
derives the next version from the [Conventional Commits](https://www.conventionalcommits.org/)
since the last tag:

- `feat` releases a minor, `fix` and `perf` a patch, and a `!` or
  `BREAKING CHANGE` footer a major.
- `chore(deps)` (a runtime dependency bump) releases a patch;
  `chore(deps-dev)`, `ci`, `build`, `docs`, `test` and other chores release
  nothing.

When a version is cut, the workflow tags the commit `vX.Y.Z`, publishes a
GitHub release with generated notes, builds that tag with the version shown in
the corner of the page, and deploys it to Netlify production. That deploy is
the only thing that changes production: `netlify.toml` makes Netlify skip its
own production builds, while pull requests still get deploy previews.

No changelog file is committed, since `main` accepts no direct pushes. The
GitHub releases are the changelog.

### One-time setup

The deploy needs a Netlify personal access token stored as the repository
secret `NETLIFY_AUTH_TOKEN` (Settings, Secrets and variables, Actions).
Without it the Release workflow fails before tagging, so no version is cut that
cannot go live.
