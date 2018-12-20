table! {
    elo_entries (id) {
        id -> Int4,
        score -> Float8,
        created_at -> Timestamptz,
        match_id -> Nullable<Int4>,
        league_membership_id -> Int4,
    }
}

table! {
    league_memberships (id) {
        id -> Int4,
        created_at -> Timestamptz,
        role -> Varchar,
        player_id -> Int4,
        league_id -> Int4,
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
        email -> Nullable<Varchar>,
    }
}

table! {
    sports (id) {
        id -> Int4,
        name -> Varchar,
    }
}

joinable!(elo_entries -> league_memberships (league_membership_id));
joinable!(league_memberships -> leagues (league_id));
joinable!(league_memberships -> players (player_id));

allow_tables_to_appear_in_same_query!(
    elo_entries,
    league_memberships,
    leagues,
    matches,
    players,
    sports,
);
