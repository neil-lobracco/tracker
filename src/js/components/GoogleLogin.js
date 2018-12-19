import React from 'react';
import { connect } from 'react-redux';
import { googleAuth } from '../actions';
import {GoogleLogin as GoogleLoginInternal} from 'react-google-login';

const mapDispatchToProps = dispatch => {
  return {
    googleAuth: (token) => dispatch(googleAuth(token)),
  };
};

const mapStateToProps = (state) => ({ user: state.user });

class GoogleLogin extends React.Component {
    successfulLogin(response) {
        this.props.googleAuth(response.tokenId);
    }
    failedLogin(response) {
        console.warn(response.error);
    }
	render() {
        if (this.props.user) {
            return <div>Already logged in as {this.props.user.name}.</div>;
        } else {
           return (
            <GoogleLoginInternal
                clientId='985074612801-rir5ouc3r4e7kaq6u25j1c12bko24rqq.apps.googleusercontent.com'
                buttonText='Login with Google'
                onSuccess={this.successfulLogin.bind(this)}
                onFailure={this.failedLogin.bind(this)}
            />);
        }
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(GoogleLogin);
