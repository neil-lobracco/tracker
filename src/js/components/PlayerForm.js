import React, { Component } from "react";
import { connect } from "react-redux";
import { createPlayer } from "../actions/index";

const initialState = {
    name : '',
    elo : 1500,
    code: '',
};

const mapDispatchToProps = dispatch => {
  return {
    createPlayer: (player, code) => dispatch(createPlayer(player, code))
  };
};

class ConnectedForm extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  handleChange(event) {
    this.setState({ [event.target.id]: event.target.value });
  }

  setELO(event) {
    this.setState({ elo: parseFloat(event.target.value) });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { name, elo, code } = this.state;
    this.props.createPlayer({ name, elo }, code);
    this.setState(initialState);
  }

  render() {
    const { name, elo, code } = this.state;
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <div className="field">
          <label htmlFor="name" className="label">Name</label>
          <input
            type="text"
            className="input is-primary"
            id="name"
            placeholder="Enter the player's name"
            value={name}
            onChange={this.handleChange.bind(this)}
          />
        </div>
        <div className="field">        
          <label htmlFor="elo" className="label">Initial Elo</label>
          <input
            type="number"
            className="input is-primary"
            id="elo"
            placeholder="Enter the player's starting Elo score"
            value={elo}
            disabled='disabled'
            onChange={this.setELO.bind(this)}
          />
        </div>
        <div className="field">
          <label htmlFor="code" className="label">Access Code</label>
          <input type="password" className="input is-primary" id="code" placeholder="Access code provided to you by an administrator"
            value={code} onChange={this.handleChange.bind(this)} required='required' />
        </div>
        <button type="submit" className="button is-primary">
          Create Player
        </button>
      </form>
    );
  }
}

const Form = connect(null, mapDispatchToProps)(ConnectedForm);

export default Form;
