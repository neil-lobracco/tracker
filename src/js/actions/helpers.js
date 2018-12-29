import { LOADING_BEGIN, LOADING_COMPLETE, LOADING_FAIL } from "../constants/action-types";

export const fetchJson = (url, options={ headers: {}}, getState, dispatch) => new Promise((resolve, reject) => {
    dispatch({type: LOADING_BEGIN, payload: url });
    if (getState) {
        options.headers['League-Id'] = getState().leagues.current;
    }
	fetch(url, options).then(response => response.json())
		.then(json => { resolve(json); })
		.catch(err => { 
            if (reject(err) !== false) {
                dispatch({type: LOADING_FAIL, error: err}); 
            }
        })
		.then(() => dispatch({type: LOADING_COMPLETE, payload: url}));
});

export const postJson = (url, json, getState, dispatch) => fetchJson(url, {
		method: 'POST',
		headers : {"Content-Type": "application/json; charset=utf-8" },
		body: JSON.stringify(json),
    }, getState, dispatch);

export const simpleFetch = (url, success, error) => () => (dispatch, getState) => fetchJson(url, undefined, getState, dispatch).then(success.bind(null,dispatch), error || (err => console.error(err)));