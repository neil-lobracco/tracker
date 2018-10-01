import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from "redux";
import { setLeague, loadLeagues } from "../actions";
import rootReducer from "../reducers/index";
const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));
const defaultLeagueId = window.localStorage.getItem('leagueId');
store.dispatch(loadLeagues());
if (defaultLeagueId) {
	store.dispatch(setLeague(defaultLeagueId));
}
export default store;
