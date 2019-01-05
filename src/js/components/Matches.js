import React from 'react';
import MatchForm from './MatchForm';
import MatchList from './MatchList';
import { connect } from "react-redux";
const mapStateToProps = state => ({ canCreateMatch : state.leagues.currentMembership && state.leagues.currentMembership.role == 'admin', currentlyEditing: state.matches.currentlyEditing });
export default connect(mapStateToProps)(({canCreateMatch, currentlyEditing}) => (
	<div className='matches'>
		<div className='columns'>
			<div className='column is-two-thirds'>
				<MatchList/>
			</div>
			{canCreateMatch && <div className='column is-one-third'>
				<h2>{currentlyEditing ? 'Edit match' : 'Record a match'}</h2>
				<MatchForm currentlyEditing={currentlyEditing} key={currentlyEditing ? currentlyEditing.id : 'fresh'}/>
			</div>}
		</div>
	</div>
));