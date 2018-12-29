import React from 'react';
import { connect } from 'react-redux';
import { googleAuth, signOut } from '../actions';
import {GoogleLogin, GoogleLogout} from 'react-google-login';

const failedLogin = (response) => {
    console.warn(response.error);
};
const mapDispatchToProps = dispatch => {
  return {
    googleAuth: (json) => dispatch(googleAuth(json.tokenId)),
    signOut: () => dispatch(signOut()),
  };
};

const LoginLogoutButton = connect(state => ({user: state.userContext.currentUser}), mapDispatchToProps)(({user, googleAuth, signOut}) => {
    if (user) {
        return (
            <GoogleLogout
                buttonText="Logout"
                onLogoutSuccess={signOut}/>);
    } else {
        return (                
            <GoogleLogin
                clientId='985074612801-rir5ouc3r4e7kaq6u25j1c12bko24rqq.apps.googleusercontent.com'
                buttonText='Login with Google'
                onSuccess={googleAuth}
                onFailure={failedLogin}/>);
    }
});

const CurrentUserName = connect(state => ({user : state.userContext.currentUser }))(({user}) => {
    if (user) {
        return user.name;
    } else { 
        return 'Not logged in.';
    }
});


const AuthWidget = () => (
    <div className="navbar-item has-dropdown is-hoverable">
        <a className="navbar-link">
            <CurrentUserName/>
        </a>
        <div className="navbar-dropdown">
            <LoginLogoutButton/>
        </div>
    </div>);
export default AuthWidget;
