-- ============================================
-- kykie.net v7.23.5 — Backfill Turnover Won zones
-- ============================================
-- A bug in Live Pro hardcoded zone='Centre' on every Turnover Won
-- event (LiveMatchScreen handleBallTap). The matching Poss Conceded
-- event from the opposite team — same match, within ±2 seconds of
-- match_time — carries the correct zone.
--
-- This script:
--   1. Previews how many Turnover Won @ Centre rows have a matching
--      Poss Conceded with a real zone we can copy across
--   2. Applies the update
--   3. Reports remaining Turnover Won @ Centre rows after backfill
--
-- SAFETY: ends with ROLLBACK by default. To actually apply, change the
-- final ROLLBACK to COMMIT after reviewing the preview counts.
--
-- Run in Supabase SQL editor (production AND staging).

BEGIN;

-- ── 1. Preview: how many rows will be updated ──────────────────
SELECT
  COUNT(*) AS will_update,
  COUNT(*) FILTER (WHERE tw.team = 'home') AS home_rows,
  COUNT(*) FILTER (WHERE tw.team = 'away') AS away_rows
FROM match_events tw
WHERE tw.event = 'Turnover Won'
  AND tw.zone = 'Centre'
  AND EXISTS (
    SELECT 1
    FROM match_events pc
    WHERE pc.match_id = tw.match_id
      AND pc.event = 'Poss Conceded'
      AND pc.team <> tw.team
      AND pc.team IN ('home', 'away')
      AND pc.zone IS NOT NULL
      AND pc.zone <> 'Centre'
      AND ABS(pc.match_time - tw.match_time) <= 2
  );

-- ── 2. Sample of what the updates will look like ───────────────
-- Comment in for a 10-row sneak peek before applying.
-- SELECT
--   tw.id,
--   tw.match_id,
--   tw.team AS tw_team,
--   tw.match_time AS tw_time,
--   tw.zone AS old_zone,
--   (
--     SELECT pc.zone FROM match_events pc
--     WHERE pc.match_id = tw.match_id
--       AND pc.event = 'Poss Conceded'
--       AND pc.team <> tw.team
--       AND pc.team IN ('home', 'away')
--       AND pc.zone IS NOT NULL
--       AND pc.zone <> 'Centre'
--       AND ABS(pc.match_time - tw.match_time) <= 2
--     ORDER BY ABS(pc.match_time - tw.match_time) ASC, pc.seq ASC
--     LIMIT 1
--   ) AS new_zone
-- FROM match_events tw
-- WHERE tw.event = 'Turnover Won' AND tw.zone = 'Centre'
-- LIMIT 10;

-- ── 3. Apply backfill ──────────────────────────────────────────
-- For each Turnover Won @ Centre, copy the closest matching Poss
-- Conceded zone (opposite team, same match, within ±2 seconds).
UPDATE match_events tw
SET zone = sub.new_zone
FROM (
  SELECT
    tw_inner.id,
    (
      SELECT pc.zone FROM match_events pc
      WHERE pc.match_id = tw_inner.match_id
        AND pc.event = 'Poss Conceded'
        AND pc.team <> tw_inner.team
        AND pc.team IN ('home', 'away')
        AND pc.zone IS NOT NULL
        AND pc.zone <> 'Centre'
        AND ABS(pc.match_time - tw_inner.match_time) <= 2
      ORDER BY ABS(pc.match_time - tw_inner.match_time) ASC, pc.seq ASC
      LIMIT 1
    ) AS new_zone
  FROM match_events tw_inner
  WHERE tw_inner.event = 'Turnover Won'
    AND tw_inner.zone = 'Centre'
) sub
WHERE tw.id = sub.id
  AND sub.new_zone IS NOT NULL;

-- ── 4. Tally after update ──────────────────────────────────────
SELECT
  COUNT(*) FILTER (WHERE zone = 'Centre') AS still_at_centre,
  COUNT(*) FILTER (WHERE zone <> 'Centre' AND zone IS NOT NULL) AS now_zoned,
  COUNT(*) AS total_turnover_won
FROM match_events
WHERE event = 'Turnover Won';

-- ── 5. Decide ──────────────────────────────────────────────────
-- Run as-is to see the numbers without changing anything (ROLLBACK).
-- Once you're happy with the preview, swap the final statement to
-- COMMIT and re-run.
ROLLBACK;
-- COMMIT;
