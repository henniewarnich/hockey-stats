-- Backfill migration: capture pre-existing prod state.
-- These two columns existed in production but had no checked-in migration.
-- Discovered when seeding the staging Supabase project and the schema diff
-- (scripts/diff-schemas.js) flagged them as missing in staging.
-- Not a new feature — this file exists so future env rebuilds from
-- upgrade-scripts/ produce a schema that matches production.

ALTER TABLE teams ADD COLUMN IF NOT EXISTS coach_pin text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS commentator_pin text;
