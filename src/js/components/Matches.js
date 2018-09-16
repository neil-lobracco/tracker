import React from 'react';
import MatchForm from './MatchForm';
import MatchList from './MatchList';
export default () => (
	<div className='matches'>
		<div className='columns'>
			<div className='column is-two-thirds'>
				<MatchList/>
			</div>
			<div className='column is-one-third'>
				<h2>Record a match</h2>
				<MatchForm/>
			</div>
		</div>
	</div>
);