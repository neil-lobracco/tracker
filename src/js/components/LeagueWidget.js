import React from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';

class LeagueWidget extends React.Component {
	leagueInfo() {
		if (this.props.leagues != null) {
			const league = this.props.leagues.find(l => l.id == this.props.leagueId);
			if (league != null) {
				return <span>Current League: {league.name}</span>;
			}
		}
	}
	render() {
        return (
            <div className="navbar-item has-dropdown is-hoverable">
                <a className="navbar-link">
                    {this.leagueInfo()}
                </a>
                <div className="navbar-dropdown">
					<NavLink to={{ pathname: "/leagues", state: { from: window.location.pathname }}}
     activeClassName='hidden'>Change League</NavLink>
                </div>
            </div>
        );
	}
}
export default connect(state => ({leagueId : state.leagues.current, leagues: state.leagues.all}))(LeagueWidget);
