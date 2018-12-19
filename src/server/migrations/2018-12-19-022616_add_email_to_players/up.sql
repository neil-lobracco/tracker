ALTER TABLE players ADD COLUMN email VARCHAR(256) NULL;
CREATE UNIQUE INDEX player_email_lc ON players(LOWER(email));