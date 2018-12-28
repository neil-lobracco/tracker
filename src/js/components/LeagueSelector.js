import React from 'react';
import { connect } from 'react-redux';
import { setLeague } from '../actions';

const mapDispatchToProps = dispatch => {
  return {
    setLeague: (leagueId) => dispatch(setLeague(leagueId)),
  };
};

const mapStateToProps = (state) => ({ leagues: state.leagues.all, leagueId: state.leagues.current });

class LeagueSelector extends React.Component {
	leaguesLoaded() {
		return this.props.leagues != null;
	}
	selectLeague(leagueId) {
		if (leagueId == this.props.leagueId) { return; }
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
