-- ============================================
-- kykie.net v7.23.5 — Smart Turnover Won zone backfill (ALL matches)
-- ============================================
-- For each Turnover Won @ 'Centre', copies the zone from the most
-- recent zone-bearing event in the SAME MATCH before it (ordered
-- by seq). Excludes commentary/meta rows and existing 'Centre'
-- entries so the bug never propagates forward.
--
-- This SUPERSEDES `backfill-turnover-zones.sql` (the pair-based
-- approach, which only recovered ~0.1%). Production result for
-- smart approach: 2,433 of 2,440 rows recovered (99.7%).
--
-- ── Supabase SQL editor quirk ────────────────────────────────
-- DO NOT wrap this in `BEGIN; ... COMMIT;`. Supabase's SQL editor
-- runs through a transaction-mode connection pooler (PgBouncer)
-- that does not reliably honour explicit BEGIN/COMMIT across
-- multiple statements — the connection can be released between
-- statements, so the COMMIT silently does nothing. Just run each
-- statement on its own and rely on PostgreSQL's auto-commit.
-- (We hit this on 2026-05-11; backfill ran clean once unwrapped.)
--
-- ── How to run ───────────────────────────────────────────────
-- 1. Run STEP 1 (preview) — read-only, tells you how many rows
--    have a recoverable zone.
-- 2. If the numbers look right, run STEP 2 (apply). The editor
--    will return "UPDATE <n>" with the affected row count.
-- 3. Run STEP 3 (tally) to confirm the final state.
-- 4. Repeat in prod after verifying on staging.


-- ── STEP 1. Preview (read-only) ──────────────────────────────
SELECT
  COUNT(*) AS will_update,
  COUNT(*) FILTER (WHERE tw.team = 'home') AS home_rows,
  COUNT(*) FILTER (WHERE tw.team = 'away') AS away_rows
FROM match_events tw
WHERE tw.event = 'Turnover Won'
  AND tw.zone = 'Centre'
  AND EXISTS (
    SELECT 1
    FROM match_events pe
    WHERE pe.match_id = tw.match_id
      AND pe.seq < tw.seq
      AND pe.team NOT IN ('commentary', 'meta')
      AND pe.zone IS NOT NULL
      AND pe.zone <> 'Centre'
  );


-- ── STEP 2. Apply backfill (mutates data — run on its own) ───
UPDATE match_events tw
SET zone = sub.new_zone
FROM (
  SELECT
    tw_inner.id,
    (
      SELECT pe.zone
      FROM match_events pe
      WHERE pe.match_id = tw_inner.match_id
        AND pe.seq < tw_inner.seq
        AND pe.team NOT IN ('commentary', 'meta')
        AND pe.zone IS NOT NULL
        AND pe.zone <> 'Centre'
      ORDER BY pe.seq DESC
      LIMIT 1
    ) AS new_zone
  FROM match_events tw_inner
  WHERE tw_inner.event = 'Turnover Won'
    AND tw_inner.zone = 'Centre'
) sub
WHERE tw.id = sub.id
  AND sub.new_zone IS NOT NULL;


-- ── STEP 3. Tally after apply ────────────────────────────────
SELECT
  COUNT(*) FILTER (WHERE zone = 'Centre') AS still_at_centre,
  COUNT(*) FILTER (WHERE zone <> 'Centre' AND zone IS NOT NULL) AS now_zoned,
  COUNT(*) AS total_turnover_won
FROM match_events
WHERE event = 'Turnover Won';


-- ── STEP 4. Top-10 most-used resulting zones (sanity-check) ──
SELECT zone, COUNT(*) AS n
FROM match_events
WHERE event = 'Turnover Won' AND zone <> 'Centre' AND zone IS NOT NULL
GROUP BY zone
ORDER BY n DESC
LIMIT 10;
