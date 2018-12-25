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
    getNavbarText() {
        if (this.props.user) {
            return this.props.user.name;
        } else { 
            return 'Not logged in.';
        }
    }
    getNavbarContents() {
        if (this.props.user) {
            return (
                <GoogleLogout
                    buttonText="Logout"
                    onLogoutSuccess={this.logout.bind(this)}/>);
        } else {
            return (                
            <GoogleLogin
                clientId='985074612801-rir5ouc3r4e7kaq6u25j1c12bko24rqq.apps.googleusercontent.com'
                buttonText='Login with Google'
                onSuccess={this.successfulLogin.bind(this)}
                onFailure={this.failedLogin.bind(this)}/>);
        }
    }
	render() {
        return (
            <div className="navbar-item has-dropdown is-hoverable">
                <a className="navbar-link">
                    {this.getNavbarText()}
                </a>
                <div className="navbar-dropdown">
                    {this.getNavbarContents()}
                </div>
            </div>
        );
	}
}
export default connect(mapStateToProps, mapDispatchToProps)(AuthWidget);
