import React from 'react';
import { connect } from 'react-redux';
import { joinLeague } from '../actions';

const mapDispatchToProps = dispatch => {
  return { joinLeague: (leagueId) => dispatch(joinLeague(leagueId)) };
};
const mapStateToProps = (state) => ({ leagues: state.leagues, user: state.userContext.currentUser });

const JoinLeagueWidget = connect(mapStateToProps, mapDispatchToProps)(({joinLeague, leagues, user}) => {
	if (leagues.all != null && leagues.current && user && !leagues.currentMembership) {
		return (
			<div className='join-league' onClick={() => joinLeague(leagues.current)}>
				Join this league
			</div>);
	} else { return null; }
});
export default JoinLeagueWidget;