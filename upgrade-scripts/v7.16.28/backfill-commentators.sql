-- ============================================
-- kykie.net — Backfill match_commentators + created_by
-- Run in Supabase SQL editor
-- ============================================

-- Hennie (admin): b0aa087e-0dc1-452d-a31c-2ce9a1218ab8
-- Mila:           1f99e738-8faf-401e-b0ee-1ad9d27a91ce
-- Yolanda:        c5d02b06-3b6f-40ed-8a30-fcdee8225b8d

-- ── Fix created_by on all LP matches → Hennie admin ──

-- 2026-03-20 Paarl Girls v Outeniqua
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = 'acd2b047-15e1-4c61-a679-91d9e90448ca' AND created_by IS NULL;
-- 2026-03-26 PMB Girls HS v Paarl Gim
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = 'cf361d70-814e-4214-9718-3e0dd16c4280' AND created_by IS NULL;
-- 2026-03-26 Pearson v Paarl Girls
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = '87db971c-eaee-4671-9b87-fe2aa4a1c2f9' AND created_by IS NULL;
-- 2026-03-26 Oranje Meisies v PMB Girls HS
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = '1c8d61e6-081c-44f3-8f9d-a12881b3f597' AND created_by IS NULL;
-- 2026-03-26 Waterkloof v Affies
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = '8810aaf6-38a8-48df-b19b-668a7bb20c65' AND created_by IS NULL;
-- 2026-03-27 Rhenish v Our Lady of Fatima
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = '89da8fa7-a7d1-4e0e-beac-c8a792948f9a' AND created_by IS NULL;
-- 2026-03-27 Bloemhof v Paarl Gim
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = '9c73bb88-cece-4d9c-929c-fae187d6ccc2' AND created_by IS NULL;
-- 2026-03-27 St Annes v Paarl Girls
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = 'b55d2946-f9b5-4922-8c4d-e926d6ab82d8' AND created_by IS NULL;
-- 2026-03-27 Oranje Meisies v Paarl Gim
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = '4124dc45-76a8-4726-be5d-df912f30dbda' AND created_by IS NULL;
-- 2026-03-27 Paarl Girls v Herschel
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = '47307859-4bf6-430d-b88f-3790adbcfb7d' AND created_by IS NULL;
-- 2026-03-28 Paarl Girls v Affies
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = '92527874-cf1e-4988-914b-a390e3f9a1ad' AND created_by IS NULL;
-- 2026-03-28 Paarl Gim v Collegiate
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = 'eb5abe57-655b-4a40-9653-e79896426c55' AND created_by IS NULL;
-- 2026-03-28 Roedean v Paarl Girls
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = 'f6d8a87d-bbe6-4174-b906-68829e70d6fe' AND created_by IS NULL;
-- 2026-03-28 PMB Girls HS v Pearson
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = 'a63cbe38-82ea-42b2-b21e-4d24e679581d' AND created_by IS NULL;
-- 2026-03-28 St Mary's Waverley v Durban GC
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = '2cd23335-401e-4f97-bdc3-e0d134ec898c' AND created_by IS NULL;
-- 2026-03-28 Paarl Girls v St Stithians
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = 'c0632244-9923-488a-978c-795d96c49f57' AND created_by IS NULL;
-- 2026-03-28 Our Lady of Fatima v Oranje Meisies
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = '4ef97ca9-d161-44cb-ab6f-423894d676e2' AND created_by IS NULL;
-- 2026-03-28 Menlopark v Oranje Meisies
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = 'fce22a89-6cf7-4dcd-a1bd-91d9039050c6' AND created_by IS NULL;
-- 2026-03-29 Waterkloof v Paarl Gim
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = '20396e80-a470-485a-88cd-e77f1c331089' AND created_by IS NULL;
-- 2026-03-29 Paarl Girls v PMB Girls HS
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = '86bf9135-4ad8-49db-9cb6-6af091915e9a' AND created_by IS NULL;
-- 2026-03-29 Paarl Girls v Durban GC
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = '2c22690f-c402-4497-b073-d654269adffb' AND created_by IS NULL;
-- 2026-03-29 Paarl Gim v Our Lady of Fatima
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = '32416ab9-001a-47f8-9f4b-e91e69160358' AND created_by IS NULL;
-- 2026-03-29 St Mary's Kloof v Rhenish
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = '6bdcb440-eb6a-44ef-8631-acc8378ca35f' AND created_by IS NULL;
-- 2026-04-03 Pro-Ed Akademie v Glenwood House
UPDATE matches SET created_by = 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8' WHERE id = '1a115255-cfac-49f1-a433-b99bdfe4ae82' AND created_by IS NULL;

