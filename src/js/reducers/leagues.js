import { RECEIVE_LEAGUES, ADD_LEAGUE, SET_LEAGUE, SIGN_IN, SIGN_OUT, JOINED_LEAGUE } from "../constants/action-types";
const calcLeagueMembership = (leagueId, league_memberships) => leagueId && league_memberships && league_memberships.find(lm => lm.league_id == leagueId);
export default (state = {}, action) => {
  let newState = state;
  switch(action.type) {
    case RECEIVE_LEAGUES:
     newState = { ...state, all: action.payload };
     break;
    case ADD_LEAGUE:
      newState = { ...state, all: [...state.all, action.payload] };
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
      newState =  {...state,  memberships: [...state.memberships, action.payload] };
      break;
  };
  newState.currentMembership = calcLeagueMembership(newState.current, newState.memberships);
  return newState;
};