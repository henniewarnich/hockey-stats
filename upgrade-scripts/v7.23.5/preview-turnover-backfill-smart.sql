-- ============================================
-- kykie.net v7.23.5 — Smart Turnover Won backfill PREVIEW (single match)
-- ============================================
-- Strategy: for each Turnover Won @ "Centre", look up the most recent
-- zone-bearing event in the same match BEFORE it (by seq), and use
-- that event's zone as the proposed replacement.
--
-- This is a READ-ONLY preview — it does NOT modify any data.
-- Run this against a single match first to inspect the quality of
-- the recovery before scaling up.
--
-- Run in Supabase SQL editor (start with staging, then prod once you
-- like what you see).

-- ── Step A. Pick a candidate match ────────────────────────────
-- Lists the 10 most recent Live Pro matches (duration > 0) with the
-- most Turnover Won @ "Centre" rows. Copy a match_id from the list
-- and paste it into Step B / C.

SELECT
  m.id AS match_id,
  m.match_date,
  ht.name AS home_team,
  at.name AS away_team,
  COUNT(*) FILTER (WHERE me.event = 'Turnover Won' AND me.zone = 'Centre') AS centre_rows,
  COUNT(*) FILTER (WHERE me.event = 'Turnover Won') AS total_turnovers,
  COUNT(*) FILTER (WHERE me.zone IS NOT NULL AND me.zone <> 'Centre' AND me.team NOT IN ('commentary','meta')) AS zoned_events
FROM matches m
JOIN match_events me ON me.match_id = m.id
LEFT JOIN teams ht ON ht.id = m.home_team_id
LEFT JOIN teams at ON at.id = m.away_team_id
WHERE m.status = 'ended'
  AND m.duration > 0
GROUP BY m.id, m.match_date, ht.name, at.name
HAVING COUNT(*) FILTER (WHERE me.event = 'Turnover Won' AND me.zone = 'Centre') > 0
ORDER BY m.match_date DESC, centre_rows DESC
LIMIT 10;

-- ── Step B. Recovery summary for ONE match ───────────────────
-- Paste the match_id below.
-- Shows: how many Centre rows we can recover, broken down by how
-- recent the source event was.

WITH backfill_preview AS (
  SELECT
    tw.id,
    tw.match_time AS tw_time,
    tw.zone AS current_zone,
    pe.zone AS proposed_zone,
    pe.event AS source_event,
    pe.match_time AS source_time,
    (tw.match_time - pe.match_time) AS time_gap_s
  FROM match_events tw
  LEFT JOIN LATERAL (
    SELECT pe.zone, pe.event, pe.match_time
    FROM match_events pe
    WHERE pe.match_id = tw.match_id
      AND pe.seq < tw.seq
      AND pe.team NOT IN ('commentary', 'meta')
      AND pe.zone IS NOT NULL
      AND pe.zone <> 'Centre'
    ORDER BY pe.seq DESC
    LIMIT 1
  ) pe ON TRUE
  WHERE tw.event = 'Turnover Won'
    AND tw.zone = 'Centre'
    AND tw.match_id = '<PASTE_MATCH_ID_HERE>'
)
SELECT
  COUNT(*) AS total_centre_rows,
  COUNT(proposed_zone) AS recoverable_rows,
  COUNT(*) - COUNT(proposed_zone) AS unrecoverable_rows,
  COUNT(*) FILTER (WHERE time_gap_s <= 5)  AS recoverable_within_5s,
  COUNT(*) FILTER (WHERE time_gap_s <= 15) AS recoverable_within_15s,
  COUNT(*) FILTER (WHERE time_gap_s <= 30) AS recoverable_within_30s,
  ROUND(AVG(time_gap_s) FILTER (WHERE time_gap_s IS NOT NULL), 1) AS avg_time_gap_s,
  MAX(time_gap_s) AS max_time_gap_s
FROM backfill_preview;

-- ── Step C. Row-by-row detail for the same match ─────────────
-- Same match_id again. Lists every Centre row with the proposed new
-- zone, the event it came from, the time gap, and the team. Use this
-- to eyeball whether the recovery looks sensible (e.g. zones near a
-- D Entry or Ball forward make sense; zones from very old events
-- should be treated with caution).

SELECT
  tw.seq,
  tw.team AS turnover_team,
  ROUND(tw.match_time / 60.0, 2) AS tw_minute,
  tw.zone AS current_zone,
  pe.zone AS proposed_zone,
  pe.event AS source_event,
  pe.team AS source_team,
  (tw.match_time - pe.match_time) AS time_gap_s
FROM match_events tw
LEFT JOIN LATERAL (
  SELECT pe.zone, pe.event, pe.match_time, pe.team
  FROM match_events pe
  WHERE pe.match_id = tw.match_id
    AND pe.seq < tw.seq
    AND pe.team NOT IN ('commentary', 'meta')
    AND pe.zone IS NOT NULL
    AND pe.zone <> 'Centre'
  ORDER BY pe.seq DESC
  LIMIT 1
) pe ON TRUE
WHERE tw.event = 'Turnover Won'
  AND tw.zone = 'Centre'
  AND tw.match_id = '<PASTE_MATCH_ID_HERE>'
ORDER BY tw.seq;
