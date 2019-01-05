import { RECEIVE_MATCHES, ADD_MATCH, EDIT_MATCH } from "../constants/action-types";
import { simpleFetch, postJson, putJson } from "./helpers";
import { loadPlayers } from "./players";
import { loadEloEntries } from "./elo-entries";

export const addMatch = match => ({ type: ADD_MATCH, payload: match });

export const loadMatches = simpleFetch('/api/matches', (dispatch, json) => dispatch(receiveMatches(json)));

export const receiveMatches = (matches) => ({ type: RECEIVE_MATCHES, payload: matches });

export const setEditingMatch = match => ({ type: EDIT_MATCH, payload: match });

export const createMatch = (match) => (dispatch, getState) => postJson('/api/matches', match, getState, dispatch).then(json => {
	dispatch(addMatch(json));
	dispatch(loadPlayers());
	dispatch(loadEloEntries());
}, err => console.error(err));

export const updateMatch = (match) => (dispatch, getState) => putJson(`/api/matches/${match.id}`, match, getState, dispatch).then(json => {
	dispatch(loadMatches());
	dispatch(loadPlayers());
	dispatch(loadEloEntries());
}, err => console.error(err));