import React from "react";
import {BrowserRouter as Router, Route, NavLink, Switch, Redirect} from 'react-router-dom';
import Players from "./Players";
import PlayerDetail from "./PlayerDetail";
import Matches from "./Matches";
import 'bulma/css/bulma.css';
import '../../main.css';
const Container = () => (
  <div className='container'>
  	<div className='tabs is-large is-boxed'>
  		<ul>
  			<li><NavLink to='/players' activeClassName='is-active'>Players</NavLink></li>
  			<li><NavLink to='/matches' activeClassName='is-active'>Matches</NavLink></li>
  		</ul>
  	</div>
  	<Switch>
	  	<Redirect exact from="/" to="/players"/>
		<Route exact path='/players' component={Players}/>
		<Route path='/players/:playerId' component={PlayerDetail}/>
		<Route path='/matches' component={Matches}/>
	</Switch>
  </div>
);
const App = () => (
  <Router>
  	<Container/>
  </Router>
);
export default App;
