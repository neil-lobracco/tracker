import React from "react";
import {BrowserRouter as Router, Route, NavLink, Switch, Redirect} from 'react-router-dom';
import LeagueRequiredRoute from './LeagueRequiredRoute';
import Players from "./Players";
import PlayerDetail from "./PlayerDetail";
import Dashboard from "./Dashboard";
import Matches from "./Matches";
import LeagueSelector from "./LeagueSelector";
import LeagueWidget from "./LeagueWidget";
import JoinLeagueWidget from "./JoinLeagueWidget";
import AuthWidget from "./AuthWidget";
import 'bulma/css/bulma.css';
import '../../main.css';

const Container = () => (
  <div className='container'>
		<JoinLeagueWidget/>
    <LeagueWidget/>
		<AuthWidget/>
  	<div className='tabs is-large is-boxed'>
  		<ul>
        <li><NavLink exact to='/' activeClassName='is-active'>Overview</NavLink></li>
  			<li><NavLink to='/players' activeClassName='is-active'>Players</NavLink></li>
  			<li><NavLink to='/matches' activeClassName='is-active'>Matches</NavLink></li>
  		</ul>
  	</div>
  	<Switch>
  		<LeagueRequiredRoute exact path='/players' component={Players}/>
  		<LeagueRequiredRoute path='/players/:playerId' component={PlayerDetail}/>
  		<LeagueRequiredRoute path='/matches' component={Matches}/>
      <LeagueRequiredRoute exact path='/' component={Dashboard}/>
      <Route path='/leagues' component={LeagueSelector}/>
	  </Switch>
  </div>
);
const App = () => (
  <Router>
  	<Container/>
  </Router>
);
export default App;
