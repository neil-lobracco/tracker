import { ADD_PLAYER } from "../constants/action-types";
export const addPlayer = player => ({ type: ADD_PLAYER, payload: player });