import { ADD_PLAYER, RECEIVE_PLAYERS, RECEIVE_MATCHES, ADD_MATCH, RECEIVE_PLAYER_DETAIL,
 INVALIDATE_PLAYER_DETAIL, RECEIVE_ELO_ENTRIES, SET_LEAGUE, RECEIVE_LEAGUES, SIGN_IN,
 JOINED_LEAGUE, SIGN_OUT } from "../constants/action-types";
const initialState = {
  players: null,
  matches: null,
  playerDetail: null,
  eloEntries : null,
  leagueId: null,
  leagues: null,
  user: null,
  currentLeagueMembership: null,
};
const calcLeagueMembership = (leagueId, user) => leagueId &&  user && user.league_memberships.find(lm => lm.league_id == leagueId);
const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_PLAYER:
      return { ...state, players: [...state.players, action.payload].sort((p1, p2) => p2.elo - p1.elo) };
     case RECEIVE_PLAYERS:
      return { ...state, players: action.payload };
     case RECEIVE_MATCHES:
      return { ...state, matches: action.payload };
     case ADD_MATCH:
      return {...state, matches: [action.payload, ...state.matches ] };
     case RECEIVE_PLAYER_DETAIL:
      return {...state, playerDetail: {eloEntries: action.payload, playerId: action.playerId} };
     case INVALIDATE_PLAYER_DETAIL:
      return {...state, playerDetail: {}};
     case SET_LEAGUE:
      return { user: state.user, leagues: state.leagues, leagueId: action.payload, currentLeagueMembership: calcLeagueMembership(action.payload, state.user) };
     case RECEIVE_LEAGUES:
      return { ...state, leagues: action.payload };
     case RECEIVE_ELO_ENTRIES:
      return {...state, eloEntries: action.payload.map(e => { e.created_at = new Date(e.created_at); return e; }) };
     case SIGN_IN:
      return {...state, user: action.payload, currentLeagueMembership: calcLeagueMembership(state.leagueId, action.payload) };
     case SIGN_OUT:
      return {...state, user: null };
     case JOINED_LEAGUE:
      const newUserState = { ...state.user, league_memberships: [...state.user.league_memberships, action.payload] };
      return {...state, user: newUserState, currentLeagueMembership: calcLeagueMembership(state.leagueId, newUserState)};
    default:
      return state;
  }
};
export default rootReducer;
