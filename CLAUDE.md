# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Angular 21 (standalone components, zone.js) SPA that reads the websports.co.za API and shows live cricket scores, fixtures and player stats. Hosted on GitHub Pages at https://toby-mills.github.io/SportsBallPro/. [APPLICATION_ARCHITECTURE.md](APPLICATION_ARCHITECTURE.md) has a longer feature/architecture write-up (some of it may lag the code); [match-notifications-planning.md](match-notifications-planning.md) and related `*-planning.md` files document notification/commentary designs.

## Commands

- `npm start` — dev server at http://localhost:4200
- `npm test` — Karma/Jasmine (`ng test`); single spec: `npx ng test --include=src/app/services/match.service.spec.ts`
- `npm run build` — production build into `docs/` (the GitHub Pages source dir), then [move-build.js](move-build.js) flattens `docs/browser/*` into `docs/` and copies `index.html` to `404.html` (SPA routing fallback). The `docs/` output is committed, and the production `baseHref` is the absolute GitHub Pages URL.
- No lint script; code should be Prettier-formatted ([.editorconfig](.editorconfig)).

## Repo conventions (from [.github/copilot-instructions.md](.github/copilot-instructions.md))

- Run unit tests and format with Prettier before committing; keep `console.log` to a minimum.
- Standalone components, with separate `.ts`/`.html`/`.css` files.
- Surgical changes: match existing style, don't refactor or clean up adjacent code, mention unrelated dead code rather than deleting it.

## Architecture

- **Areas**: [app.routes.ts](src/app/app.routes.ts) defines three parallel areas (`/wynberg`, `/main`, `/rondebosch`), each wrapped in `AppLayoutComponent` with `data: { area }`. Area-specific behaviour (separate watch lists, club fixture pages configured via route `data`) keys off that value. `/match/:id` uses `MinimalLayoutComponent` for shareable single-match links; `match/:id` inside an area goes through `MatchRedirectComponent`.
- **Match IDs are encrypted**: `MatchKeyService` AES-encrypts game IDs (crypto-es) for URLs; decrypt before calling the API.
- **API layer**: `WebSportsAPIService` wraps the REST API. The API returns HTTP 200 even for errors, so `apiErrorInterceptor` (registered in [app.config.ts](src/app/app.config.ts)) converts error payloads into real HTTP errors using type guards in `models/api-response.ts`.
- **State**: `MatchService` is the central store — Maps keyed by compound (gameId, innings, team) holding `BehaviorSubject`s, with polling for live updates and transformation of API models (`models/web-sports.ts`) into internal models. Components subscribe to its streams rather than calling the API directly.
- **Other services**: `WatchListService` (localStorage, per-area, max 10), `PlayerAggregationService` (forkJoin across fixtures for stats), `FixtureSearchService`/`FixtureDetailsService` (caching), `StatsStateService` (preserves stats page filters across navigation), `ToasterMessageService` (global toasts).
- **Notifications**: `notification-monitor.service`, `event-detection.service`, `notification.service` and `notification-preferences.service` detect match events (e.g. wickets) from `MatchService` updates and surface them per user preferences.
- Charts use ng2-charts/Chart.js, registered globally via `provideCharts` in app config.
