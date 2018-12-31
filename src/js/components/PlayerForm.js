import React, { Component } from "react";
import { connect } from "react-redux";
import { createPlayer } from "../actions/index";
import FormField from "./FormField";

const initialState = {
    name : '',
    elo : 1500,
};

class Form extends Component {
  constructor() {
    super();
    this.state = initialState;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.createPlayer({ name: this.state.name, elo: parseInt(this.state.elo) });
    this.setState(initialState);
  }

  render() {
    const { name, elo } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <FormField description="Name">
          <input
            type="text"
            className="input is-primary"
            name="name"
            placeholder="Enter the player's name"
            value={name}
            onChange={this.handleChange}
          />
        </FormField>
        <FormField description="Initial Elo">
          <input
              type="number"
              className="input is-primary"
              name="elo"
              placeholder="Enter the player's starting Elo score"
              value={elo}
              disabled='disabled'
              onChange={this.handleChange}
            />
        </FormField>
        <button type="submit" className="button is-primary">
          Create Player
        </button>
      </form>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createPlayer: (player) => dispatch(createPlayer(player))
  };
};

const PlayerForm = connect(null, mapDispatchToProps)(Form);

export default PlayerForm;
