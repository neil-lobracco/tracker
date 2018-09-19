#![feature(plugin)]
#![plugin(rocket_codegen)]
extern crate rocket;
#[macro_use] extern crate diesel;
#[macro_use] extern crate serde_derive;

use diesel::pg::PgConnection;
pub mod schema;
pub mod models;
pub mod interface_types;
use self::interface_types::*;
use self::models::*;
use self::schema::*;
use self::diesel::prelude::*;
use std::ops::Deref;
use rocket::http::Status;
use rocket::request::{self, FromRequest};
use rocket::{Request, State, Outcome};
use diesel::r2d2::{ConnectionManager, Pool, PooledConnection};
use rocket_contrib::Json;

static K_win_loss: f64 = 25.0;
static K_scored: f64 = 40.0;

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
            Err(_) => Outcome::Failure((Status::ServiceUnavailable, ()))
        }
    }
}

impl Deref for DbConn {
    type Target = PgConnection;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}



#[get("/players")]
fn get_players(conn: DbConn) -> QueryResult<Json<Vec<response::Player>>> {
    let query = elo_entries::table.inner_join(players::table.on(players::id.eq(elo_entries::player_id)))
    	.select((players::all_columns, diesel::dsl::sql::<diesel::sql_types::BigInt>("count(elo_entries.*)")))
    	.group_by(players::id)
    	.order_by(players::elo.desc());
	query.load::<(Player, i64)>(&*conn)
	.map(|tups| Json(tups.into_iter().map(|tup| response::Player {
		id: tup.0.id,
		elo: tup.0.elo,
		name: tup.0.name,
		games_played: tup.1 - 1
	}).collect()))
}

#[post("/players", data = "<player>")]
fn create_player(conn: DbConn, player: Json<NewPlayer>) -> Result<Json<response::Player>, diesel::result::Error> {
	let player: Player = diesel::insert_into(players::table).values(&player.into_inner()).get_result(&*conn)?;
	diesel::insert_into(elo_entries::table).values(&NewEloEntry { player_id: player.id, match_id: None, score: player.elo }).execute(&*conn)?;
	Ok(Json(response::Player {
		id: player.id,
		elo: player.elo,
		name: player.name,
		games_played: 0
	}))
}

#[get("/matches")]
fn get_matches(conn: DbConn) -> QueryResult<Json<Vec<Match>>> {
    matches::table.order_by(matches::created_at.desc()).load::<Match>(&*conn).map(|ms| Json(ms))
}

#[get("/players/<player_id>/matches")]
fn get_matches_for_player(conn: DbConn, player_id: i32) -> QueryResult<Json<Vec<Match>>> {
    matches::table.filter(matches::player1_id.eq(player_id)).or_filter(matches::player2_id.eq(player_id))
    	.order_by(matches::created_at.desc()).load::<Match>(&*conn).map(|ms| Json(ms))
}

#[get("/players/<player_id>/elo_entries")]
fn get_elo_entries_for_player(conn: DbConn, player_id: i32) -> QueryResult<Json<Vec<EloEntry>>> {
    elo_entries::table.filter(elo_entries::player_id.eq(player_id))
    	.order_by(elo_entries::created_at.asc()).load::<EloEntry>(&*conn).map(|entries| Json(entries))
}

#[post("/matches", data = "<the_match_json>")]
fn create_match(conn: DbConn, the_match_json: Json<NewMatch>) -> Result<Json<Match>, diesel::result::Error> {
	let the_match: NewMatch = the_match_json.into_inner();
	let player1: Player = players::table.filter(players::id.eq(the_match.player1_id)).first::<Player>(&*conn)?;
	let player2: Player = players::table.filter(players::id.eq(the_match.player2_id)).first::<Player>(&*conn)?;
	let r1 = player1.elo;
	let r2 = player2.elo;
	let e1 = 1_f64 / (1_f64 + (10_f64.powf((r2 - r1) / 400_f64)));
	let e2 = 1_f64 - e1;
	let (s1, s2) = normalize_scores(the_match.player1_score, the_match.player2_score);
	println!("Expected players to score {},{} but actually scored {}, {}", e1, e2, s1, s2);
	let K = get_k(the_match.player1_score, the_match.player2_score);
	println!("Using k={}",K);
	let r1p = r1 + (K * (s1 - e1));
	let r2p = r2 + (K * (s2 - e2));
	println!("Adjusting scores from {}, {} to {}, {}", r1, r2, r1p, r2p);
	let created_match = conn.transaction::<_, diesel::result::Error, _>(|| {
		let created_match: Match = diesel::insert_into(matches::table).values(&the_match).get_result(&*conn)?;
		diesel::update(&player1).set(players::elo.eq(r1p)).execute(&*conn)?;
		diesel::update(&player2).set(players::elo.eq(r2p)).execute(&*conn)?;
		let p1_elo_entry = NewEloEntry { player_id: player1.id, score: r1p, match_id: Some(created_match.id)};
		let p2_elo_entry = NewEloEntry { player_id: player2.id, score: r2p, match_id: Some(created_match.id)};
		diesel::insert_into(elo_entries::table).values(&vec![p1_elo_entry, p2_elo_entry]).execute(&*conn)?;
		Ok(created_match)
	})?;
	Ok(Json(created_match))
}

fn get_k(score1: f64, score2: f64) -> f64 {
	if score1 + score2 == 1.0 {
		K_win_loss
	} else {
		K_scored
	}
}

fn normalize_scores(p1score: f64, p2score: f64) -> (f64, f64) {
	let sum = p1score + p2score;
	(p1score / sum, p2score / sum)
}

fn main() {
    rocket::ignite()
    	.manage(init_pool())
    	.mount("/", routes![get_players, create_player, create_match, get_matches, get_matches_for_player, get_elo_entries_for_player])
    	.launch();
}