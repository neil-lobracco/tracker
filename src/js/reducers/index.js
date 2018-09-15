import { ADD_PLAYER } from "../constants/action-types";
const initialState = {
  players: [],
  games : [],
};
const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_PLAYER:
      return { ...state, players: [...state.players, action.payload] };
    default:
      return state;
  }
};
export default rootReducer;
