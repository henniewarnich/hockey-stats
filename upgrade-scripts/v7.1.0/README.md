# v7.1.0 Upgrade Scripts

Run in order:

1. `migration-prev-ranks.sql` — Adds `home_prev_rank` / `away_prev_rank` columns to matches table and updates `snapshot_match_rankings` function to capture both current and previous ranking positions.

2. After running the migration, backfill existing matches:
```sql
-- Drop the stale audit trigger first (if not already done)
DROP TRIGGER IF EXISTS audit_matches ON matches;

-- Backfill rankings on all matches
DO $$
DECLARE m RECORD;
BEGIN
  FOR m IN SELECT id FROM matches WHERE home_rank IS NULL LOOP
    PERFORM snapshot_match_rankings(m.id);
  END LOOP;
END $$;
```
