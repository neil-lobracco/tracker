use super::models;
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
        pub domain: Option<String>,
        pub description: Option<String>,
        pub members_only: bool,
    }
    impl League {
        pub fn from_parts(league: super::models::League, sport_name: String) -> League {
            League { 
                id: league.id,
                name: league.name,
                created_at: league.created_at,
                sport_id: league.sport_id,
                sport_name: sport_name,
                domain: league.domain,
                members_only: league.members_only,
                description: league.description,
            }
        }
    }

    #[derive(Serialize)]
    pub struct Sport {
        pub id: i32,
        pub name: String,
    }
    impl From<super::models::Sport> for Sport {
        fn from(sport: super::models::Sport) -> Sport {
            Sport { id: sport.id, name: sport.name }
        }
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
        pub league_memberships: Vec<LeagueMembership>,
    }
    #[derive(Serialize)]
    pub struct LeagueMembership {
        pub league_id: i32,
        pub role: String,
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

    #[derive(Deserialize)]
    pub struct LeagueMembership {
        pub player_id: i32,
        pub league_id: i32,
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