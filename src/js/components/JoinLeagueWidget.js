import React from 'react';
import { connect } from 'react-redux';
import { joinLeague } from '../actions';

const mapDispatchToProps = dispatch => {
  return {
    joinLeague: (leagueId) => dispatch(joinLeague(leagueId)),
  };
};

const mapStateToProps = (state) => ({ leagues: state.leagues.all, leagueId: state.leagues.current,
	 user: state.userContext.currentUser, currentLeagueMembership: state.leagues.currentMembership });

class JoinLeagueWidget extends React.Component {
	showWidget() {
		return this.props.leagues != null && this.props.leagueId && this.props.user && !this.props.currentLeagueMembership;
	}
	joinLeague() {
        this.props.joinLeague(this.props.leagueId);
	}
	render() {
		if (this.showWidget()) {
			return (
				<div className='join-league' onClick={this.joinLeague.bind(this)}>
					Join this league
				</div>);
		} else { return null; }
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(JoinLeagueWidget);
