import { ADD_PLAYER, RECEIVE_PLAYERS, SET_LEAGUE } from "../constants/action-types";
export default (state = null, action) => {
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