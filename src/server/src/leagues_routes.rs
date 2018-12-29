use super::interface_types::*;
use super::models::*;
use super::schema::*;
use super::*;

#[get("/leagues")]
pub fn get_leagues(conn: DbConn) -> QueryResult<Json<Vec<responses::League>>> {
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

#[post("/league_memberships", data="<lm>")]
pub fn join_league(conn: DbConn, user: User, lm: Json<requests::LeagueMembership>) -> Result<Json<responses::LeagueMembership>, rocket::response::status::BadRequest<()>> {
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

fn create_league_membership(conn: &DbConn, lm: NewLeagueMembership) -> Result<LeagueMembership, diesel::result::Error> {
    diesel::insert_into(league_memberships::table).values(lm).get_result(&**conn)
}

#[post("/leagues", data="<league>")]
pub fn create_league(conn: DbConn, user: User, league: Json<NewLeague>) -> Result<Json<responses::League>, diesel::result::Error> {
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