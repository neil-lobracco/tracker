import { ADD_PLAYER, RECEIVE_PLAYERS, RECEIVE_MATCHES, ADD_MATCH, RECEIVE_PLAYER_DETAIL } from "../constants/action-types";
const initialState = {
  players: [],
  matches: [],
  playerDetail: {},
};
const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_PLAYER:
      return { ...state, players: [...state.players, action.payload].sort((p1, p2) => p2.elo - p1.elo) };
     case RECEIVE_PLAYERS:
      return { ...state, players: action.payload };
     case RECEIVE_MATCHES:
      return { ...state, matches: action.payload };
     case ADD_MATCH:
      return {...state, matches: [...state.matches, action.payload] };
     case RECEIVE_PLAYER_DETAIL:
      return {...state, playerDetail: {eloEntries: action.payload, playerId: action.playerId} };
    default:
      return state;
  }
};
export default rootReducer;
