-- Rename match_type 'festival' → 'tournament' for all matches
UPDATE matches SET match_type = 'tournament' WHERE match_type = 'festival';

-- Verify
SELECT match_type, COUNT(*) FROM matches GROUP BY match_type ORDER BY match_type;
