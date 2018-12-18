pub mod responses {
    #[derive(Serialize)]
    pub struct Player {
        pub id: i32,
        pub name: String,
        pub elo: f64,
        pub games_played: i64,
    }
    #[derive(Serialize)]
    pub struct League {
        pub id: i32,
        pub name: String,

        pub created_at: chrono::DateTime<chrono::prelude::Utc>,
        pub sport_id: i32,
        pub sport_name: String,
    }
    #[derive(Serialize)]
    pub struct EloEntry {
        pub created_at: chrono::DateTime<chrono::prelude::Utc>,
        pub match_id: Option<i32>,
        pub player_id: i32,
        pub score: f64,
    }

}

pub mod requests {
    #[derive(Deserialize)]
    pub struct CreatePlayer {
        pub name: String,
    }

    #[derive(Deserialize)]
    pub struct CreateMatch {
        pub comment: Option<String>,
        pub player1_id: i32,
        pub player2_id: i32,
        pub player1_score: f64,
        pub player2_score: f64,
    }

}
