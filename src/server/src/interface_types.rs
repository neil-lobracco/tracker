pub mod response {

	#[derive(Serialize)]
	pub struct Player {
	    pub id: i32,
	    pub name: String,
	    pub elo: f64,
	    pub games_played: i64,
	}

}