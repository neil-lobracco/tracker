import React from 'react';
import { connect } from 'react-redux';
import { googleAuth, signOut } from '../actions';
import {GoogleLogin, GoogleLogout} from 'react-google-login';

const mapDispatchToProps = dispatch => {
  return {
    googleAuth: (token) => dispatch(googleAuth(token)),
    signOut: () => dispatch(signOut()),
  };
};

const mapStateToProps = (state) => ({ user: state.userContext.currentUser });

class AuthWidget extends React.Component {
    successfulLogin(response) {
        this.props.googleAuth(response.tokenId);
    }
    failedLogin(response) {
        console.warn(response.error);
    }
    logout() {
        this.props.signOut();
    }
	render() {
        if (this.props.user) {
            return (<div className='auth-widget logged-in'>
                <span>Logged in as {this.props.user.name}.</span>
                <GoogleLogout
                    buttonText="Logout"
                    onLogoutSuccess={this.logout.bind(this)}/>
                </div>);
        } else {
           return (
            <div className='auth-widget signed-out'>
                <GoogleLogin
                    clientId='985074612801-rir5ouc3r4e7kaq6u25j1c12bko24rqq.apps.googleusercontent.com'
                    buttonText='Login with Google'
                    onSuccess={this.successfulLogin.bind(this)}
                    onFailure={this.failedLogin.bind(this)}
                />
            </div>);
        }
	}
}
export default connect(mapStateToProps, mapDispatchToProps)(AuthWidget);
