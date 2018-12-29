#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_derive;

use diesel::pg::PgConnection;
pub mod interface_types;
pub mod models;
pub mod schema;
pub mod players_routes;
pub mod matches_routes;
pub mod elo_entries_routes;
pub mod user_routes;
pub mod leagues_routes;
pub mod sports_routes;
mod scoring;
pub use crate::players_routes::*;
pub use crate::matches_routes::*;
pub use crate::elo_entries_routes::*;
pub use crate::user_routes::*;
pub use crate::leagues_routes::*;
pub use crate::sports_routes::*;
use self::models::*;
use self::schema::*;
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

pub struct DbConn(pub PooledConnection<ConnectionManager<PgConnection>>);
impl<'a, 'r> FromRequest<'a, 'r> for DbConn {
    type Error = ();
    fn from_request(request: &'a Request<'r>) -> request::Outcome<Self, Self::Error> {
        let pool = request.guard::<State<PostgresPool>>()?;
        match pool.get() {
            Ok(conn) => Outcome::Success(DbConn(conn)),
            Err(_) => Outcome::Failure((Status::ServiceUnavailable, ())),
        }
    }
}

impl Deref for DbConn {
    type Target = PgConnection;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

pub struct LeagueId(i32);
impl<'a, 'r> FromRequest<'a, 'r> for LeagueId {
    type Error = ();
    fn from_request(request: &'a Request<'r>) -> request::Outcome<Self, Self::Error> {
        match request
            .headers()
            .get_one(LEAGUE_HEADER_NAME)
            .and_then(|val| val.parse::<i32>().ok())
        {
            Some(lid) => Outcome::Success(LeagueId(lid)),
            None => Outcome::Success(LeagueId(1)), /*Outcome::Failure((Status::BadRequest, ())),*/
        }
    }
}

impl Deref for LeagueId {
    type Target = i32;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}


pub struct Admin(Player);
impl<'a, 'r> FromRequest<'a, 'r> for Admin {
    type Error = ();
    fn from_request(request: &'a Request<'r>) -> request::Outcome<Self, Self::Error> {
        let provided_email = match request
            .cookies()
            .get_private(AUTH_COOKIE)
        {
            Some(email_cookie) => email_cookie.value().to_string(),
            None => return Outcome::Failure((Status::BadRequest, ())),
        };
        let conn = match request.guard::<DbConn>() {
            Outcome::Success(c) => c,
            _ => return Outcome::Failure((Status::ServiceUnavailable, ())),
        };
        let league_id = match request.guard::<LeagueId>() {
            Outcome::Success(lid) => lid,
            _ => return Outcome::Failure((Status::BadRequest, ())),
        };
        match players::table
            .inner_join(league_memberships::table.on(league_memberships::player_id.eq(players::id)))
            .filter(league_memberships::league_id.eq(*league_id))
            .filter(league_memberships::role.eq(ADMIN_ROLE))
            .filter(players::email.eq(provided_email))
            .select(players::all_columns)
            .first(&*conn) {
                Ok(player) => Outcome::Success(Admin(player)),
                _ => Outcome::Failure((Status::ServiceUnavailable, ())),
        }
    }
}

impl Deref for Admin {
    type Target = Player;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

pub struct User(Player);
impl<'a, 'r> FromRequest<'a, 'r> for User {
    type Error = ();
    fn from_request(request: &'a Request<'r>) -> request::Outcome<Self, Self::Error> {
        let provided_email = match request
            .cookies()
            .get_private(AUTH_COOKIE)
        {
            Some(email_cookie) => email_cookie.value().to_string(),
            None => return Outcome::Failure((Status::BadRequest, ())),
        };
        let conn = match request.guard::<DbConn>() {
            Outcome::Success(c) => c,
            _ => return Outcome::Failure((Status::ServiceUnavailable, ())),
        };
        match players::table
            .filter(players::email.eq(provided_email))
            .select(players::all_columns)
            .first(&*conn) {
                Ok(player) => Outcome::Success(User(player)),
                _ => Outcome::Failure((Status::ServiceUnavailable, ())),
        }
    }
}

impl Deref for User {
    type Target = Player;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
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
