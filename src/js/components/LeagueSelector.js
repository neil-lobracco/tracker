import React from 'react';
import { connect } from 'react-redux';
import { loadLeagues, setLeague } from '../actions';

const mapDispatchToProps = dispatch => {
  return {
    setLeague: (leagueId) => dispatch(setLeague(leagueId)),
    loadLeagues: () => dispatch(loadLeagues()),
  };
};

const mapStateToProps = (state) => ({ leagues: state.leagues, leagueId: state.leagueId });

class LeagueSelector extends React.Component {
	leaguesLoaded() {
		return this.props.leagues != null;
	}
	selectLeague(leagueId) {
		this.props.setLeague(leagueId);
		const locState = this.props.location.state;
		if (locState && locState.from) {
			this.props.history.push(locState.from);
		}
	}
	render() {
		if (this.leaguesLoaded()) {
			return (
				<div className='league-selector'>
					<h2 className='subtitle'>Select a league</h2>
					<br/>
					<ul className='league-list'>
						{this.props.leagues.map(league => {
							return <li key={league.id} className={`league ${league.id == this.props.leagueId ? 'current':''}`}
							><span onClick={this.selectLeague.bind(this, league.id)}>{league.name}</span></li>;
						})}
					</ul>
				</div>);
		} else {
			return <div>Loading leagues...</div>;
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(LeagueSelector);
