#[derive(Queryable)]
pub struct Player {
    pub id: i32,
    pub name: String,
    pub elo: f64
}
