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
    #[derive(Serialize)]
    pub struct User {
        pub id: i32,
        pub email: String,
        pub name: String,
    }

    #[derive(Serialize)]
    pub struct Signin {
        pub player: Option<User>,
        pub error: Option<&'static str>,
        pub created: bool,
    }
    impl Signin {
        pub fn from_player(player: User, created: bool) -> Signin {
            Signin { player: Some(player), error: None, created: created }
        }
        pub fn from_error(error: &'static str) -> Signin {
            Signin { player: None, error: Some(error), created: false }
        }
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

    #[derive(Deserialize)]
    pub struct GoogleAuth {
        pub token: String,
    }

}

pub mod google {
    #[derive(Deserialize)]
    pub struct TokenResponse {
        pub aud: String,
        pub email: String,
        pub email_verified: String, //why, google?
        pub name: Option<String>,
    }
}