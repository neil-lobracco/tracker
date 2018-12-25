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
mod scoring;
use self::diesel::prelude::*;
use self::interface_types::*;
use self::models::*;
use self::schema::*;
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

#[get("/players")]
fn get_players(conn: DbConn, league_id: LeagueId) -> QueryResult<Json<Vec<responses::Player>>> {
    let players_and_counts = elo_entries::table
        .inner_join(league_memberships::table.on(league_memberships::id.eq(elo_entries::league_membership_id)))
        .inner_join(players::table.on(players::id.eq(league_memberships::player_id)))
        .filter(league_memberships::league_id.eq(*league_id))
        .select((
            players::all_columns,
            diesel::dsl::sql::<diesel::sql_types::BigInt>("count(elo_entries.*)"),
        )).group_by(players::id)
        .load::<(Player, i64)>(&*conn)?;
    let elo_scores = fetch_current_elo(&conn, &players_and_counts.iter().map(|pandc| pandc.0.id).collect::<Vec<i32>>(), &league_id);
    let mut result: Vec<responses::Player> = players_and_counts.iter().map(|tup| {
        responses::Player {
            id: tup.0.id,
            elo: *elo_scores.get(&tup.0.id).unwrap(),
            name: tup.0.name.to_string(),
            games_played: tup.1 - 1,
        }
    }).collect();
    result.sort_unstable_by(|a,b| b.elo.partial_cmp(&a.elo).unwrap_or(std::cmp::Ordering::Equal));
    Ok(Json(result))
}

#[post("/players", data = "<player_json>")]
fn create_player(
    conn: DbConn,
    player_json: Json<requests::CreatePlayer>,
    league_id: LeagueId,
    _admin: Admin,
) -> Result<Json<responses::Player>, diesel::result::Error> {
    let create_player = player_json.into_inner();
    let new_player = NewPlayer {
        name: &create_player.name,
        email: None,
    };
    let player = conn.transaction::<_, diesel::result::Error, _>(|| {
        let player: Player = diesel::insert_into(players::table)
            .values(&new_player)
            .get_result(&*conn)?;
        let lm: LeagueMembership = diesel::insert_into(league_memberships::table)
            .values(&NewLeagueMembership {
                role: ADMIN_ROLE,
                player_id: player.id,
                league_id: *league_id,
            }).get_result(&*conn)?;
        diesel::insert_into(elo_entries::table)
            .values(&NewEloEntry {
                league_membership_id: lm.id,
                match_id: None,
                score: 1500.0,
            }).execute(&*conn)?;
        Ok(player)
    }).unwrap();
    Ok(Json(responses::Player {
        id: player.id,
        elo: 1500.0,
        name: player.name,
        games_played: 0,
    }))
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
                    .map(|tup| responses::League {
                        id: tup.0.id,
                        name: tup.0.name,
                        created_at: tup.0.created_at,
                        sport_id: tup.0.sport_id,
                        sport_name: tup.1,
                    }).collect(),
            )
        })
}

#[get("/matches")]
fn get_matches(conn: DbConn, league_id: LeagueId) -> QueryResult<Json<Vec<Match>>> {
    matches::table
        .filter(matches::league_id.eq(*league_id))
        .order_by(matches::created_at.desc())
        .load::<Match>(&*conn)
        .map(|ms| Json(ms))
}

#[get("/players/<player_id>/matches")]
fn get_matches_for_player(conn: DbConn, player_id: i32) -> QueryResult<Json<Vec<Match>>> {
    matches::table
        .filter(matches::player1_id.eq(player_id))
        .or_filter(matches::player2_id.eq(player_id))
        .order_by(matches::created_at.desc())
        .load::<Match>(&*conn)
        .map(|ms| Json(ms))
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

#[post("/matches", data = "<the_match_json>")]
fn create_match(
    conn: DbConn,
    the_match_json: Json<requests::CreateMatch>,
    league_id: LeagueId,
    _admin: Admin,
) -> Result<Json<Match>, diesel::result::Error> {
    let the_match = the_match_json.into_inner();
    let player1_lm_id = league_memberships::table
        .filter(league_memberships::player_id.eq(the_match.player1_id))
        .filter(league_memberships::league_id.eq(*league_id))
        .select(league_memberships::id)
        .first::<i32>(&*conn)?;
    let player2_lm_id = league_memberships::table
        .filter(league_memberships::player_id.eq(the_match.player2_id))
        .filter(league_memberships::league_id.eq(*league_id))
        .select(league_memberships::id)
        .first::<i32>(&*conn)?;

    let new_match = NewMatch {
        player1_id: the_match.player1_id,
        player2_id: the_match.player2_id,
        player1_score: the_match.player1_score,
        player2_score: the_match.player2_score,
        comment: the_match.comment,
        league_id: *league_id,
    };
    let current_elos = fetch_current_elo(&conn, &[the_match.player1_id, the_match.player2_id], &league_id);
    let (p1_elo, p2_elo) = (current_elos.get(&the_match.player1_id).unwrap(), current_elos.get(&the_match.player2_id).unwrap());
    let (r1p, r2p) = scoring::get_new_scores(*p1_elo, *p2_elo, the_match.player1_score, the_match.player2_score);
    let created_match = conn.transaction::<_, diesel::result::Error, _>(|| {
        let created_match: Match = diesel::insert_into(matches::table)
            .values(&new_match)
            .get_result(&*conn)?;
        let p1_elo_entry = NewEloEntry {
            league_membership_id: player1_lm_id,
            score: r1p,
            match_id: Some(created_match.id),
        };
        let p2_elo_entry = NewEloEntry {
            league_membership_id: player2_lm_id,
            score: r2p,
            match_id: Some(created_match.id),
        };
        diesel::insert_into(elo_entries::table)
            .values(&vec![p1_elo_entry, p2_elo_entry])
            .execute(&*conn)?;
        Ok(created_match)
    })?;
    Ok(Json(created_match))
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
        if token.email.contains("angela") || token.email.contains("sreenath") /* || !token.email.ends_with("@addepar.com")*/ {
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

fn main() {
    rocket::ignite()
        .manage(init_pool())
        .mount(
            "/",
            routes![
                get_players,
                create_player,
                create_match,
                get_matches,
                get_matches_for_player,
                get_elo_entries_for_player,
                get_elo_entries,
                get_leagues,
                whoami,
                login_or_register,
                logout,
                join_league
            ],
        ).launch();
}
