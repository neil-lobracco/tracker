use super::*;

pub struct DbConn(pub PooledConnection<ConnectionManager<PgConnection>>);
impl<'a, 'r> FromRequest<'a, 'r> for DbConn {
    type Error = ();
    fn from_request(request: &'a Request<'r>) -> request::Outcome<Self, Self::Error> {
        let pool = request.guard::<State<PostgresPool>>()?;
        match pool.get() {
            Ok(conn) => Outcome::Success(DbConn(conn)),
            Err(_) => Outcome::Failure((Status::ServiceUnavailable, ())),
        }
    }
}

impl Deref for DbConn {
    type Target = PgConnection;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

pub struct LeagueId(i32);
impl<'a, 'r> FromRequest<'a, 'r> for LeagueId {
    type Error = ();
    fn from_request(request: &'a Request<'r>) -> request::Outcome<Self, Self::Error> {
        match request
            .headers()
            .get_one(LEAGUE_HEADER_NAME)
            .and_then(|val| val.parse::<i32>().ok())
        {
            Some(lid) => Outcome::Success(LeagueId(lid)),
            None => Outcome::Success(LeagueId(1)), /*Outcome::Failure((Status::BadRequest, ())),*/
        }
    }
}

impl Deref for LeagueId {
    type Target = i32;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}


pub struct Admin(Player);
impl<'a, 'r> FromRequest<'a, 'r> for Admin {
    type Error = ();
    fn from_request(request: &'a Request<'r>) -> request::Outcome<Self, Self::Error> {
        let provided_email = match request
            .cookies()
            .get_private(AUTH_COOKIE)
        {
            Some(email_cookie) => email_cookie.value().to_string(),
            None => return Outcome::Failure((Status::BadRequest, ())),
        };
        let conn = match request.guard::<DbConn>() {
            Outcome::Success(c) => c,
            _ => return Outcome::Failure((Status::ServiceUnavailable, ())),
        };
        let league_id = match request.guard::<LeagueId>() {
            Outcome::Success(lid) => lid,
            _ => return Outcome::Failure((Status::BadRequest, ())),
        };
        match players::table
            .inner_join(league_memberships::table.on(league_memberships::player_id.eq(players::id)))
            .filter(league_memberships::league_id.eq(*league_id))
            .filter(league_memberships::role.eq(ADMIN_ROLE))
            .filter(players::email.eq(provided_email))
            .select(players::all_columns)
            .first(&*conn) {
                Ok(player) => Outcome::Success(Admin(player)),
                _ => Outcome::Failure((Status::ServiceUnavailable, ())),
        }
    }
}

impl Deref for Admin {
    type Target = Player;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

pub struct User(Player);
impl<'a, 'r> FromRequest<'a, 'r> for User {
    type Error = ();
    fn from_request(request: &'a Request<'r>) -> request::Outcome<Self, Self::Error> {
        let provided_email = match request
            .cookies()
            .get_private(AUTH_COOKIE)
        {
            Some(email_cookie) => email_cookie.value().to_string(),
            None => return Outcome::Failure((Status::BadRequest, ())),
        };
        let conn = match request.guard::<DbConn>() {
            Outcome::Success(c) => c,
            _ => return Outcome::Failure((Status::ServiceUnavailable, ())),
        };
        match players::table
            .filter(players::email.eq(provided_email))
            .select(players::all_columns)
            .first(&*conn) {
                Ok(player) => Outcome::Success(User(player)),
                _ => Outcome::Failure((Status::ServiceUnavailable, ())),
        }
    }
}

impl Deref for User {
    type Target = Player;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}