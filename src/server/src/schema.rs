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
    matches (id) {
        id -> Int4,
        comment -> Nullable<Varchar>,
        player1_id -> Int4,
        player2_id -> Int4,
        player1_score -> Float8,
        player2_score -> Float8,
        created_at -> Timestamptz,
    }
}

table! {
    players (id) {
        id -> Int4,
        name -> Varchar,
        elo -> Float8,
    }
}

allow_tables_to_appear_in_same_query!(
    elo_entries,
    matches,
    players,
);
