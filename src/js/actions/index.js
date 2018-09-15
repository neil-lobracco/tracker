import { ADD_PLAYER, FETCH_PLAYERS, RECEIVE_PLAYERS } from "../constants/action-types";
export const addPlayer = player => ({ type: ADD_PLAYER, payload: player });
export const receivePlayers = (players) => ({ type: RECEIVE_PLAYERS, payload: players });
export const fetchPlayers = () => { type: FETCH_PLAYERS };

export function loadPlayers() {
	return function(dispatch) {
		return fetch("/api/players")
			.then(response =>  { return response.json() },
				err => console.log(err))
			.then(json => dispatch(receivePlayers(json)),
				err => console.log(err));
	}
}