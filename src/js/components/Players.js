import React from 'react';
import PlayerForm from './PlayerForm';
import PlayerList from './PlayerList';
import { connect } from "react-redux";
const mapStateToProps = state => ({ loggedIn : !!state.user });
export default connect(mapStateToProps)(({loggedIn}) => (
	<div className='players'>
		<div className='columns'>
			<div className='column is-two-thirds'>
				<PlayerList/>
			</div>
			{loggedIn && <div className='column is-one-third'>
				<h2>Add new player to the roster</h2>
				<PlayerForm/>
			</div>}
		</div>
	</div>
));