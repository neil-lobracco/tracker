import React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = (state) => ({ isLoading: state.loading.numPending > 0 });

const LoadingWidget = ({isLoading}) => {
    if (isLoading) {
        return (<div className='loader'>Loading...</div>);
    } else {
        return null;
    }
};

export default connect(mapStateToProps)(LoadingWidget);
