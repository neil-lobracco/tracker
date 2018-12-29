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
mod scoring;
use self::interface_types::*;
pub use crate::players_routes::*;
pub use crate::matches_routes::*;
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

#[get("/leagues")]
fn get_leagues(conn: DbConn) -> QueryResult<Json<Vec<responses::League>>> {
    leagues::table
        .inner_join(sports::table.on(leagues::sport_id.eq(sports::id)))
        .select((leagues::all_columns, sports::name))
        .load::<(League, String)>(&*conn)
        .map(|tups| {
            Json(
                tups.into_iter()
                    .map(|tup| responses::League::from_parts(tup.0, tup.1)).collect(),
            )
        })
}

#[get("/players/<player_id>/elo_entries")]
fn get_elo_entries_for_player(conn: DbConn, league_id: LeagueId, player_id: i32) -> QueryResult<Json<Vec<responses::EloEntry>>> {
    elo_entries::table
        .inner_join(league_memberships::table.on(league_memberships::id.eq(elo_entries::league_membership_id)))
        .filter(league_memberships::player_id.eq(player_id).and(league_memberships::league_id.eq(*league_id)))
        .order_by(elo_entries::created_at.asc())
        .select(elo_entries::all_columns)
        .load::<EloEntry>(&*conn)
        .map(|entries| {
            Json( entries.iter().map(|entry|{
                responses::EloEntry {
                    player_id: player_id,
                    match_id: entry.match_id,
                    created_at: entry.created_at,
                    score: entry.score,
                }
            }).collect())
        })
}

#[get("/elo_entries")]
fn get_elo_entries(conn: DbConn, league_id: LeagueId) -> QueryResult<Json<Vec<responses::EloEntry>>> {
    elo_entries::table
        .inner_join(league_memberships::table.on(league_memberships::id.eq(elo_entries::league_membership_id)))
        .select((elo_entries::all_columns, league_memberships::player_id))
        .filter(league_memberships::league_id.eq(*league_id))
        .order_by(league_memberships::player_id.asc())
        .then_order_by(elo_entries::created_at.asc())
        .load::<(EloEntry, i32)>(&*conn)
        .map(|entries| {
            Json( entries.iter().map(|entry|{
                responses::EloEntry {
                    player_id: entry.1,
                    match_id: entry.0.match_id,
                    created_at: entry.0.created_at,
                    score: entry.0.score,
                }
            }).collect())
        })
}

#[get("/users/me")]
fn whoami(conn: DbConn, mut cookies: Cookies) -> Result<Json<responses::User>, status::Custom<()>> {
    match cookies.get_private(AUTH_COOKIE) {
        Some(cookie) => {
            let email = cookie.value();
            match get_user(&conn, &email) {
                Ok(player) => Ok(Json(player)),
                Err(_) => {
                    println!("Unusual! Got email for missing user {}", email);
                    Err(status::Custom(rocket::http::Status::Unauthorized, ()))
                }
            }
        },
        None => Err(status::Custom(rocket::http::Status::Unauthorized, ()))
    }
}

#[delete("/sessions/current")]
fn logout(mut cookies: Cookies) -> rocket::response::status::Custom<()> {
    cookies.remove_private(Cookie::named(AUTH_COOKIE));
    status::Custom(rocket::http::Status::NoContent, ())
}

#[post("/league_memberships", data="<lm>")]
fn join_league(conn: DbConn, user: User, lm: Json<requests::LeagueMembership>) -> Result<Json<responses::LeagueMembership>, rocket::response::status::BadRequest<()>> {
    let lm = lm.into_inner();
    if lm.player_id != user.id {
        return Err(status::BadRequest::<()>(None));
    }
    if let Ok(league) = leagues::table.filter(leagues::id.eq(lm.league_id)).first::<League>(&*conn) {
        if let Some(d) = league.domain {
            if let Some(ref e) = user.email {
                if !e.ends_with(&format!("@{}",d)) {
                    return Err(status::BadRequest::<()>(None));
                }
            }
        }
    } else {
        return Err(status::BadRequest::<()>(None));
    }
    let created_lm = create_league_membership(&conn, NewLeagueMembership { role: ADMIN_ROLE, league_id: lm.league_id, player_id: lm.player_id })
        .expect("Failed to create LM.");
    diesel::insert_into(elo_entries::table)
        .values(&NewEloEntry {
            league_membership_id: created_lm.id,
            match_id: None,
            score: 1500.0,
        }).execute(&*conn).expect("Unable to create EE.");
    Ok( Json( responses::LeagueMembership { league_id: created_lm.league_id, role: created_lm.role }))
}


