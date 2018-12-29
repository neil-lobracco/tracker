use super::interface_types::*;
use super::models::*;
use super::schema::*;
use super::*;

#[get("/sports")]
pub fn get_sports(conn: DbConn) -> Result<Json<Vec<responses::Sport>>, diesel::result::Error> {
    sports::table.load(&*conn).map(|v: Vec<Sport>| Json(v.into_iter().map(|s| responses::Sport::from(s)).collect()))
}