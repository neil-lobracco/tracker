import React from "react";
import {HashRouter, Route, NavLink, Switch, Redirect} from 'react-router-dom';
import Players from "./Players";
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
		<Route path='/players' component={Players}/>
		<Route path='/matches' component={Matches}/>
	</Switch>
  </div>
);
const App = () => (
  <HashRouter>
  	<Container/>
  </HashRouter>
);
export default App;
