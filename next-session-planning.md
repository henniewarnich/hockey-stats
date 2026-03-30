# kykie.net — Next Session Planning
**Date: 30 March 2026 | Current Version: 7.10.0**

## Immediate TODO (Before Deploying v7.10.0)

### 1. Run Migration
```sql
-- Run in Supabase SQL Editor:
-- upgrade-scripts/v7.10.0/migration-institutions.sql
-- Then verify:
SELECT count(*) FROM institutions;
SELECT t.name, t.team_description, t.gender, t.age_group, t.sport, i.name AS inst_name, i.short_name
FROM teams t LEFT JOIN institutions i ON t.institution_id = i.id LIMIT 20;
```

### 2. Verify Short Names
After migration, check which institutions need short_name populated:
```sql
SELECT id, name, short_name FROM institutions WHERE short_name IS NULL ORDER BY name;
-- Update manually, e.g.:
-- UPDATE institutions SET short_name = 'PG' WHERE name = 'Paarl Girls High';
```
short_name is what shows on scoreboards, match cards, and predictions. Without it, the full institution name shows.

### 3. Deploy & Test
- Push to GitHub, verify on kykie.net
- Check: Landing page shows institution names, not "Girls Hockey 1st"
- Check: Team search works on institution names
- Check: Scoreboards show short_name during live matches
- Check: Coach dashboard shows institution names
- Check: Predictions display correctly with short names

---

## Remaining Institution Tasks (Next Session)

### TeamsScreen Redesign (Task 6)
Current TeamsScreen CRUD form only edits team.name. Needs:
- Institution picker (search existing or create new)
- Team fields: gender dropdown, age_group dropdown, sport dropdown
- Institution fields: name, short_name, other_names, color
- Preview showing "PG Girls Hockey 1st" format
- Ability to create a second team under the same institution (e.g. U16)

### suggestTeam() Update
Crowd team suggestion flow needs to:
- Ask for institution name (or pick existing)
- Create institution with status=pending alongside team
- Admin approves both together

### App.jsx getTeamShareLink
Currently receives a name string. Should receive a team object and use `teamSlug(team)`.

---

## Planned Features

### Prediction Scoring on Match End
Auto-score predictions when match ends (currently only via Retrofit).

### Reclassify Toast (Mockup Ready)
After zone tap: "↑ Overhead" toast for 3 seconds. After turnover: "🏑 Free Hit" toast.

### Possession Heatmap (Coach View)
4×3 grid showing time in possession per zone. Verified with real match data.

### Exit Strategy Analysis (Coach View)
Tracks ball from defense → opposition half. 4×3 heatmap of transit zones.

### D Entry Direction (Coach View)
Which side teams approach the D from (left/centre/right).

### Staging Environment
Second Supabase project + test.kykie.net subdomain.

### Embeddable Widgets
Iframe embeds for school websites.

### Organisation → Team Hierarchy
Now partially done via institutions. Full org hierarchy enables multi-sport, multi-age, org-level subscriptions.

---

## Architecture Notes

### Institution Display Rules
- `teamDisplayName(team)` = institution.short_name + " " + team.name (e.g. "PG Girls Hockey 1st")
- `teamShortName(team)` = institution.short_name || institution.name (e.g. "PG" or "Paarl Girls")
- `teamColor(team)` = institution.color || team.color
- `teamSlug(team)` = slug of institution.name (used for URLs)
- `teamMatchesSearch(team, query)` = searches institution.name + short_name + other_names + team.name + team_description
- All query constants in `src/utils/teams.js`: `TEAM_SELECT`, `MATCH_HOME_TEAM`, `MATCH_AWAY_TEAM`, etc.

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
1. **`hockey-stats-v7.10.0.zip`** — Full source + built docs/
2. **`HANDOFF.md`** (inside zip) — Complete project state
3. **This file** (`next-session-planning.md`) — Context and plans

## Supabase Project Details
- **URL**: belveuygzinoipiwanwb.supabase.co
- **Domain**: kykie.net (Afrihost DNS, GitHub Pages)
- **Repo**: github.com/henniewarnich/hockey-stats
