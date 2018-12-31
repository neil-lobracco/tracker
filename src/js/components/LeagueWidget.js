import React from 'react';
import { NavLink } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';

const mapStateToProps = state => ({ all: state.leagues.all, current: state.leagues.current });
const CurrentLeague = connect(mapStateToProps)(({all, current}) => {
	if (all != null) {
		const league = all.find(l => l.id == current);
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
const LeagueWidget = React.memo(() => {
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
});
export default LeagueWidget;