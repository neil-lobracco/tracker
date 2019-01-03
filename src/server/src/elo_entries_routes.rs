use super::interface_types::*;
use super::models::*;
use super::schema::*;
use super::*;

#[get("/players/<player_id>/elo_entries")]
pub fn get_elo_entries_for_player(conn: DbConn, league_id: LeagueId, player_id: i32) -> QueryResult<Json<Vec<responses::EloEntry>>> {
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
                    league_membership_id: entry.league_membership_id,
                }
            }).collect())
        })
}

#[get("/elo_entries")]
pub fn get_elo_entries(conn: DbConn, league_id: LeagueId) -> QueryResult<Json<Vec<responses::EloEntry>>> {
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
                    league_membership_id: entry.0.league_membership_id,
                }
            }).collect())
        })
}