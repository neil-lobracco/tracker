CREATE TABLE elo_entries (
    id SERIAL PRIMARY KEY,
    score DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    match_id INTEGER NULL,
    player_id INTEGER NOT NULL
)
