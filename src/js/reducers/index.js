import { ADD_PLAYER, RECEIVE_PLAYERS } from "../constants/action-types";
const initialState = {
  players: [],
  games : [],
};
const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_PLAYER:
      return { ...state, players: [...state.players, action.payload] };
     case RECEIVE_PLAYERS:
      return { ...state, players: action.payload };
    default:
      return state;
  }
};
export default rootReducer;
