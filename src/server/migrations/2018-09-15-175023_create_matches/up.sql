CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    comment VARCHAR NULL,
    player1_id INTEGER NOT NULL,
    player2_id INTEGER NOT NULL,
    player1_score DOUBLE PRECISION NOT NULL,
    player2_score DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
