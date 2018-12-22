import React from 'react';
import PlayerForm from './PlayerForm';
import PlayerList from './PlayerList';
import { connect } from "react-redux";
const mapStateToProps = state => ({ canCreatePlayer : state.currentLeagueMembership && state.currentLeagueMembership.role == 'admin' });
export default connect(mapStateToProps)(({canCreatePlayer}) => (
	<div className='players'>
		<div className='columns'>
			<div className='column is-two-thirds'>
				<PlayerList/>
			</div>
			{canCreatePlayer && <div className='column is-one-third'>
				<h2>Add new player to the roster</h2>
				<PlayerForm/>
			</div>}
		</div>
	</div>
));