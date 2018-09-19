DROP TABLE leagues;
DROP TABLE sports;
ALTER TABLE players DROP COLUMN league_id;
ALTER TABLE matches DROP COLUMN league_id;