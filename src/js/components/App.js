import React from "react";
import {BrowserRouter as Router, Route, NavLink, Switch, Redirect} from 'react-router-dom';
import Players from "./Players";
import PlayerDetail from "./PlayerDetail";
import Dashboard from "./Dashboard";
import Matches from "./Matches";
import 'bulma/css/bulma.css';
import '../../main.css';
const Container = () => (
  <div className='container'>
  	<div className='tabs is-large is-boxed'>
  		<ul>
        <li><NavLink exact to='/' activeClassName='is-active'>Overview</NavLink></li>
  			<li><NavLink to='/players' activeClassName='is-active'>Players</NavLink></li>
  			<li><NavLink to='/matches' activeClassName='is-active'>Matches</NavLink></li>
  		</ul>
  	</div>
  	<Switch>
  		<Route exact path='/players' component={Players}/>
  		<Route path='/players/:playerId' component={PlayerDetail}/>
  		<Route path='/matches' component={Matches}/>
      <Route exact path='/' component={Dashboard}/>
	  </Switch>
  </div>
);
const App = () => (
  <Router>
  	<Container/>
  </Router>
);
export default App;
