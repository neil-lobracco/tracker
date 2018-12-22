#![allow(proc_macro_derive_resolution_fallback)]

use super::schema::elo_entries;
use super::schema::leagues;
use super::schema::matches;
use super::schema::players;
use super::schema::league_memberships;

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

#[derive(Queryable, Identifiable)]
pub struct Player {
    pub id: i32,
    pub name: String,
    pub email: Option<String>,
}

#[derive(Insertable)]
#[table_name = "players"]
pub struct NewPlayer<'a> {
    pub name: &'a str,
    pub email: Option<&'a str>,
}

#[derive(Queryable, Associations)]
#[table_name = "league_memberships"]
#[belongs_to(Player)]
#[belongs_to(League)]
pub struct LeagueMembership {
    pub id: i32,
    pub created_at: chrono::DateTime<chrono::prelude::Utc>,
    pub role: String,
    pub player_id: i32,
    pub league_id: i32,
}

#[derive(Insertable)]
#[table_name = "league_memberships"]
pub struct NewLeagueMembership<'a> {
    pub role: &'a str,
    pub league_id: i32,
    pub player_id: i32,
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

#[derive(Queryable, Associations)]
#[belongs_to(LeagueMembership)]
#[table_name = "elo_entries"]
pub struct EloEntry {
    pub id: i32,
    pub score: f64,
    pub created_at: chrono::DateTime<chrono::prelude::Utc>,
    pub match_id: Option<i32>,
    pub league_membership_id: i32,
}

#[derive(Insertable)]
#[table_name = "elo_entries"]
pub struct NewEloEntry {
    pub score: f64,
    pub league_membership_id: i32,
    pub match_id: Option<i32>,
}

use diesel::sql_types::{Integer, Double};
#[derive(QueryableByName)]
pub struct CurrentEloScore {
    #[sql_type="Integer"]
    pub player_id: i32,
    #[sql_type="Double"]
    pub score: f64,
}
