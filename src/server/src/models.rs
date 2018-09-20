use super::schema::elo_entries;
use super::schema::leagues;
use super::schema::matches;
use super::schema::players;
use super::schema::sports;

#[derive(Queryable)]
pub struct Sport {
    pub id: i32,
    pub name: String,
}

#[derive(Queryable, Associations)]
#[belongs_to(Sport)]
pub struct League {
    pub id: i32,
    pub name: String,
    pub created_at: chrono::DateTime<chrono::prelude::Utc>,
    pub sport_id: i32,
}

#[derive(Queryable, Serialize, Identifiable, Associations)]
#[belongs_to(League)]
pub struct Player {
    pub id: i32,
    pub name: String,
    pub elo: f64,
    pub league_id: i32,
}

#[derive(Insertable)]
#[table_name = "players"]
pub struct NewPlayer {
    pub name: String,
    pub elo: f64,
    pub league_id: i32,
}

#[derive(Queryable, Serialize, Associations)]
#[belongs_to(League)]
#[table_name = "matches"]
pub struct Match {
    pub id: i32,
    pub comment: Option<String>,
    pub player1_id: i32,
    pub player2_id: i32,
    pub player1_score: f64,
    pub player2_score: f64,
    pub created_at: chrono::DateTime<chrono::prelude::Utc>,
    pub league_id: i32,
}

#[derive(Insertable)]
#[table_name = "matches"]
pub struct NewMatch {
    pub comment: Option<String>,
    pub player1_id: i32,
    pub player2_id: i32,
    pub player1_score: f64,
    pub player2_score: f64,
    pub league_id: i32,
}

#[derive(Queryable, Serialize, Associations)]
#[belongs_to(Player)]
#[table_name = "elo_entries"]
pub struct EloEntry {
    pub id: i32,
    pub score: f64,
    pub created_at: chrono::DateTime<chrono::prelude::Utc>,
    pub match_id: Option<i32>,
    pub player_id: i32,
}

#[derive(Insertable)]
#[table_name = "elo_entries"]
pub struct NewEloEntry {
    pub score: f64,
    pub player_id: i32,
    pub match_id: Option<i32>,
}
