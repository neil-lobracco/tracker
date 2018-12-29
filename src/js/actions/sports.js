import { RECEIVE_SPORTS } from "../constants/action-types";
import { simpleFetch } from "./helpers";


export const receiveSports = (sports) => ({ type: RECEIVE_SPORTS, payload: sports });

export const loadSports = simpleFetch('/api/sports', (dispatch, json) => dispatch(receiveSports(json)));