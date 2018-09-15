#![feature(plugin)]
#![plugin(rocket_codegen)]
extern crate rocket;
#[macro_use] extern crate diesel;

use diesel::pg::PgConnection;

type PostgresPool = Pool<ConnectionManager<PgConnection>>;

/// Initializes a database pool.
fn init_pool() -> PostgresPool {
    let manager = ConnectionManager::<PgConnection>::new(std::env::var("DATABASE_URL").unwrap());
    Pool::new(manager).expect("db pool")
}
pub mod schema;
pub mod models;
use self::models::*;
use self::diesel::prelude::*;
use std::ops::Deref;
use rocket::http::Status;
use rocket::request::{self, FromRequest};
use rocket::{Request, State, Outcome};
use diesel::r2d2::{ConnectionManager, Pool, PooledConnection};
#[macro_use]
extern crate serde_derive;
use rocket_contrib::Json;


// Connection request guard type: a wrapper around an r2d2 pooled connection.
pub struct DbConn(pub PooledConnection<ConnectionManager<PgConnection>>);

/// Attempts to retrieve a single connection from the managed database pool. If
/// no pool is currently managed, fails with an `InternalServerError` status. If
/// no connections are available, fails with a `ServiceUnavailable` status.
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


use self::schema::players::dsl::*;

#[get("/players")]
fn get_players(conn: DbConn) -> QueryResult<Json<Vec<Player>>> {
    players.load::<Player>(&*conn)
    	.map(|ps| Json(ps))
}

#[post("/players", data = "<player>")]
fn create_player(conn: DbConn, player: Json<NewPlayer>) -> Json<Player> {
	Json(diesel::insert_into(players).values(&player.into_inner()).get_result(&*conn).expect("couldn't save post"))
}

fn main() {
    rocket::ignite()
    	.manage(init_pool())
    	.mount("/", routes![get_players, create_player])
    	.launch();
}