import { ADD_PLAYER, RECEIVE_PLAYERS, RECEIVE_MATCHES, ADD_MATCH } from "../constants/action-types";
export const addPlayer = player => ({ type: ADD_PLAYER, payload: player });
export const addMatch = match => ({ type: ADD_MATCH, payload: match });
export const receivePlayers = (players) => ({ type: RECEIVE_PLAYERS, payload: players });
export const receiveMatches = (matches) => ({ type: RECEIVE_MATCHES, payload: matches });

export function loadPlayers() {
	return function(dispatch) {
		return fetch("/api/players")
			.then(response =>  { return response.json() },
				err => console.log(err))
			.then(json => dispatch(receivePlayers(json)),
				err => console.log(err));
	}
}

export function loadMatches() {
	return function(dispatch) {
		return fetch("/api/matches")
			.then(response =>  { return response.json() },
				err => console.log(err))
			.then(json => dispatch(receiveMatches(json)),
				err => console.log(err));
	}
}

export function createPlayer(player) {
	return function(dispatch) {
		return fetch("/api/players", {
			method: 'POST',
			headers : {"Content-Type": "application/json; charset=utf-8", },
			body: JSON.stringify(player),
		})
		.then(response =>  { return response.json() },
			err => console.log(err))
		.then(json => dispatch(addPlayer(json)),
			err => console.log(err));
	}
}

export function createMatch(match) {
	return function(dispatch) {
		return fetch("/api/matches", {
			method: 'POST',
			headers : {"Content-Type": "application/json; charset=utf-8", },
			body: JSON.stringify(match),
		})
		.then(response =>  { return response.json() },
			err => console.log(err))
		.then(json => {
			dispatch(addMatch(json))
			dispatch(loadPlayers());
		},
			err => console.log(err));
	}
}