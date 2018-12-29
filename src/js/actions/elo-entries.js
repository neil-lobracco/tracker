import { RECEIVE_ELO_ENTRIES, SIGN_IN, SIGN_OUT, RECEIVE_SPORTS } from "../constants/action-types";
import { simpleFetch } from "./helpers";

export const receiveEloEntries = (entries) => ({type: RECEIVE_ELO_ENTRIES, payload: entries });

export const loadEloEntries = simpleFetch('/api/elo_entries', (dispatch, json) => dispatch(receiveEloEntries(json)));