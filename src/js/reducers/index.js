import { ADD_PLAYER, RECEIVE_PLAYERS, RECEIVE_MATCHES, ADD_MATCH, RECEIVE_ELO_ENTRIES, SET_LEAGUE, RECEIVE_LEAGUES, SIGN_IN,
 JOINED_LEAGUE, SIGN_OUT } from "../constants/action-types";
const calcLeagueMembership = (leagueId, league_memberships) => leagueId && league_memberships && league_memberships.find(lm => lm.league_id == leagueId);
const playersReducer = (state, action) => {
  switch(action.type) {
    case ADD_PLAYER:
      return [...state, action.payload].sort((p1, p2) => p2.elo - p1.elo);
    case RECEIVE_PLAYERS:
      return action.payload;
    case SET_LEAGUE:
      return null;
    default:
      return state;
  }
};
const matchesReducer = (state, action) => {
  switch(action.type) {
    case RECEIVE_MATCHES:
     return action.payload;
    case ADD_MATCH:
      return [action.payload, ...state.matches ];
    case SET_LEAGUE:
      return null;
    default:
      return state;
  }
};
const leaguesReducer = (state = {}, action) => {
  let newState = state;
  switch(action.type) {
    case RECEIVE_LEAGUES:
     newState = { ...state, all: action.payload };
     break;
    case SET_LEAGUE:
     newState = { ...state, current: action.payload };
     break;
    case SIGN_IN:
      newState = {...state, memberships: action.payload.league_memberships };
      break;
    case SIGN_OUT:
      newState = {...state, memberships: null };
      break;
    case JOINED_LEAGUE:
      newState =  {...state,  memberships: [...memberships, action.payload] };
      break;
  };
  newState.currentMembership = calcLeagueMembership(newState.current, newState.memberships);
  return newState;
};
const eloEntryReducer = (state, action) => {
  switch(action.type) {
    case RECEIVE_ELO_ENTRIES:
     return action.payload.map(e => { e.created_at = new Date(e.created_at); return e; });
    case SET_LEAGUE:
      return null;
    default:
      return state;
  }
};
const userReducer = (state = {}, action) => {
  switch (action.type) {
    case SIGN_IN:
      return {...state, currentUser: action.payload  };
    case SIGN_OUT:
      return {...state, currentUser: null };
    default:
      return state;
 }
};
const rootReducer = (state = {}, action) => {
  return {
    players: playersReducer(state.players, action),
    matches: matchesReducer(state.matches, action),
    userContext: userReducer(state.userContext, action),
    eloEntries: eloEntryReducer(state.eloEntries, action),
    leagues: leaguesReducer(state.leagues, action),
  };
};

export default rootReducer;
