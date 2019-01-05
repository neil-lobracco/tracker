import { RECEIVE_MATCHES, ADD_MATCH, SET_LEAGUE, EDIT_MATCH, SIGN_OUT } from '../constants/action-types';
export default (state = {}, action) => {
    switch(action.type) {
      case RECEIVE_MATCHES:
       return {...state, all: action.payload};
      case ADD_MATCH:
        return {...state, all: [action.payload, ...state.all] };
      case SET_LEAGUE:
        return {};
      case EDIT_MATCH:
        return {...state, currentlyEditing: action.payload };
      case SIGN_OUT:
        return {...state, currentlyEditing: null };
      default:
        return state;
    }
};