# Tracker (name TBD)

Rust /  Postgres backend (API only) with a React/Redux SPA frontend.

Keeps track of players, matches, and Elo scores (with history)

To develop:
 - Clone repo, enter into folder
 - Set up postgres, export `DATABASE_URL` appropriately.
 - `cd src/server; cargo install diesel_cli; diesel migration run; cargo run` (this requires nightly rust; see the rustup guide for help)
 - In another terminal: `yarn install; yarn start` (this will run webpack-dev-server serving the frontend)
 
 The app should now be serving at localhost:8080
