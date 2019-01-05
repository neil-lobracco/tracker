#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_derive;

mod interface_types;
mod models;
mod schema;
mod players_routes;
mod matches_routes;
mod elo_entries_routes;
mod user_routes;
mod leagues_routes;
mod sports_routes;
mod guards;
mod rebuild_entries;
mod scoring;
use diesel::pg::PgConnection;
pub use crate::players_routes::*;
pub use crate::matches_routes::*;
pub use crate::elo_entries_routes::*;
pub use crate::user_routes::*;
pub use crate::leagues_routes::*;
pub use crate::sports_routes::*;
pub use crate::guards::*;
pub use crate::rebuild_entries::rebuild_entries;
pub use self::models::*;
pub use self::schema::*;
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool, PooledConnection};
use rocket::http::{Status, Cookies, Cookie};
use rocket::request::{self, FromRequest};
use rocket::response::status;
use rocket::{Outcome, Request, State};
use rocket_contrib::json::Json;
use std::ops::Deref;

static LEAGUE_HEADER_NAME: &'static str = "League-Id";
static AUTH_COOKIE: &'static str = "leaguetrack_auth";
static ADMIN_ROLE: &'static str = "admin";
static GOOGLE_CLIENT_ID: &'static str = "985074612801-rir5ouc3r4e7kaq6u25j1c12bko24rqq.apps.googleusercontent.com";

type PostgresPool = Pool<ConnectionManager<PgConnection>>;

/// Initializes a database pool.
fn init_pool() -> PostgresPool {
    let manager = ConnectionManager::<PgConnection>::new(std::env::var("DATABASE_URL").unwrap());
    Pool::new(manager).expect("db pool")
}


fn fetch_current_elo(conn: &DbConn, player_ids: &[i32], league_id: &LeagueId) -> std::collections::HashMap<i32, f64> {
    let mut m = std::collections::HashMap::new();
    let query = diesel::sql_query(include_str!("fetch_current_elo.sql"))
        .bind::<diesel::sql_types::Array<diesel::sql_types::Int4>, _>(player_ids)
        .bind::<diesel::sql_types::Int4, _>(**league_id);
    let res: Vec<CurrentEloScore> = query.get_results(&**conn).unwrap();
    for ces in res {
        m.insert(ces.player_id, ces.score);
    }
    m
}

fn main() {
    rocket::ignite()
        .manage(init_pool())
        .mount(
            "/",
            routes![
                players_routes::get_players,
                players_routes::create_player,
                matches_routes::create_match,
                matches_routes::get_matches,
                matches_routes::get_matches_for_player,
                elo_entries_routes::get_elo_entries_for_player,
                elo_entries_routes::get_elo_entries,
                user_routes::whoami,
                user_routes::login_or_register,
                user_routes::logout,
                leagues_routes::get_leagues,
                leagues_routes::join_league,
                leagues_routes::create_league,
                sports_routes::get_sports
            ],
        ).launch();
}
