#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_derive;

use diesel::pg::PgConnection;
pub mod interface_types;
pub mod models;
pub mod schema;
pub mod rebuild_entries;
mod scoring;
pub use crate::rebuild_entries::rebuild_entries;
pub use self::models::*;
pub use self::schema::*;

fn main() {
	let conn: PgConnection = diesel::connection::Connection::establish(&std::env::var("DATABASE_URL").unwrap()).unwrap();
	rebuild_entries(&conn);
}