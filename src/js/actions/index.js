import { ADD_PLAYER, RECEIVE_PLAYERS, RECEIVE_MATCHES, ADD_MATCH, RECEIVE_PLAYER_DETAIL,
	RECEIVE_ELO_ENTRIES,  INVALIDATE_PLAYER_DETAIL, SET_LEAGUE, RECEIVE_LEAGUES, SIGN_IN } from "../constants/action-types";
export const addPlayer = player => ({ type: ADD_PLAYER, payload: player });
export const addMatch = match => ({ type: ADD_MATCH, payload: match });
export const invalidatePlayerDetail = () => ({ type: INVALIDATE_PLAYER_DETAIL });
export const receivePlayers = (players) => ({ type: RECEIVE_PLAYERS, payload: players });
export const receiveMatches = (matches) => ({ type: RECEIVE_MATCHES, payload: matches });
export const receivePlayerDetail = (playerId, playerDetail) => ({ type: RECEIVE_PLAYER_DETAIL, payload: playerDetail, playerId: playerId });
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

const fetchJson = (url, options={ headers: {}}, getState) => new Promise((resolve, reject) => {
	options.headers['League-Id'] = getState().leagueId;
	fetch(url, options).then(response => response.json(), err => reject(err))
		.then(json => resolve(json), err => reject(err));
});

const postJson = (url, json, accessCode, getState) => fetchJson(url, {
		method: 'POST',
		headers : {"Content-Type": "application/json; charset=utf-8", "Access-Code" : accessCode},
		body: JSON.stringify(json),
	}, getState);
const simpleFetch = (url, success) => () => (dispatch, getState) => fetchJson(url, undefined, getState).then(success.bind(null,dispatch), err => console.error(err));

export const loadPlayers = simpleFetch('/api/players', (dispatch, json) => dispatch(receivePlayers(json)));
export const loadMatches = simpleFetch('/api/matches', (dispatch, json) => dispatch(receiveMatches(json)));
export const loadEloEntries = simpleFetch('/api/elo_entries', (dispatch, json) => dispatch(receiveEloEntries(json)));
export const loadLeagues = simpleFetch('/api/leagues', (dispatch, json) => dispatch(receiveLeagues(json)));
export const loadUserContext = simpleFetch('/api/users/me', (dispatch, json) => dispatch(signIn(json)));
export const loadPlayerDetail = (playerId) => (dispatch) => fetchJson(`/api/players/${playerId}/elo_entries`).then(json => dispatch(receivePlayerDetail(playerId, json)), err => console.err(error));
export const createPlayer = (player, code) => (dispatch, getState) => postJson('/api/players', player, code, getState).then(json => dispatch(addPlayer(json)), err => console.error(err));
export const createMatch = (match, code) => (dispatch, getState) => postJson('/api/matches', match, code, getState).then(json => {
	dispatch(addMatch(json));
	dispatch(invalidatePlayerDetail())
	dispatch(loadPlayers());
	dispatch(loadEloEntries());
}, err => console.error(err));
export const googleAuth = (token) => (dispatch, getState) => postJson('/api/users', { token }, '', getState).then(json => dispatch(signIn(json)));