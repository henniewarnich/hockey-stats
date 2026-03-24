# kykie.net Hockey Stats PWA — Handoff Document
**Version: 7.3.2 | Date: 24 March 2026**

## Project Overview
A Progressive Web App for live school hockey match stats, commentary, and analytics.
- **URL**: https://kykie.net (GitHub Pages, Afrihost DNS)
- **Repo**: github.com/henniewarnich/hockey-stats
- **Stack**: React 18 + Vite, Supabase (belveuygzinoipiwanwb.supabase.co), hash routing
- **Build**: `npm run build` → outputs to `docs/` folder

## Critical Build Rules
- **NEVER build unless explicitly instructed** — always ask first
- **Always bump** `APP_VERSION` in `src/utils/constants.js` AND `version` in `package.json` before building
- **Run `npm run build`** so `docs/` folder is updated
- Deliver as zip excluding `.git/` and `node_modules/`

## Architecture

### Roles & Routes
| Role | Route | Access |
|------|-------|--------|
| Public | `#/team/{slug}` | Score, commentary, emoji reactions via team URL |
| Commentator | `#/record` | Dashboard with assigned matches, quick score + live, viewer count |
| Comm Admin | `#/admin` | Everything commentator + schedule matches, manage assigned matches |
| Coach | `#/coach` | Dashboard → team pages with Overall/Matches/Trends/Live Stats tabs |
| Admin | `#/admin` | Full access: teams, users, matches, schedule, rankings, history |

### Landing Page (`kykie.net`)
- 4 tabs: Live / Upcoming / Results / Teams
- Sport dropdown (Girls Hockey active, others "Coming soon")
- Shared search bar with sport pill
- Sticky tabs + search on scroll (logo scrolls away)
- Team color on date badges (solid fill, white text)
- Countdown to kickoff on Upcoming tab

### Team Page (`#/team/{slug}`)
- **Public view**: Results tab with match cards, tap for commentary detail
- **Coach view**: Overall (default) / Matches / Trends / Live Stats tabs
- Sticky kykie header with refresh icon + login
- Tabs hidden when viewing match detail
- Emoji reactions on commentary events
- Persistent viewer tracking

### Key Screens
- `LandingPage.jsx` — Public landing with all 4 tabs
- `TeamPage.jsx` — Public + Coach team view (biggest file ~910 lines)
- `LiveMatchScreen.jsx` — Live match recorder (field, scoreboard, events)
- `CoachLiveScreen.jsx` — Coach stats view (quarters, totals, insights)
- `MatchScheduleScreen.jsx` — Admin match scheduling + Start Live + Quick Score
- `CommentatorDashboard.jsx` — Commentator's assigned matches
- `CoachDashboard.jsx` — Coach's assigned teams + upcoming
- `UserManagementScreen.jsx` — Admin user CRUD with Active/Blocked tabs
- `RankingsScreen.jsx` — Admin ranking set management + per-team position editing
- `LoginPage.jsx` — Remembers last username

### Supabase Tables
- `teams` — Team name, color
- `matches` — home/away team IDs, scores, status, date, venue, match_type, created_by, home_rank, away_rank, home_prev_rank, away_prev_rank
- `match_events` — Full event stream (team, event, zone, detail, match_time, seq)
- `profiles` — User data (firstname, lastname, username, email, role, blocked)
- `coach_teams` — Coach-to-team assignments
- `match_commentators` — Commentator-to-match assignments
- `event_reactions` — Emoji reactions (match_event_id, emoji, viewer_id)
- `match_viewers` — Persistent viewer tracking per match
- `ranking_sets` — Ranking snapshots (scraped_at, ranking_date, source_url, notes)
- `rankings` — Team positions within a ranking set (position, points)
- `audit_log` — All delete actions logged

### Supabase RPC Functions (SECURITY DEFINER)
- `create_profile(p_id, p_email, p_firstname, p_lastname, p_username, p_role)` — Bypasses RLS for user creation
- `delete_user(p_id)` — Deletes profile + auth user, logs to audit
- `delete_match(p_match_id, p_user_id)` — Permission-based delete with audit (admin=any, comm admin=own)
- `snapshot_match_rankings(p_match_id)` — Snapshots latest rankings onto match
- `log_audit(p_user_id, p_action, p_target_type, p_target_id, p_details)` — Generic audit logger

### Key Utilities
- `src/utils/sync.js` — Supabase CRUD (scheduleMatch, createLiveMatch, pushLiveEvent, snapshotRankings, fetchLatestRankings, etc.)
- `src/utils/auth.js` — Auth (signIn, createUser, listUsers, coach assignments)
- `src/utils/stats.js` — Shared stat computation (computeStats, computeMatchStats, aggregateStats, getQuarters)
- `src/utils/helpers.js` — ensureContrastingColors, otherTeam, uid
- `src/utils/constants.js` — APP_VERSION, TEAM_COLORS, BREAK_FORMATS, MATCH_TYPES
- `src/components/NavLogo.jsx` — Shared kykie logo for admin nav bars

