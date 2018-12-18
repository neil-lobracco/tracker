CREATE TABLE league_memberships (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    role VARCHAR NOT NULL,
    player_id INTEGER NOT NULL REFERENCES players(id),
    league_id INTEGER NOT NULL REFERENCES leagues(id),
    UNIQUE(player_id, league_id)
);

INSERT INTO league_memberships (role, player_id, league_id)
    SELECT 'admin', id, COALESCE(league_id, 1) FROM players;

ALTER TABLE players DROP COLUMN league_id;
ALTER TABLE players DROP COLUMN elo;

ALTER TABLE elo_entries ADD COLUMN league_membership_id INTEGER NULL REFERENCES league_memberships(id);

UPDATE elo_entries ee SET league_membership_id = lm.id FROM league_memberships lm WHERE ee.player_id = lm.player_id;

ALTER table elo_entries DROP COLUMN player_id;

ALTER TABLE elo_entries ALTER COLUMN league_membership_id SET NOT NULL;