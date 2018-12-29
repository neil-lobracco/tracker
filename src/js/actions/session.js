import { SIGN_IN, SIGN_OUT } from "../constants/action-types";
import { simpleFetch, postJson } from "./helpers";

export const signIn = (user) => ({type: SIGN_IN, payload: user});

export const signOut = () => (dispatch) => {
	dispatch({type: SIGN_OUT});
	fetch('/api/sessions/current', { method: 'DELETE' });
}

export const loadUserContext = simpleFetch('/api/users/me', (dispatch, json) => dispatch(signIn(json)));

export const googleAuth = (token) => (dispatch, getState) => postJson('/api/users', { token }, getState, dispatch).then(json => {
	if (json.player && json.error == null) {
		dispatch(signIn(json.player));
	} else {
		console.error("Error signing in: "+ json.error);
	}
});