-- ── Backfill match_commentators (actual recorder from audit log) ──

-- 2026-03-20 Paarl Girls v Outeniqua → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('acd2b047-15e1-4c61-a679-91d9e90448ca', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-26 PMB Girls HS v Paarl Gim → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('cf361d70-814e-4214-9718-3e0dd16c4280', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-26 Pearson v Paarl Girls → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('87db971c-eaee-4671-9b87-fe2aa4a1c2f9', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-26 Oranje Meisies v PMB Girls HS → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('1c8d61e6-081c-44f3-8f9d-a12881b3f597', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-26 Waterkloof v Affies → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('8810aaf6-38a8-48df-b19b-668a7bb20c65', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-27 Rhenish v Our Lady of Fatima → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('89da8fa7-a7d1-4e0e-beac-c8a792948f9a', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-27 Bloemhof v Paarl Gim → Mila (commentator_admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('9c73bb88-cece-4d9c-929c-fae187d6ccc2', '1f99e738-8faf-401e-b0ee-1ad9d27a91ce')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-27 St Annes v Paarl Girls → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('b55d2946-f9b5-4922-8c4d-e926d6ab82d8', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-27 Oranje Meisies v Paarl Gim → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('4124dc45-76a8-4726-be5d-df912f30dbda', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-27 Paarl Girls v Herschel → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('47307859-4bf6-430d-b88f-3790adbcfb7d', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-28 Paarl Girls v Affies → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('92527874-cf1e-4988-914b-a390e3f9a1ad', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-28 Paarl Gim v Collegiate → Mila (commentator_admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('eb5abe57-655b-4a40-9653-e79896426c55', '1f99e738-8faf-401e-b0ee-1ad9d27a91ce')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-28 Roedean v Paarl Girls → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('f6d8a87d-bbe6-4174-b906-68829e70d6fe', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-28 PMB Girls HS v Pearson → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('a63cbe38-82ea-42b2-b21e-4d24e679581d', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-28 St Mary's Waverley v Durban GC → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('2cd23335-401e-4f97-bdc3-e0d134ec898c', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-28 Paarl Girls v St Stithians → Yolanda (commentator_admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('c0632244-9923-488a-978c-795d96c49f57', 'c5d02b06-3b6f-40ed-8a30-fcdee8225b8d')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-28 Our Lady of Fatima v Oranje Meisies → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('4ef97ca9-d161-44cb-ab6f-423894d676e2', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-28 Menlopark v Oranje Meisies → Mila (commentator_admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('fce22a89-6cf7-4dcd-a1bd-91d9039050c6', '1f99e738-8faf-401e-b0ee-1ad9d27a91ce')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-29 Waterkloof v Paarl Gim → Mila (commentator_admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('20396e80-a470-485a-88cd-e77f1c331089', '1f99e738-8faf-401e-b0ee-1ad9d27a91ce')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-29 Paarl Girls v PMB Girls HS → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('86bf9135-4ad8-49db-9cb6-6af091915e9a', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-29 Paarl Girls v Durban GC → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('2c22690f-c402-4497-b073-d654269adffb', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-29 Paarl Gim v Our Lady of Fatima → Mila (commentator_admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('32416ab9-001a-47f8-9f4b-e91e69160358', '1f99e738-8faf-401e-b0ee-1ad9d27a91ce')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-03-29 St Mary's Kloof v Rhenish → Mila (commentator_admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('6bdcb440-eb6a-44ef-8631-acc8378ca35f', '1f99e738-8faf-401e-b0ee-1ad9d27a91ce')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- 2026-04-03 Pro-Ed Akademie v Glenwood House → Hennie (admin)
INSERT INTO match_commentators (match_id, commentator_id)
  VALUES ('1a115255-cfac-49f1-a433-b99bdfe4ae82', 'b0aa087e-0dc1-452d-a31c-2ce9a1218ab8')
  ON CONFLICT (match_id, commentator_id) DO NOTHING;

-- ── Verify ──
SELECT mc.match_id, p.firstname, p.role, m.match_date,
  (SELECT i.name FROM teams t JOIN institutions i ON t.institution_id = i.id WHERE t.id = m.home_team_id) as home,
  (SELECT i.name FROM teams t JOIN institutions i ON t.institution_id = i.id WHERE t.id = m.away_team_id) as away
FROM match_commentators mc
JOIN profiles p ON p.id = mc.commentator_id
JOIN matches m ON m.id = mc.match_id
ORDER BY m.match_date;