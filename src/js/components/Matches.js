import React from 'react';
import MatchForm from './MatchForm';
import MatchList from './MatchList';
import { connect } from "react-redux";
const mapStateToProps = state => ({ canCreateMatch : state.leagues.currentMembership && state.leagues.currentMembership.role == 'admin' });
export default connect(mapStateToProps)(({canCreateMatch}) => (
	<div className='matches'>
		<div className='columns'>
			<div className='column is-two-thirds'>
				<MatchList/>
			</div>
			{canCreateMatch && <div className='column is-one-third'>
				<h2>Record a match</h2>
				<MatchForm/>
			</div>}
		</div>
	</div>
));