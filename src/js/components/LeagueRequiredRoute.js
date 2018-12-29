import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

const LeagueRequiredRoute = ({ component: Component, ...rest } ) => {
  return (
    <Route {...rest} component={connect(state => ({leagueId: state.leagues.current}))( props =>
    {
    return props.leagueId != null ? (
      <Component {...props} />
    ) : (
      <Redirect
        to={{
          pathname: "/leagues",
          state: { from: props.location }
        }} />) ;
    }
  )}/>);
};

export default LeagueRequiredRoute;