#[post("/users", data = "<ga>")]
fn login_or_register(conn: DbConn, mut cookies: Cookies, ga: Json<requests::GoogleAuth>) -> Json<responses::Signin> {
    let id_token = ga.into_inner().token;
    let token: google::TokenResponse = reqwest::get(&format!("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={}", id_token))
        .unwrap().json().unwrap();
    Json(if token.email_verified == "true" && token.aud == GOOGLE_CLIENT_ID {
        if token.email.contains("angela") || token.email.contains("sreenath") {
            responses::Signin::from_error("Invalid email address for this league.")
        } else {
            let (player, created) = match get_user(&conn, &token.email) {
                Ok(p) => (p, false),
                Err(_) => {
                    println!("No user for email {}, creating", token.email);
                    match create_user(&conn, &token.email, token.name.as_ref().unwrap_or(&token.email)) {
                        Ok(p) => (responses::User { id: p.id, name: p.name, email: p.email.unwrap(), league_memberships: Vec::new()}, true),
                        Err(_) => return Json(responses::Signin::from_error("Could not insert new user."))
                    }
                }
            };
            cookies.add_private(Cookie::new(AUTH_COOKIE, token.email));
            responses::Signin::from_player(player, created)
        }
    } else {
       responses::Signin::from_error("Cannot validate email address.")
    })
}

fn get_user(conn: &DbConn, email: &str) -> Result<responses::User, diesel::result::Error> {
    let player = players::table.filter(players::email.eq(email)).first::<Player>(&**conn)?;
    let league_memberships = league_memberships::table.filter(league_memberships::player_id.eq(player.id)).load::<LeagueMembership>(&**conn)?;
    Ok(responses::User {
        id: player.id,
        email: player.email.unwrap(),
        name: player.name,
        league_memberships: league_memberships.into_iter().map(|lm| responses::LeagueMembership { role: lm.role, league_id: lm.league_id }).collect(),
    })
}

fn create_user(conn: &DbConn, email: &str, name: &str) -> Result<Player, diesel::result::Error> {
    let player = NewPlayer { name: name, email: Some(email) };
    diesel::insert_into(players::table).values(player).get_result(&**conn)
}

fn create_league_membership(conn: &DbConn, lm: NewLeagueMembership) -> Result<LeagueMembership, diesel::result::Error> {
    diesel::insert_into(league_memberships::table).values(lm).get_result(&**conn)
}

#[post("/leagues", data="<league>")]
fn create_league(conn: DbConn, user: User, league: Json<NewLeague>) -> Result<Json<responses::League>, diesel::result::Error> {
    let league: League = diesel::insert_into(leagues::table).values(league.into_inner()).get_result(&*conn)?;
    let created_lm = create_league_membership(&conn, NewLeagueMembership { role: ADMIN_ROLE, league_id: league.id, player_id: user.id })?;
    diesel::insert_into(elo_entries::table)
        .values(&NewEloEntry {
            league_membership_id: created_lm.id,
            match_id: None,
            score: 1500.0,
        }).execute(&*conn).expect("Unable to create EE.");
    sports::table
        .select(sports::name)
        .filter(sports::id.eq(league.sport_id))
        .first::<String>(&*conn).map(|sport| {
            Json(responses::League::from_parts(league, sport))
        })
}

#[get("/sports")]
fn get_sports(conn: DbConn) -> Result<Json<Vec<responses::Sport>>, diesel::result::Error> {
    sports::table.load(&*conn).map(|v: Vec<Sport>| Json(v.into_iter().map(|s| responses::Sport::from(s)).collect()))
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
                get_elo_entries_for_player,
                get_elo_entries,
                get_leagues,
                whoami,
                login_or_register,
                logout,
                join_league,
                create_league,
                get_sports
            ],
        ).launch();
}
