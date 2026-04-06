# kykie.net Hockey Stats PWA — Handoff Document
**Version: 7.17.14 | Date: 6 April 2026**

## Project Overview
A Progressive Web App for live school hockey match stats, commentary, and analytics.
- **URL**: https://kykie.net (GitHub Pages, Afrihost DNS)
- **Repo**: github.com/henniewarnich/hockey-stats
- **Stack**: React 18 + Vite, Supabase (belveuygzinoipiwanwb.supabase.co), hash routing
- **Build**: `npm run build` → outputs to `docs/` folder
- **Email**: Resend (transactional) via `no-reply@kykie.net`, DMARC configured

## Critical Build Rules
- **NEVER build unless explicitly instructed** — always ask first
- **Always bump** `APP_VERSION` in `src/utils/constants.js` AND `version` in `package.json`
- Deliver as zip excluding `.git/` and `node_modules/`

## Team Credits & Tiers (NEW v7.17.0+)
- `team_credits` table: per-match credits for both teams
- `team_tiers` table: cached tier + admin override
- `recalc_team_tier` RPC recalculates from credit totals
- Tiers: Free (default), Free Plus (≥20 avg/match), Premium (override/paid)
- Credit values: schedule(5), score(5), live_pro(50), live_lite(10), video_same_day(30), video_older(20), viewer(1), correct_prediction(2), exact_score(5)

## Feature Gating (v7.17.5+)
| Feature | Free | Free+ | Premium |
|---|---|---|---|
| Own team stats + insights | ✓ | ✓ | ✓ |
| VS OPP + Benchmark columns | 🔒 | ✓ | ✓ |
| Opposition scouting | 🔒 | ✓ | ✓ |
| Visual play analysis | 🔒 | ✓ | ✓ |
| TOP10 benchmark | 🔒 | 🔒 | ✓ |

Gated on: CoachDashboard, CoachLiveScreen, TeamPage Overall, TeamPage Trends

## Info Landing Pages (v7.17.6)
- `#/info/coach` — feature cards, tier timeline, credits, CTA
- `#/info/commentator` — journey, vouchers, credits, CTA
- `#/info/supporter` — predict, viewer credits, sharing, CTA
- Homepage "Get involved" links to info pages

## Coach Overall Stats (REWRITTEN v7.17.10)
- Actual numbers (not offsets) in VS OPP and Benchmark
- Green/Yellow/Grey ranking per row
- "D-Entry" renamed from "Attack → D"
- Per-match averages below each stat
- Columns hidden for Free tier with lock teaser

## Commentator HomeScreen (v7.17.14)
- Removed Teams for plain commentators
- Added Training + My Credits menu items
- Commentator status override via admin User Management

## Delete Recording Only (v7.17.9)
- `🧹` button on GameReviewScreen (admin only)
- Keeps match result, deletes events/credits/assignments

## Key Bug Fixes This Session
- **Black screen on game review** — missing NavLogo import (v7.17.13)
- **0 events in credit statement** — Supabase 1000-row limit, now uses count query
- **Delete audit missing** — RPC now runs before local cleanup
- **Multi-word search** — cloud team data copied to local enhanced games
- **Premature end** — hides save, shows discard for <5min/<10events

## Migrations (run order)
```
upgrade-scripts/v7.16.28/ — Commentator tracking RLS + backfill
upgrade-scripts/v7.16.30/ — Personal credits backfill
upgrade-scripts/v7.17.0/  — Team credits tables + RPC + backfill
```

## Pending
- Prediction system (DB table, UI, auto-scoring)
- Training screen + benchmark test (next on commercialisation roadmap)
- Push notifications
- Desktop responsive layout
- AI Scout minimum event/duration threshold
- Staging environment
