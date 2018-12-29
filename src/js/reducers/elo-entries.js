import { RECEIVE_ELO_ENTRIES, SET_LEAGUE } from '../constants/action-types';
export default (state = null, action) => {
    switch(action.type) {
      case RECEIVE_ELO_ENTRIES:
       return action.payload.map(e => { e.created_at = new Date(e.created_at); return e; });
      case SET_LEAGUE:
        return null;
      default:
        return state;
    }
};