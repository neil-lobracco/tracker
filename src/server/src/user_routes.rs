use super::interface_types::*;
use super::models::*;
use super::schema::*;
use super::*;

#[post("/users", data = "<ga>")]
pub fn login_or_register(conn: DbConn, mut cookies: Cookies, ga: Json<requests::GoogleAuth>) -> Json<responses::Signin> {
    let id_token = ga.into_inner().token;
    let token: google::TokenResponse = reqwest::get(&format!("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={}", id_token))
        .unwrap().json().unwrap();
    Json(if token.email_verified == "true" && token.aud == GOOGLE_CLIENT_ID {
        if token.email.contains("angela") || token.email.contains("sreenath") {
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

#[get("/users/me")]
pub fn whoami(conn: DbConn, mut cookies: Cookies) -> Result<Json<responses::User>, status::Custom<()>> {
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
pub fn logout(mut cookies: Cookies) -> rocket::response::status::Custom<()> {
    cookies.remove_private(Cookie::named(AUTH_COOKIE));
    status::Custom(rocket::http::Status::NoContent, ())
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