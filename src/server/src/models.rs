use super::schema::players;

#[derive(Queryable, Serialize, Deserialize)]
pub struct Player {
    pub id: i32,
    pub name: String,
    pub elo: f64
}

#[derive(Insertable, Deserialize)]
#[table_name = "players"]
pub struct NewPlayer {
    pub name: String,
    pub elo: f64
}