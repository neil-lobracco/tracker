import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from "redux";
import { loadPlayers, loadMatches } from "../actions";
import rootReducer from "../reducers/index";
const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));
store.dispatch(loadPlayers());
store.dispatch(loadMatches());
export default store;
