import { SET_LEAGUE, RECEIVE_LEAGUES, JOINED_LEAGUE, ADD_LEAGUE } from "../constants/action-types";
import { simpleFetch, postJson } from "./helpers";
import { loadEloEntries } from "./elo-entries";
import { loadPlayers } from "./players";
import { loadMatches } from "./matches";

export const addLeague = league => ({ type: ADD_LEAGUE, payload: league });
export const receiveLeagues = (leagues) => ({type: RECEIVE_LEAGUES, payload: leagues});
export const joinedLeague = (leagueMembership) => ({ type: JOINED_LEAGUE, payload: leagueMembership });

export const setLeague = (leagueId) => (dispatch) => {
	window.localStorage.setItem('leagueId', leagueId);
	dispatch({ type: SET_LEAGUE, payload: leagueId });
	dispatch(loadPlayers());
	dispatch(loadMatches());
	dispatch(loadEloEntries());
};
export const loadLeagues = simpleFetch('/api/leagues', (dispatch, json) => dispatch(receiveLeagues(json)));

export const createLeague = (league) => (dispatch, getState) => postJson('/api/leagues', league, getState, dispatch)
    .then(json => {dispatch(addLeague(json)); dispatch(joinedLeague({ league_id: json.id, role: 'admin'})); }, err => console.error(err));
    
export const joinLeague = (leagueId) => (dispatch, getState) => postJson('/api/league_memberships', { player_id: getState().userContext.currentUser.id, league_id: leagueId }, getState, dispatch)
    .then(json => { dispatch(joinedLeague(json)); dispatch(loadPlayers()); dispatch(loadEloEntries()); });