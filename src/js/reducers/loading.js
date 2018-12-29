import { LOADING_BEGIN, LOADING_FAIL, LOADING_COMPLETE } from '../constants/action-types';
export default (state = {numPending: 0, error: null}, action) => {
    switch (action.type) {
      case LOADING_BEGIN:
        return {...state, numPending: state.numPending + 1};
      case LOADING_FAIL:
        return {...state, error: action.payload };
      case LOADING_COMPLETE:
        return {...state, numPending: state.numPending - 1};
      default:
        return state;
    }
  };