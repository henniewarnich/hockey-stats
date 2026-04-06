# kykie.net — Next Session Planning
**Date: 6 April 2026 | Current Version: 7.17.14**

## Deploy Checklist
- Push v7.17.14 to GitHub, verify on kykie.net
- Migrations already run: v7.17.0 (team credits + backfill)
- Test: info pages, feature gating, commentator home, delete recording

## Immediate Priorities

### 1. Prediction System
- DB: `predictions` table (user_id, match_id, home_score, away_score, created_at)
- UI: prediction card on upcoming matches (team page + supporter view)
- Auto-scoring: on match end, check predictions → award team credits (+2 correct result, +5 exact score)
- Leaderboard: "23 predictions so far" FOMO on match cards
- Already referenced in Supporter info page and commercialisation-strategy.md

### 2. Training Screen + Benchmark Test
- Next on commercialisation roadmap
- Trainee → watch training materials → pass benchmark → apprentice
- Benchmark: record a sample match from provided video, score against expected events
- Training menu item already wired for commentators

### 3. CoachDashboard Results Count
- Currently shows 6 results vs 27 total on TeamPage
- May be team assignment mismatch or query filtering issue
- Investigate: are coach_teams IDs matching the team IDs used in matches?

### 4. Desktop Responsive Layout
- Current mobile-first design needs responsive breakpoints
- Headers, match cards, and stat grids should adapt

## Parked Items
- Personal credits + vouchers (functional, backfill done)
- Team credits + tiers (functional, backfill done)
- Coach dashboard progress (functional)
- Feature gating (functional across all screens)
- Share-to-earn
- Sponsor integration (SponsorManagementScreen built)
- Push notifications (iOS 16.4+ PWA limitation)
- Staging environment (second Supabase project + test.kykie.net)
- AI Scout minimum event/duration threshold filter

## Session Summary (v7.16.35 → v7.17.14)

### Team Credits Backend (v7.17.0)
- `team_credits` + `team_tiers` tables, `recalc_team_tier` RPC
- Wired into all 4 award flows (live, video, quick, schedule)
- Both teams credited equally per match
- Backfill SQL from audit_log

### Feature Gating (v7.17.5+)
- CoachDashboard: opp scouting locked for Free
- CoachLiveScreen: visuals tab locked for Free
- TeamPage Overall: VS OPP + Benchmark columns hidden for Free
- TeamPage Trends: locked teaser for Free
- Admin/CommAdmin bypass on game history coach_view

### Info Landing Pages (v7.17.6)
- CoachInfoScreen, CommentatorInfoScreen, SupporterInfoScreen
- Tappable feature cards with visual previews
- Tier timelines, credit tables, CTAs
- Predict feature on supporter page
- Homepage "Get involved" → info pages → register

### Coach Overall Rewrite (v7.17.10)
- Actual numbers (not offsets) for all 3 columns
- Green/Yellow/Grey rank3 coloring
- D-Entry renamed, per-match averages added
- "x of y" detail removed

### Admin Features
- Team tier badges + override popup on TeamsScreen
- Commentator status override (trainee/apprentice/qualified)
- Delete Recording Only button with audit
- Credit statement: correct event counts, expandable stats, recording timestamp
- Match deletion audit trail fixed (RPC first, then local)

### Bug Fixes
- Game History multi-word search (cloud team data to local games)
- Black screen on match detail (missing NavLogo import)
- 0 events in credit statement (count query vs row fetch)
- Premature end: discard instead of save for short recordings
- Register button routes (register?role= parsed)
- Commentator HomeScreen: removed Teams, added Training + Credits

## Key Files Changed
| File | Changes |
|---|---|
| `src/utils/credits.js` | Team credit functions, tier logic, FREE_PLUS_THRESHOLD |
| `src/components/CoachOverall.jsx` | Full rewrite: actual numbers, rank3, gating |
| `src/screens/TeamPage.jsx` | teamTier state, gated trends tab, passed to CoachLiveScreen |
| `src/screens/CoachDashboard.jsx` | Progress bar, opp scouting gate, tier fetch |
| `src/screens/CoachLiveScreen.jsx` | Visuals gate, teamTier prop, D-Entry rename |
| `src/screens/TeamsScreen.jsx` | Tier badges, override popup |
| `src/screens/HomeScreen.jsx` | Commentator menu: no Teams, + Training, + Credits |
| `src/screens/UserManagementScreen.jsx` | Commentator status pills + audit |
| `src/screens/AdminCreditsScreen.jsx` | Count fix, expandable stats, recording timestamp |
| `src/screens/GameReviewScreen.jsx` | Delete Recording Only, NavLogo fix |
| `src/screens/LiveMatchScreen.jsx` | Premature end warning, discard button |
| `src/screens/HistoryScreen.jsx` | Multi-word search fix, cloud team data merge |
| `src/screens/CoachInfoScreen.jsx` | NEW — coach landing page |
| `src/screens/CommentatorInfoScreen.jsx` | NEW — commentator landing page |
| `src/screens/SupporterInfoScreen.jsx` | NEW — supporter landing page with predict |
| `src/hooks/useMatchStore.js` | deleteGameLocal() added |
| `src/App.jsx` | Info routes, register?role=, training nav, deletion fix |
| `upgrade-scripts/v7.17.0/` | Team credits migration + backfill |
