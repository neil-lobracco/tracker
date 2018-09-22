CREATE TABLE access_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR NOT NULL,
    league_id INTEGER NOT NULL
)
