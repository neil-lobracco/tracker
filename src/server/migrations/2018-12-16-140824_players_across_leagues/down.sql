ALTER TABLE players ADD COLUMN league_id INTEGER;

ALTER TABLE players ADD COLUMN elo DOUBLE PRECISION;

ALTER TABLE elo_entries ADD COLUMN player_id INTEGER;

UPDATE players SET league_id = lm.league_id FROM league_memberships lm WHERE lm.player_id = players.id;

UPDATE elo_entries ee SET player_id = lm.player_id FROM league_memberships lm WHERE ee.player_id = lm.player_id;

ALTER TABLE elo_entries DROP COLUMN league_membership_id;

DROP TABLE league_memberships;