use super::interface_types::*;
use super::models::*;
use super::schema::*;
use super::*;
#[get("/players")]
pub fn get_players(conn: DbConn, league_id: LeagueId) -> QueryResult<Json<Vec<responses::Player>>> {
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
pub fn create_player(
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