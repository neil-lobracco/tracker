import React, { Component } from "react";
import { connect } from "react-redux";
import { createPlayer } from "../actions/index";



const initialState = {
    name : '',
    elo : 1500,
};

const mapDispatchToProps = dispatch => {
  return {
    createPlayer: player => dispatch(createPlayer(player))
  };
};

class ConnectedForm extends Component {
  constructor() {
    super();

    this.state = initialState;

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.id]: event.target.value });
  }

  setELO(event) {
    this.setState({ elo: parseFloat(event.target.value) });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { name, elo } = this.state;
    this.props.createPlayer({ name, elo });
    this.setState(initialState);
  }

  render() {
    const { name, elo } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="field">
          <label htmlFor="name" className="label">Name</label>
          <input
            type="text"
            className="input is-primary"
            id="name"
            placeholder="Enter the player's name"
            value={name}
            onChange={this.handleChange}
          />
        </div>
        <div className="field">        
          <label htmlFor="elo" className="label">Initial ELO</label>
          <input
            type="number"
            className="input is-primary"
            id="elo"
            placeholder="Enter the player's starting ELO score"
            value={elo}
            onChange={this.setELO}
          />
        </div>
        <button type="submit" className="button is-primary">
          SAVE
        </button>
      </form>
    );
  }
}

const Form = connect(null, mapDispatchToProps)(ConnectedForm);

export default Form;
