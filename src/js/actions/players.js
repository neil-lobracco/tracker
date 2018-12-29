import { ADD_PLAYER, RECEIVE_PLAYERS } from "../constants/action-types";
import { simpleFetch, postJson } from "./helpers";

export const addPlayer = player => ({ type: ADD_PLAYER, payload: player });

export const receivePlayers = players => ({ type: RECEIVE_PLAYERS, payload: players });

export const loadPlayers = simpleFetch('/api/players', (dispatch, json) => dispatch(receivePlayers(json)));

export const createPlayer = (player) => (dispatch, getState) => postJson('/api/players', player, getState, dispatch).then(json => dispatch(addPlayer(json)), err => console.error(err));