import React from 'react';
import { NavLink } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';

const CurrentLeague = connect(state => ({leagues: state.leagues}))(({leagues}) => {
	if (leagues.all != null) {
		const league = leagues.all.find(l => l.id == leagues.current);
		if (league != null) {
			return <span>Current League: {league.name}</span>;
		}
	}
	return null;
});
const ChangeLeagueLink = withRouter(({location}) => (
	<NavLink to={{ pathname: "/leagues", state: { from: location.pathname }}}
		activeClassName='hidden'>Change League
	</NavLink>)
);
const LeagueWidget = () => {
	return (
		<div className="navbar-item has-dropdown is-hoverable">
			<a className="navbar-link">
				<CurrentLeague/>
			</a>
			<div className="navbar-dropdown">
				<ChangeLeagueLink/>
			</div>
		</div>
	);
};
export default LeagueWidget;