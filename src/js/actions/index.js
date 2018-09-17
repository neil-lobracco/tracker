import { ADD_PLAYER, RECEIVE_PLAYERS, RECEIVE_MATCHES, ADD_MATCH, RECEIVE_PLAYER_DETAIL } from "../constants/action-types";
export const addPlayer = player => ({ type: ADD_PLAYER, payload: player });
export const addMatch = match => ({ type: ADD_MATCH, payload: match });
export const receivePlayers = (players) => ({ type: RECEIVE_PLAYERS, payload: players });
export const receiveMatches = (matches) => ({ type: RECEIVE_MATCHES, payload: matches });
export const receivePlayerDetail = (playerId, playerDetail) => ({ type: RECEIVE_PLAYER_DETAIL, payload: playerDetail, playerId: playerId });

export function loadPlayers() {
	return function(dispatch) {
		return fetch("/api/players")
			.then(response =>  { return response.json() },
				err => console.log(err))
			.then(json => dispatch(receivePlayers(json)),
				err => console.log(err));
	}
}

export function loadPlayerDetail(playerId) {
	return function(dispatch) {
		return fetch(`/api/players/${playerId}/elo_entries`)
			.then(response =>  { return response.json() },
				err => console.log(err))
			.then(json => dispatch(receivePlayerDetail(playerId, json)),
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