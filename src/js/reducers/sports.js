import { RECEIVE_SPORTS } from '../constants/action-types';
export default (state = null, action) => {
    switch (action.type) {
      case RECEIVE_SPORTS:
        return action.payload;
      default:
        return state;
    }
};