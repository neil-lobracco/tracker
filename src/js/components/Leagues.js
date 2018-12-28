import React from 'react';
import { connect } from 'react-redux';
import LeagueSelector from "./LeagueSelector";
import LeagueForm from "./LeagueForm";

export default connect(state => ({canCreateLeague: !!state.userContext.currentUser}))(function({canCreateLeague, location, history}){
    return (
        <div className='leagues'>
            <div className='columns'>
                <div className='column is-two-thirds'>
                    <LeagueSelector location={location} history={history}/>
                </div>
                {canCreateLeague && <div className='column is-one-third'>
                    <h2>Start a new league</h2>
                    <LeagueForm/>
                </div>}
            </div>
        </div>);
});