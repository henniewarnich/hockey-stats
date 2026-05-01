-- Seed test-user profiles for the staging Supabase project.
-- Assumes 4 auth users already created via Supabase Auth dashboard:
--   admin@kykie.test, coach@kykie.test, commentator@kykie.test, supporter@kykie.test
-- The handle_new_user trigger has already inserted stub profile rows
-- (with auto-generated username and role='viewer'). This script UPDATEs
-- those rows in place — never touches username — so the UNIQUE constraint
-- on username can't bite us.
-- Idempotent: re-runnable.
-- Run: paste into the staging Supabase SQL editor.

-- ─── 1. ADMIN ─────────────────────────────────────────────
UPDATE profiles
SET
  firstname         = 'Test',
  lastname          = 'Admin',
  role              = 'admin',
  roles             = ARRAY['admin'],
  blocked           = false,
  accepted_terms_at = COALESCE(accepted_terms_at, NOW())
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@kykie.test');

-- ─── 2. COACH ─────────────────────────────────────────────
UPDATE profiles
SET
  firstname         = 'Test',
  lastname          = 'Coach',
  role              = 'coach',
  roles             = ARRAY['coach'],
  coach_status      = 'approved',
  blocked           = false,
  accepted_terms_at = COALESCE(accepted_terms_at, NOW())
WHERE id = (SELECT id FROM auth.users WHERE email = 'coach@kykie.test');

-- Assign coach to a real Paarl Gim team. School name lives on institutions.name;
-- teams.name holds the team-within-institution (e.g. '1st', 'U16A'). Prefer the
-- '1st' team, then fall back to whichever team has the most matches.
WITH chosen_team AS (
  SELECT t.id
  FROM teams t
  JOIN institutions i ON i.id = t.institution_id
  WHERE i.name ILIKE '%Paarl Gim%'
  ORDER BY
    CASE
      WHEN t.name ILIKE '1st'    THEN 0
      WHEN t.name ILIKE '%1st%'  THEN 1
      ELSE 2
    END,
    (SELECT COUNT(*) FROM matches m
     WHERE m.home_team_id = t.id OR m.away_team_id = t.id) DESC
  LIMIT 1
)
INSERT INTO coach_teams (coach_id, team_id)
SELECT
  (SELECT id FROM auth.users WHERE email = 'coach@kykie.test'),
  (SELECT id FROM chosen_team)
ON CONFLICT (coach_id, team_id) DO NOTHING;

-- ─── 3. COMMENTATOR ───────────────────────────────────────
UPDATE profiles
SET
  firstname          = 'Test',
  lastname           = 'Commentator',
  role               = 'commentator',
  roles              = ARRAY['commentator'],
  commentator_status = 'qualified',
  blocked            = false,
  accepted_terms_at  = COALESCE(accepted_terms_at, NOW())
WHERE id = (SELECT id FROM auth.users WHERE email = 'commentator@kykie.test');

-- ─── 4. SUPPORTER ─────────────────────────────────────────
-- Links to up to 2 well-known institutions. Falls back to empty array if none match.
UPDATE profiles
SET
  firstname                  = 'Test',
  lastname                   = 'Supporter',
  role                       = 'supporter',
  roles                      = ARRAY['supporter'],
  supporting_institution_ids = COALESCE(
    (SELECT array_agg(id) FROM (
       SELECT id FROM institutions
       WHERE name ILIKE '%Paarl Gim%'
          OR name ILIKE '%Afrikaanse%'
          OR name ILIKE '%Affies%'
       ORDER BY name
       LIMIT 2
     ) sub),
    '{}'::uuid[]
  ),
  blocked                    = false,
  accepted_terms_at          = COALESCE(accepted_terms_at, NOW())
WHERE id = (SELECT id FROM auth.users WHERE email = 'supporter@kykie.test');

-- ─── VERIFY ───────────────────────────────────────────────
SELECT email, username, role, roles, coach_status, commentator_status,
       array_length(supporting_institution_ids, 1) AS n_supporting_insts
FROM profiles
WHERE email LIKE '%@kykie.test'
ORDER BY email;

SELECT p.email, t.name AS coached_team, t.short_name, i.name AS institution
FROM profiles p
JOIN coach_teams ct ON ct.coach_id = p.id
JOIN teams t        ON t.id = ct.team_id
JOIN institutions i ON i.id = t.institution_id
WHERE p.email = 'coach@kykie.test';

SELECT p.email, i.name AS supporting_institution
FROM profiles p
CROSS JOIN LATERAL unnest(p.supporting_institution_ids) AS u(inst_id)
JOIN institutions i ON i.id = u.inst_id
WHERE p.email = 'supporter@kykie.test'
ORDER BY i.name;
