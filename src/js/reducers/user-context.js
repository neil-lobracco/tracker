import { SIGN_IN, SIGN_OUT } from '../constants/action-types';
export default (state = {}, action) => {
    switch (action.type) {
      case SIGN_IN:
        return {...state, currentUser: action.payload  };
      case SIGN_OUT:
        return {...state, currentUser: null };
      default:
        return state;
   }
  };