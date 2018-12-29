import { RECEIVE_MATCHES, ADD_MATCH, SET_LEAGUE } from '../constants/action-types';
export default (state = null, action) => {
    switch(action.type) {
      case RECEIVE_MATCHES:
       return action.payload;
      case ADD_MATCH:
        return [action.payload, ...state ];
      case SET_LEAGUE:
        return null;
      default:
        return state;
    }
};