CREATE TABLE leagues (
	id SERIAL PRIMARY KEY,
	name VARCHAR NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	sport_id INTEGER NOT NULL
);

CREATE TABLE sports (
	id SERIAL PRIMARY KEY,
	name VARCHAR NOT NULL
);

ALTER TABLE players ADD COLUMN league_id INTEGER;
ALTER TABLE matches ADD COLUMN league_id INTEGER;

INSERT INTO sports (name) VALUES ('Foosball');
INSERT INTO leagues (name, sport_id) VALUES ('Addepar foosball', (SELECT id FROM sports LIMIT 1));
UPDATE players SET league_id=(SELECT id FROM leagues LIMIT 1);
UPDATE matches SET league_id=(SELECT id FROM leagues LIMIT 1);

ALTER TABLE players ALTER COLUMN league_id SET NOT NULL;
ALTER TABLE matches ALTER COLUMN league_id SET NOT NULL;