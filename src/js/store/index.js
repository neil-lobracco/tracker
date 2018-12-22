import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from "redux";
import { setLeague, loadLeagues, loadUserContext } from "../actions";
import rootReducer from "../reducers/index";
const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));
const defaultLeagueId = window.localStorage.getItem('leagueId');
store.dispatch(loadLeagues());
store.dispatch(loadUserContext());
if (defaultLeagueId) {
	store.dispatch(setLeague(Number(defaultLeagueId)));
}
export default store;
