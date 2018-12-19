import React from 'react';
import MatchForm from './MatchForm';
import MatchList from './MatchList';
import { connect } from "react-redux";
const mapStateToProps = state => ({ loggedIn : !!state.user });
export default connect(mapStateToProps)(({loggedIn}) => (
	<div className='matches'>
		<div className='columns'>
			<div className='column is-two-thirds'>
				<MatchList/>
			</div>
			{loggedIn && <div className='column is-one-third'>
				<h2>Record a match</h2>
				<MatchForm/>
			</div>}
		</div>
	</div>
));