import React from "react";
import {BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LeagueRequiredRoute from './LeagueRequiredRoute';
import Players from "./Players";
import PlayerDetail from "./PlayerDetail";
import Dashboard from "./Dashboard";
import Matches from "./Matches";
import Leagues from "./Leagues";
import JoinLeagueWidget from "./JoinLeagueWidget";
import AppContainer from "./AppContainer";
import NavBar from "./NavBar";
import 'bulma/css/bulma.css';
import '../../main.css';

const Container = () => (
  <AppContainer>
		<JoinLeagueWidget/>
		<NavBar/>
  	<Switch>
  		<LeagueRequiredRoute exact path='/players' component={Players}/>
  		<LeagueRequiredRoute path='/players/:playerId' component={PlayerDetail}/>
  		<LeagueRequiredRoute path='/matches' component={Matches}/>
      <LeagueRequiredRoute exact path='/' component={Dashboard}/>
      <Route path='/leagues' component={Leagues}/>
	  </Switch>
	</AppContainer>
);
const App = () => (
  <Router>
  	<Container/>
  </Router>
);
export default App;
