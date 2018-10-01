import { ADD_PLAYER, RECEIVE_PLAYERS, RECEIVE_MATCHES, ADD_MATCH, RECEIVE_PLAYER_DETAIL,
 INVALIDATE_PLAYER_DETAIL, RECEIVE_ELO_ENTRIES, SET_LEAGUE, RECEIVE_LEAGUES } from "../constants/action-types";
const initialState = {
  players: null,
  matches: null,
  playerDetail: null,
  eloEntries : null,
  leagueId: null,
  leagues: null,
};
const inject_extras = (players) => [...players, {name: 'Angela and Sreenath', elo: -99999, games_played: 0}];
const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_PLAYER:
      return { ...state, players: [...state.players, action.payload].sort((p1, p2) => p2.elo - p1.elo) };
     case RECEIVE_PLAYERS:
      return { ...state, players: inject_extras(action.payload) };
     case RECEIVE_MATCHES:
      return { ...state, matches: action.payload };
     case ADD_MATCH:
      return {...state, matches: [action.payload, ...state.matches ] };
     case RECEIVE_PLAYER_DETAIL:
      return {...state, playerDetail: {eloEntries: action.payload, playerId: action.playerId} };
     case INVALIDATE_PLAYER_DETAIL:
      return {...state, playerDetail: {}};
     case SET_LEAGUE:
      return { leagues: state.leagues, leagueId: action.payload };
     case RECEIVE_LEAGUES:
      return { ...state, leagues: action.payload };
     case RECEIVE_ELO_ENTRIES:
      return {...state, eloEntries: action.payload.map(e => { e.created_at = new Date(e.created_at); return e; }) };
    default:
      return state;
  }
};
export default rootReducer;
