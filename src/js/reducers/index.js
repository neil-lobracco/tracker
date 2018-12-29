import { combineReducers } from 'redux';
import players from './players';
import matches from './matches';
import leagues from './leagues';
import eloEntries from './elo-entries';
import userContext from './user-context';
import loading from './loading';
import sports from './sports';

const rootReducer = combineReducers({
  players,
  matches,
  userContext,
  eloEntries,
  leagues,
  loading,
  sports,
});

export default rootReducer;
