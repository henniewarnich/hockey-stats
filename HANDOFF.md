# kykie.net Hockey Stats PWA — Handoff Document
**Version: 7.17.30 | Date: 7 April 2026**

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

## Coach Experience (v7.17.25+)
- **Single team (90% of coaches)**: `#/coach` → instant redirect to `#/team/{slug}` → stats visible immediately
- **Multi-team**: Redirect to first team + dropdown at top of TeamPage to switch
- **TeamPage for coaches**: Badge + name (or dropdown) → Stats strip (P/W/D/L/GF/GA/GD) → Overall/Matches/Visuals tabs → Contribute grid (Submit result, Add fixture, Suggest team, Report issue) → Security
- **Coach approval**: Register via `#/register?role=coach` → `coach_status: 'pending'` → admin approves in User Management

## Feature Gating (Free / Free Plus / Premium)
| Tier | Threshold | Visible |
|------|-----------|---------|
| Free | Always | Own team stats. VS OPP + Benchmark blurred (`blur(6px)`) |
| Free Plus | Team avg ≥ 20 credits/match (ALL ended matches) | All 3 columns clear, green/yellow/grey ranking, Trends/Visuals |
| Premium | R5,000/yr admin override | TOP10 benchmarks, AI scouting (future) |

Practical unlock message: "110 credits short (4.8 avg × 23 matches). Record 6 matches from video to unlock."

## D-Entry Stat (v7.17.30)
- **Atk chances**: Distinct attacking opportunities counted via sequential event stream analysis (zone crossings, set pieces, turnovers in atk zone)
- **Attack → D**: `dEntries / atkChances` — true conversion rate
- Old `atkZoneEntries` (every event in opp quarter) replaced

## Commentator HomeScreen
Training → Try Demo Match → Match Schedule → New Match → Game History → My Credits (qualified only).
No "Teams" for commentators. Apprentice can schedule + demo. JSON Import admin-only.

## Live Match End Actions
| Condition | Button | Effect |
|---|---|---|
| Normal (>5min, >10 events) | End & Save | Saves match + credits |
| Normal | Match Abandoned (weather/other) | Status = abandoned, points shared |
| Premature (<5min or <10 events) | Discard Recording | Deletes events, reverts to upcoming |
| Demo | End & Discard / Cancel Demo | No save |

## Pending Migrations
```
upgrade-scripts/v7.17.20/fix-tier-calculation.sql       — Fix recalc_team_tier RPC (all matches)
upgrade-scripts/v7.17.20/backfill-team-credits-v2.sql   — Rebuild team credits from matches
upgrade-scripts/v7.17.24/migration-coach-approval.sql   — coach_status column
```

## All Migrations (run order)
```
baseline/ → v7.1.0/ → v7.2.0/ → v7.4.5/ → v7.6.0/ → v7.7.0/ → v7.9.0/
→ v7.12.5/ → v7.13.0/ → v7.17.0/ → v7.17.20/ → v7.17.24/
```

## Key Files
| File | Purpose |
|---|---|
| `src/utils/stats.js` | computeMatchStats, computeAtkChances, aggregateStats |
| `src/utils/credits.js` | Team credits, FREE_PLUS_THRESHOLD, tier functions |
| `src/components/CoachOverall.jsx` | Blur gating, rank3, Atk chances + Attack→D |
| `src/screens/CoachDashboard.jsx` | Thin redirector (47 lines) → TeamPage |
| `src/screens/TeamPage.jsx` | Team dropdown, stats strip, contribute grid, tier |
| `src/screens/HomeScreen.jsx` | Commentator menu layout |
| `src/screens/LiveMatchScreen.jsx` | Discard/Abandon/End, Cancel Demo |
| `src/screens/RegisterPage.jsx` | URL param role pre-selection |
| `src/screens/UserManagementScreen.jsx` | Coach + commentator status pills |
| `src/screens/HistoryScreen.jsx` | gameSearchStr with try-catch |

## Known Issues
- Commentator timer resume: starts from 0 after refresh
- Normalisation: 25min vs 60min matches not yet normalised (parked)
- Resend emails may land in spam initially
