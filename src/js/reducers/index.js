import { ADD_PLAYER, RECEIVE_PLAYERS, RECEIVE_MATCHES, ADD_MATCH } from "../constants/action-types";
const initialState = {
  players: [],
  matches: [],
};
const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_PLAYER:
      return { ...state, players: [...state.players, action.payload] };
     case RECEIVE_PLAYERS:
      return { ...state, players: action.payload };
     case RECEIVE_MATCHES:
      return { ...state, matches: action.payload };
     case ADD_MATCH:
      return {...state, matches: [...state.matches, action.payload] };
    default:
      return state;
  }
};
export default rootReducer;
