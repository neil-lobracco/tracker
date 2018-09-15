import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from "redux";
import { loadPlayers } from "../actions";
import rootReducer from "../reducers/index";
const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));
store.dispatch(loadPlayers());
export default store;
