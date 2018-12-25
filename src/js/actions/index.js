import { ADD_PLAYER, RECEIVE_PLAYERS, RECEIVE_MATCHES, ADD_MATCH,
	RECEIVE_ELO_ENTRIES, SET_LEAGUE, RECEIVE_LEAGUES, SIGN_IN,
	 SIGN_OUT, JOINED_LEAGUE, LOADING_BEGIN, LOADING_COMPLETE, LOADING_FAIL } from "../constants/action-types";
export const addPlayer = player => ({ type: ADD_PLAYER, payload: player });
export const addMatch = match => ({ type: ADD_MATCH, payload: match });
export const receivePlayers = (players) => ({ type: RECEIVE_PLAYERS, payload: players });
export const receiveMatches = (matches) => ({ type: RECEIVE_MATCHES, payload: matches });
export const receiveEloEntries = (entries) => ({type: RECEIVE_ELO_ENTRIES, payload: entries });
export const signIn = (user) => ({type: SIGN_IN, payload: user});
export const receiveLeagues = (leagues) => ({type: RECEIVE_LEAGUES, payload: leagues});
export const setLeague = (leagueId) => (dispatch) => {
	window.localStorage.setItem('leagueId', leagueId);
	dispatch({ type: SET_LEAGUE, payload: leagueId });
	dispatch(loadPlayers());
	dispatch(loadMatches());
	dispatch(loadEloEntries());
};
export const joinedLeague = (leagueMembership) => ({ type: JOINED_LEAGUE, payload: leagueMembership });
export const signOut = () => (dispatch) => {
	dispatch({type: SIGN_OUT});
	fetch('/api/sessions/current', { method: 'DELETE' });
}

const fetchJson = (url, options={ headers: {}}, getState, dispatch) => new Promise((resolve, reject) => {
	dispatch({type: LOADING_BEGIN, payload: url });
	options.headers['League-Id'] = getState().leagues.current;
	fetch(url, options).then(response => response.json())
		.then(json => { resolve(json); })
		.catch(err => { dispatch({type: LOADING_FAIL, error: err}); reject(err); })
		.then(() => dispatch({type: LOADING_COMPLETE, payload: url}));
});

const postJson = (url, json, getState, dispatch) => fetchJson(url, {
		method: 'POST',
		headers : {"Content-Type": "application/json; charset=utf-8" },
		body: JSON.stringify(json),
	}, getState, dispatch);
const simpleFetch = (url, success) => () => (dispatch, getState) => fetchJson(url, undefined, getState, dispatch).then(success.bind(null,dispatch), err => console.error(err));

export const loadPlayers = simpleFetch('/api/players', (dispatch, json) => dispatch(receivePlayers(json)));
export const loadMatches = simpleFetch('/api/matches', (dispatch, json) => dispatch(receiveMatches(json)));
export const loadEloEntries = simpleFetch('/api/elo_entries', (dispatch, json) => dispatch(receiveEloEntries(json)));
export const loadLeagues = simpleFetch('/api/leagues', (dispatch, json) => dispatch(receiveLeagues(json)));
export const loadUserContext = simpleFetch('/api/users/me', (dispatch, json) => dispatch(signIn(json)));
export const createPlayer = (player) => (dispatch, getState) => postJson('/api/players', player, getState, dispatch).then(json => dispatch(addPlayer(json)), err => console.error(err));
export const createMatch = (match) => (dispatch, getState) => postJson('/api/matches', match, getState, dispatch).then(json => {
	dispatch(addMatch(json));
	dispatch(loadPlayers());
	dispatch(loadEloEntries());
}, err => console.error(err));
export const googleAuth = (token) => (dispatch, getState) => postJson('/api/users', { token }, getState, dispatch).then(json => {
	if (json.player && json.error == null) {
		dispatch(signIn(json.player));
	} else {
		console.error("Error signing in: "+ json.error);
	}
});
export const joinLeague = (leagueId) => (dispatch, getState) => postJson('/api/league_memberships', { player_id: getState().userContext.currentUser.id, league_id: getState().leagues.current }, getState, dispatch)
	.then(json => { dispatch(joinedLeague(json)); dispatch(loadPlayers()); dispatch(loadEloEntries()); });