table! {
    access_codes (id) {
        id -> Int4,
        code -> Varchar,
        league_id -> Int4,
    }
}

table! {
    elo_entries (id) {
        id -> Int4,
        score -> Float8,
        created_at -> Timestamptz,
        match_id -> Nullable<Int4>,
        player_id -> Int4,
    }
}

table! {
    leagues (id) {
        id -> Int4,
        name -> Varchar,
        created_at -> Timestamptz,
        sport_id -> Int4,
    }
}

table! {
    matches (id) {
        id -> Int4,
        comment -> Nullable<Varchar>,
        player1_id -> Int4,
        player2_id -> Int4,
        player1_score -> Float8,
        player2_score -> Float8,
        created_at -> Timestamptz,
        league_id -> Int4,
    }
}

table! {
    players (id) {
        id -> Int4,
        name -> Varchar,
        elo -> Float8,
        league_id -> Int4,
    }
}

table! {
    sports (id) {
        id -> Int4,
        name -> Varchar,
    }
}

allow_tables_to_appear_in_same_query!(
    access_codes,
    elo_entries,
    leagues,
    matches,
    players,
    sports,
);
