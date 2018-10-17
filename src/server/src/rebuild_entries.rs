#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_derive;
mod models;
mod schema;
mod scoring;
use diesel::pg::PgConnection;
use self::models::*;
use self::schema::*;
use self::diesel::prelude::*;


#[derive(Insertable)]
#[table_name = "elo_entries"]
struct NewEloEntryWithDate {
    pub score: f64,
    pub player_id: i32,
    pub match_id: Option<i32>,
    pub created_at: chrono::DateTime<chrono::prelude::Utc>,
}

fn main() {
	let conn: PgConnection = diesel::connection::Connection::establish(&std::env::var("DATABASE_URL").unwrap()).unwrap();
	diesel::delete(elo_entries::table.filter(elo_entries::match_id.is_not_null())).execute(&conn).expect("Couldn't delete entries");
	let matches: Vec<Match> = matches::table.order(matches::created_at.asc()).load::<Match>(&conn).unwrap();
	let mut current_scores = std::collections::HashMap::new();
	for entry in elo_entries::table.load::<EloEntry>(&conn).unwrap() {
		current_scores.insert(entry.player_id, entry.score);
	}
	let mut new_entries = Vec::new();
	for m in matches {
		let r1 = current_scores.get(&m.player1_id).unwrap();
		let r2 = current_scores.get(&m.player2_id).unwrap();
		let (r1p, r2p) = scoring::get_new_scores(*r1, *r2, m.player1_score, m.player2_score);
		current_scores.insert(m.player1_id, r1p);
		current_scores.insert(m.player2_id, r2p);
		new_entries.push(NewEloEntryWithDate { score: r1p, player_id: m.player1_id, match_id: Some(m.id), created_at: m.created_at });
		new_entries.push(NewEloEntryWithDate { score: r2p, player_id: m.player2_id, match_id: Some(m.id), created_at: m.created_at });
	}
  	diesel::insert_into(elo_entries::table).values(&new_entries).execute(&conn);
  	for (player_id, score) in current_scores.iter() {
  		diesel::update(players::table).filter(players::id.eq(player_id)).set(players::elo.eq(score)).execute(&conn);
  	}
}