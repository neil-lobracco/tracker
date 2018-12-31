import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { setLeague } from '../actions';

const SelectableLeague = withRouter(
	({location, history, league, current, setLeague}) => {
		return(
			<li key={league.id} className={`league ${league.id == current ? 'current':''}`}>
				<span onClick={() => setLeague(league.id, current, location, history)}>{league.name}</span></li>
		);
	}
);

const mapDispatchToProps = dispatch => {
  return {
    setLeague: (leagueId, current, location, history) => {
			if (leagueId == current) { return; }
			dispatch(setLeague(leagueId));
			const locState = location.state;
			if (locState && locState.from) {
				history.push(locState.from);
			}
		},
  };
};

const mapStateToProps = (state) => ({ leagues: state.leagues.all, leagueId: state.leagues.current });

const LeagueList = connect(mapStateToProps, mapDispatchToProps)(({ leagues, leagueId, setLeague}) => {
	return (
		<ul className='league-list'>
			{(leagues || []).map(league => <SelectableLeague key={league.id} league={league} current={leagueId} setLeague={setLeague}/>)}
		</ul>);
});

const LeagueSelector = () => (
	<div className='league-selector'>
		<h2 className='subtitle'>Select a league</h2>
		<br/>
		<LeagueList/>
	</div>
);
export default LeagueSelector;
