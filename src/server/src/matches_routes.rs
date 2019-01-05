use super::interface_types::*;
use super::models::*;
use super::schema::*;
use super::*;

#[get("/matches")]
pub fn get_matches(conn: DbConn, league_id: LeagueId) -> QueryResult<Json<Vec<Match>>> {
    matches::table
        .filter(matches::league_id.eq(*league_id))
        .order_by(matches::created_at.desc())
        .load::<Match>(&*conn)
        .map(|ms| Json(ms))
}

#[get("/players/<player_id>/matches")]
pub fn get_matches_for_player(conn: DbConn, player_id: i32) -> QueryResult<Json<Vec<Match>>> {
    matches::table
        .filter(matches::player1_id.eq(player_id))
        .or_filter(matches::player2_id.eq(player_id))
        .order_by(matches::created_at.desc())
        .load::<Match>(&*conn)
        .map(|ms| Json(ms))
}

#[put("/matches/<match_id>", data = "<the_match_json>")]
pub fn update_match(conn: DbConn, the_match_json: Json<requests::CreateOrUpdateMatch>, match_id: i32, _admin: Admin, league_id: LeagueId) -> Result<Json<Match>, diesel::result::Error> {
    let the_match = the_match_json.into_inner();
    let updated_match = conn.transaction::<_, diesel::result::Error, _>(|| {
        let m = diesel::update(matches::table.filter(matches::id.eq(match_id).and(matches::league_id.eq(*league_id))))
            .set(the_match).get_result(&*conn);
        super::rebuild_entries::rebuild_entries(&*conn);
        m
    })?;
    Ok(Json(updated_match))
}

#[post("/matches", data = "<the_match_json>")]
pub fn create_match(
    conn: DbConn,
    the_match_json: Json<requests::CreateOrUpdateMatch>,
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
        created_at: the_match.created_at,
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
            created_at: None,
        };
        let p2_elo_entry = NewEloEntry {
            league_membership_id: player2_lm_id,
            score: r2p,
            match_id: Some(created_match.id),
            created_at: None,
        };
        diesel::insert_into(elo_entries::table)
            .values(&vec![p1_elo_entry, p2_elo_entry])
            .execute(&*conn)?;
        Ok(created_match)
    })?;
    Ok(Json(created_match))
}