### New Components (v7.0.0)
- `src/components/CoachOverall.jsx` — Season aggregated stats (conversion rates, stat bars, per-match averages)
- `src/components/CoachTrends.jsx` — Weekly trend charts (ranking, GD, territory, possession, D-entries, short corners)
- `src/components/RankBadge.jsx` — Inline rank badge with trend indicator (▲improved / ▼dropped / #unchanged)
- `src/components/MiniChart.jsx` — Shared SVG trend chart with value labels, supports compact mode (CoachTrends + CoachDashboard)

### Important Notes
- **Trigger disabled**: `on_auth_user_created` trigger was dropped. Profile creation is handled app-side via `create_profile` RPC.
- **Match type**: "festival" renamed to "tournament" everywhere
- **Chrome translate popup**: Blocked via `translate="no"` + `notranslate` meta tag
- **Team color contrast**: `ensureContrastingColors()` auto-picks contrasting away color when teams share colors
- **Ball flip**: When field flips, ball position (left/right, top/bottom) mirrors in state
- **Sideline out**: Ball moves to zone where OUT was tapped
- **SAST timezone**: All `match_date`/`scheduled_time` display uses `parseSAST()`/`parseSASTDate()` with explicit `+02:00` offset. Never use bare `new Date(match_date)` for display.
- **Ranking badges**: Past matches use snapshotted `home_rank`/`home_prev_rank` columns. Upcoming/live use `fetchLatestRankings()` which returns a `teamId → {rank, prevRank}` map. Run `migration-prev-ranks.sql` before deploying v7.1.0.

## TODO / Backlog

### High Priority
- **localStorage phase-out** — Deprioritised: local-first pattern provides offline resilience for dodgy venue WiFi. Current merge logic works. Could tighten merge/sync UX if needed.

### Medium Priority
- **PDF export** — Match reports for coaches
- **Dashboard/analytics** — Aggregate stats across all teams (admin view)
- **Rankings UI** — Display SA school rankings as standalone page (ranking badges on match cards done in v7.1.0)
- **Push notifications** — Notify when matches go live

### Low Priority / Future
- **Voice recorder** — Audio commentary
- **Multi-sport** — Boys Hockey, Rugby, Netball, Cricket (sport dropdown ready, just needs data model extension)

### Known Issues to Watch
- **Emoji reactions**: Were double-counting (fixed via ignoring own viewer in realtime handler). Watch for regressions.
- **Commentator live resume**: After refresh, commentator sees "Continue Recording" button. Timer state doesn't persist (starts from 0).
- **RLS complexity**: Multiple overlapping policies on profiles table. New features may need policy updates.

## File Structure
```
hockey-stats/
├── index.html                    # Source HTML (translate=no)
├── package.json                  # v7.3.2
├── vite.config.js
├── docs/                         # Built output (GitHub Pages)
├── src/
│   ├── main.jsx                  # Entry point
│   ├── App.jsx                   # Router, auth, state management
│   ├── components/
│   │   ├── CoachOverall.jsx      # Season aggregated stats
│   │   ├── CoachTrends.jsx       # Weekly trend charts
│   │   ├── DPopup.jsx            # D-circle action popup
│   │   ├── EventLog.jsx          # Match event log
│   │   ├── FieldRecorder.jsx     # Hockey field recorder
│   │   ├── NavLogo.jsx           # Shared admin nav logo
│   │   ├── PausePopup.jsx        # Pause reason selector
│   │   ├── ReactionBar.jsx       # Emoji reaction buttons
│   │   ├── RankBadge.jsx         # Inline rank + trend badge
│   │   ├── MiniChart.jsx         # Shared SVG trend chart (compact + full)
│   │   ├── Scoreboard.jsx        # Match scoreboard
│   │   └── TeamPicker.jsx        # Team selection
│   ├── hooks/
│   │   ├── useAutoSave.js        # Auto-save to localStorage
│   │   ├── useMatchStore.js      # Local game storage
│   │   ├── useMatchTimer.js      # Match clock
│   │   └── useReactions.js       # Emoji reaction hook
│   ├── screens/                  # All screen components
│   └── utils/                    # Auth, sync, stats, helpers
├── upgrade-scripts/
│   ├── baseline/                 # Original schema + pre-v7 migrations + README
│   ├── v7.1.0/                   # migration-prev-ranks.sql + README
│   └── v7.2.0/                   # migration-ranking-date.sql + README
```

## Session Summary (v6.3.0 → v7.3.2)

### Phase 3 Features
- Coach-team assignment, coach dashboard, upcoming matches
- Cloud match review, emoji reactions, persistent viewer tracking
- PIN system removed, Supabase Auth for all roles

### UI/UX
- "kykie" branding (dropped ".net"), NavLogo on all admin screens
- Merged search + sport pill, sticky headers on landing + team pages
- Team color date badges (solid fill), commentary latest-first
- Sign in/out moved to top bar on all screens
- Refresh icon (SVG, spins) in team page header
- Active/Blocked user tabs

### Admin
- Start Live + Quick Score from Match Schedule screen
- Countdown to kickoff, search bar on matches
- Permission-based delete with audit logging
- SECURITY DEFINER functions for user CRUD

### Commentator
- Continue Recording button for live matches
- N+1 query fix (129 queries → 1)

### Field Recorder
- Sideline out moves ball to correct zone
- Ball position mirrors on field flip
- Team color contrast for same-color teams

### Data
- Rankings snapshot on match create/start/quick score
- Festival → Tournament rename with migration
- Audit log for all deletes

### v7.0.2 — SAST Timezone Fix
- Added `parseSAST(matchDate, scheduledTime)` and `parseSASTDate(matchDate)` helpers in `helpers.js`
- All `match_date` / `scheduled_time` display now parsed with explicit `+02:00` SAST offset
- Fixes: countdown timers, date badges, sort order for viewers outside SAST timezone
- Uses noon anchor (`T12:00:00+02:00`) for date-only parsing to prevent day rollover in any timezone
- Files changed: helpers.js, LandingPage, MatchScheduleScreen, TeamPage, CommentatorDashboard, CommentatorPage, CoachDashboard, CoachTrends
- localStorage phase-out deprioritised (offline resilience needed for dodgy venue WiFi)

### v7.1.0 — Ranking Badges on Match Cards
- New `RankBadge` component: inline rank with trend indicator (▲green improved, ▼red dropped, #amber unchanged)
- Format: `prevRank ▲ rank` (e.g. `6▲4`), unchanged shows `#7`
- Past matches use snapshotted `home_rank`/`away_rank` + new `home_prev_rank`/`away_prev_rank` columns
- Upcoming/live matches use latest rankings fetched via `fetchLatestRankings()` (2 ranking sets, one query, cached in state)
- Migration `migration-prev-ranks.sql`: adds `home_prev_rank`/`away_prev_rank` columns, updates `snapshot_match_rankings` to capture both current and previous positions
- Wired into all match card locations: LandingPage (Live/Upcoming/Results), TeamPage (upcoming/results/detail header), CommentatorDashboard (MatchCard/completed/quick score), MatchScheduleScreen (list/quick score), CommentatorPage (results)
- Team page shows opponent rank only; landing page shows both teams
- Zero performance impact on past matches (data already in `select *`), one extra query for upcoming

### v7.1.1 — Trends Chart Fix
- MiniChart value labels on all data points
- Ranking data sorted client-side (ascending by scraped_at) — fixes newest-left bug
- Chart height increased to accommodate value labels above dots

### v7.2.0 — Rankings Admin + Teams Tab Badges
- New `RankingsScreen` (admin only): list ranking sets, edit positions per team, add missing teams
- Migration `migration-ranking-date.sql`: adds `ranking_date` column to `ranking_sets`
- Rankings nav item on admin HomeScreen (🏆)
- Rank badges on Teams tab (LandingPage)
- Search + filter (All/Ranked/Unranked) on ranking editor
- Visual tags: green NEW for additions, amber CHANGED for edits

### v7.2.2 — Coach Insights Colour Restyle
- Fixed green/grey palette for CoachLiveScreen (HC=#22C55E, AC=#64748B)
- No team colours in coach insights — always green=home, grey=away
- Team names white, team abbreviations green/grey
- Insight icons: `+` (strength), `!` (weakness), `■` (info) — no emoji
- Left border accent on match insight cards
- Stat bars, territory/possession bars all green vs grey

### v7.3.0 — Coach Dashboard Tabs + Opposition Scouting
- CoachDashboard rewritten: Upcoming/Results tabs replace "View Stats →" link
- Results tab with W/D/L badges, opponent rank, scores, tap to view detail
- Opposition scouting panel on upcoming matches: form dots (last 5 W/D/L), GF:GA ratio
- Default tab auto-selects based on data availability
- Team name/icon still navigates to full team stats page

### v7.3.1 — Opposition Trend Charts
- Extracted `MiniChart` into shared component (`src/components/MiniChart.jsx`)
- `compact` prop for embedded use (smaller height, no card wrapper)
- CoachDashboard scouting panel now shows Ranking + GD MiniCharts per opponent
- Ranking history fetched in one batched query for all opponents
- Weekly GD computed client-side from existing match data
- Fallback: "No match history available" when no data exists
- Stale `audit_matches` trigger discovered and documented (must be dropped manually — see Known Issues)

### Known Issues to Watch (updated)
- **Stale `audit_matches` trigger**: A broken trigger on the `matches` table fires `log_audit()` which references columns that don't exist in `audit_log`. Must be manually dropped: `DROP TRIGGER audit_matches ON matches;`. App audit logging uses RPC functions, not this trigger.

### v7.3.2 — MiniChart Fixes + Upgrade Scripts
- Fixed value labels clipping at chart edges (first point left-aligned, last right-aligned)
- Flat data (all values identical) or single data point now shows header only, no chart
- Trend indicator hidden when unchanged (no more "— 0" display)
- Increased padding in compact mode
- Upgrade scripts organized into `upgrade-scripts/v7.1.0/` and `upgrade-scripts/v7.2.0/` with READMEs
