# kykie.net — Next Session Planning
**Date: 31 March 2026 | Current Version: 7.10.35**

## Immediate TODO

### 1. Pending Migration
```sql
-- If not already run:
ALTER TABLE teams ADD COLUMN IF NOT EXISTS variant TEXT;
```

### 2. Known Bugs
- ~~**Admin → Users → Add Coach → Team selection pills show wrong team name**~~ — FIXED v7.10.35
- **suggestTeam()** — crowd team suggestion needs institution creation flow
- **App.jsx getTeamShareLink** — receives name string, should receive team object

---

## Planned Features (Prioritised)

### HIGH PRIORITY
**Bugs / Cleanup:**
- `suggestTeam()` — institution creation flow for crowd suggestions
- `getTeamShareLink` — receives string, should receive team object

**Public View:**
- Wire outcome predictor to public view (Pete, Suzi, Kykie already exist)

**Coach:**
- Compare to team (side-by-side stats)
- Compare to benchmark (top 10 average)
- Analyse team (Exit/Attack/Midfield strategies)

**Commentator:**
- Green + Yellow cards
- Revisit D-Zone stats collector
- Penalty strokes
- Overheads recording

**Video Review:**
- Playback speed control (1x / 1.5x / 2x)

**Infrastructure:**
- Prediction auto-scoring on match end
- Reclassify toast (Overhead / Free Hit)
- Organisation → Team hierarchy (multi-sport)

### MEDIUM PRIORITY
**Admin:**
- Stats interpretation skill (MD) for Claude analysis

**Coach:**
- Possession heatmap (Coach View)
- Exit strategy analysis (Coach View)
- D entry direction analysis (Coach View)

**Infrastructure:**
- Staging environment (test.kykie.net)

### LOW PRIORITY
**Public View:**
- Screen viewer (CT-style commentary feed)

**Match Setup:**
- Season field (derive from match date year)
- Tournament selection (create/pick, link matches)

**Coach:**
- Filter stats by Season and Tournament
- Replay match (animated field play-by-play)

**Commentator:**
- Goalie saves — clarify saved vs missed

**Infrastructure:**
- Embeddable widgets for school websites

---

## Architecture Notes

### Institution Display Rules
- `teamDerivedName(team)` = gender + sport + age_group (or variant if set, replacing age_group)
- `teamDisplayName(team)` = institution short_name/name + derived (auto-dedupes gender)
- `teamShortName(team)` = institution.short_name || institution.name
- `teamColor(team)` = institution.color || team.color
- `teamSlug(team)` = slug of institution.name + age_group/variant (e.g. "paarl-gim-1st", "paarl-gim-2nd")
- `teamMatchesSearch(team, query)` = searches institution.name + short_name + other_names + derived name + team_description
- All query constants in `src/utils/teams.js`: `TEAM_SELECT`, `MATCH_HOME_TEAM`, `MATCH_AWAY_TEAM`, etc.
- `MatchCardTeams` component: two-line display (institution names + rank on line 1, derived + meta on line 2)
- `FilterBar` component: cycling pills for Sport/Gender/Age across all landing page tabs

### Stats Engine
- ONE button (Recompute All Stats) rebuilds everything from raw events
- `archiveMatchStats` is idempotent: delete + insert, returns `{ ok, reason }`
- Events fetched per match with `.limit(5000)` (never batch)

### Prediction Engine
- `predictMatch()` in predict.js: V2 model with draw boost (0.5 multiplier)
- Fallback to ranking-based when <5 games
- `retrofitPredictions()` in sync.js: builds progressive records chronologically
- Kykie (user_id=null), Pete, Suzi all predict every match

### RLS Rules
- NEVER use `FOR ALL` policies alongside public SELECT
- Always split into separate INSERT/UPDATE/DELETE policies
- `institutions`: public SELECT + auth INSERT/UPDATE/DELETE

---

## Files to Provide to Next Session
1. **`hockey-stats-v7.10.35.zip`** — Full source + built docs/
2. **`HANDOFF.md`** (inside zip) — Complete project state
3. **This file** (`next-session-planning.md`) — Context and plans

## Supabase Project Details
- **URL**: belveuygzinoipiwanwb.supabase.co
- **Domain**: kykie.net (Afrihost DNS, GitHub Pages)
- **Repo**: github.com/henniewarnich/hockey-stats
