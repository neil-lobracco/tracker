use super::schema::players;
use super::schema::matches;
use super::schema::elo_entries;

#[derive(Queryable, Serialize, Deserialize, Identifiable)]
pub struct Player {
    pub id: i32,
    pub name: String,
    pub elo: f64
}

#[derive(Insertable, Deserialize)]
#[table_name = "players"]
pub struct NewPlayer {
    pub name: String,
    pub elo: f64
}

#[derive(Queryable, Serialize, Deserialize)]
pub struct Match {
    pub id: i32,
    pub comment: Option<String>,
    pub player1_id: i32,
    pub player2_id: i32,
    pub player1_score: f64,
    pub player2_score: f64
}

#[derive(Insertable, Deserialize)]
#[table_name = "matches"]
pub struct NewMatch {
    pub comment: Option<String>,
    pub player1_id: i32,
    pub player2_id: i32,
    pub player1_score: f64,
    pub player2_score: f64
}


#[derive(Queryable, Serialize, Deserialize, Associations)]
#[belongs_to(Player)]
#[table_name = "elo_entries"]
pub struct EloEntry {
	pub id: i32,
	pub score: f64,
	pub created_at: chrono::DateTime<chrono::prelude::Utc>,
	pub player_id: i32,
	pub match_id: Option<i32>,
}

#[derive(Insertable, Deserialize)]
#[table_name = "elo_entries"]
pub struct NewEloEntry {
	pub score: f64,
	pub player_id: i32,
	pub match_id: Option<i32>,
}