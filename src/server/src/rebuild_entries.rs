use diesel::pg::PgConnection;
use super::models::*;
use super::schema::*;
use super::diesel::prelude::*;
use super::*;


pub fn rebuild_entries(conn: &PgConnection) {
	diesel::delete(elo_entries::table.filter(super::elo_entries::match_id.is_not_null())).execute(conn).expect("Couldn't delete entries");
	let matches: Vec<Match> = matches::table.order(matches::created_at.asc()).load::<Match>(conn).unwrap();
	let league_memberships_vec: Vec<LeagueMembership> = league_memberships::table.load::<LeagueMembership>(conn).unwrap();
	let mut league_memberships = std::collections::HashMap::new();
	for m in league_memberships_vec {
		league_memberships.insert((m.player_id, m.league_id), m.id);
	}
	let mut current_scores = std::collections::HashMap::new();
	let ee = elo_entries::table.inner_join(league_memberships::table.on(league_memberships::id.eq(elo_entries::league_membership_id)))
		.select((elo_entries::score, league_memberships::id));
	for entry in ee.load::<(f64, i32)>(conn).expect("couldn't load entries") {
		current_scores.insert(entry.1, entry.0);
	}
	let mut new_entries = Vec::new();
	for m in matches {
		let lmid1 = league_memberships.get(&(m.player1_id, m.league_id)).expect(&format!("Couldn't find league membership: {}, {}",m.player1_id, m.league_id));
		let lmid2 = league_memberships.get(&(m.player2_id, m.league_id)).expect(&format!("Couldn't find league membership: {}, {}",m.player2_id, m.league_id));
		let r1 = current_scores.get(lmid1).expect("Couldn't find score");
		let r2 = current_scores.get(lmid2).expect("Couldn't find score");
		let (r1p, r2p) = scoring::get_new_scores(*r1, *r2, m.player1_score, m.player2_score);
		current_scores.insert(*lmid1, r1p);
		current_scores.insert(*lmid2, r2p);
		new_entries.push(NewEloEntry { score: r1p, league_membership_id: *lmid1, match_id: Some(m.id), created_at: Some(m.created_at) });
		new_entries.push(NewEloEntry { score: r2p, league_membership_id: *lmid2, match_id: Some(m.id), created_at: Some(m.created_at) });
	}
	println!("Ok, inserting {} entries.",new_entries.len());
  	diesel::insert_into(elo_entries::table).values(&new_entries).execute(conn).expect("Insertion failed!");
}