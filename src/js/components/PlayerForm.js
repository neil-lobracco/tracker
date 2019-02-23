import React, { useState } from "react";
import { connect } from "react-redux";
import { createPlayer } from "../actions/index";
import FormField from "./FormField";

const initialState = {
    name : '',
    elo : 1500,
};

const Form = ({ createPlayer }) => {
  const [state, setState] = useState(initialState);
  const { name, elo } = state;
  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.value });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    createPlayer({ name, elo: parseInt(elo) });
    setState(initialState);
  };
  return (
    <form onSubmit={handleSubmit}>
      <FormField description="Name">
        <input
          type="text"
          className="input is-primary"
          name="name"
          placeholder="Enter the player's name"
          value={name}
          onChange={handleChange}
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
            onChange={handleChange}
          />
      </FormField>
      <button type="submit" className="button is-primary">
        Create Player
      </button>
    </form>
  );
}

const mapDispatchToProps = dispatch => {
  return {
    createPlayer: (player) => dispatch(createPlayer(player))
  };
};

const PlayerForm = connect(null, mapDispatchToProps)(Form);

export default PlayerForm;
