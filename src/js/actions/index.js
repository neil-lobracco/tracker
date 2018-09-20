import { ADD_PLAYER, RECEIVE_PLAYERS, RECEIVE_MATCHES, ADD_MATCH, RECEIVE_PLAYER_DETAIL,
	RECEIVE_ELO_ENTRIES,  INVALIDATE_PLAYER_DETAIL } from "../constants/action-types";
export const addPlayer = player => ({ type: ADD_PLAYER, payload: player });
export const addMatch = match => ({ type: ADD_MATCH, payload: match });
export const invalidatePlayerDetail = () => ({ type: INVALIDATE_PLAYER_DETAIL });
export const receivePlayers = (players) => ({ type: RECEIVE_PLAYERS, payload: players });
export const receiveMatches = (matches) => ({ type: RECEIVE_MATCHES, payload: matches });
export const receivePlayerDetail = (playerId, playerDetail) => ({ type: RECEIVE_PLAYER_DETAIL, payload: playerDetail, playerId: playerId });
export const receiveEloEntries = (entries) => ({type: RECEIVE_ELO_ENTRIES, payload: entries });

const fetchJson = (url, options={}) => new Promise((resolve, reject) => {
	fetch(url, options).then(response => response.json(), err => reject(err))
		.then(json => resolve(json), err => reject(err));
});

const postJson = (url, json) => fetchJson(url, {
		method: 'POST',
		headers : {"Content-Type": "application/json; charset=utf-8", },
		body: JSON.stringify(json),
	});
const simpleFetch = (url, success) => () => (dispatch) => fetchJson(url).then(success.bind(null,dispatch), err => console.error(err));

export const loadPlayers = simpleFetch('/api/players', (dispatch, json) => dispatch(receivePlayers(json)));
export const loadMatches = simpleFetch('/api/matches', (dispatch, json) => dispatch(receiveMatches(json)));
export const loadEloEntries = simpleFetch('/api/elo_entries', (dispatch, json) => dispatch(receiveEloEntries(json)));
export const loadPlayerDetail = (playerId) => (dispatch) => fetchJson(`/api/players/${playerId}/elo_entries`).then(json => dispatch(receivePlayerDetail(playerId, json)), err => console.err(error));
export const createPlayer = (player) => (dispatch) => postJson('/api/players', player).then(json => dispatch(addPlayer(json)), err => console.error(err));
export const createMatch = (match) => (dispatch) => postJson('/api/matches', match).then(json => {
	dispatch(addMatch(json));
	dispatch(invalidatePlayerDetail())
	dispatch(loadPlayers());
	dispatch(loadEloEntries());
}, err => console.error(err));