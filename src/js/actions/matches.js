import { RECEIVE_MATCHES, ADD_MATCH } from "../constants/action-types";
import { simpleFetch, postJson } from "./helpers";
import { loadPlayers } from "./players";
import { loadEloEntries } from "./elo-entries";

export const addMatch = match => ({ type: ADD_MATCH, payload: match });

export const loadMatches = simpleFetch('/api/matches', (dispatch, json) => dispatch(receiveMatches(json)));

export const receiveMatches = (matches) => ({ type: RECEIVE_MATCHES, payload: matches });

export const createMatch = (match) => (dispatch, getState) => postJson('/api/matches', match, getState, dispatch).then(json => {
	dispatch(addMatch(json));
	dispatch(loadPlayers());
	dispatch(loadEloEntries());
}, err => console.error(err));