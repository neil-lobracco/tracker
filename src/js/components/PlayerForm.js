import React, { Component } from "react";
import { connect } from "react-redux";
import uuidv1 from "uuid";
import { addPlayer } from "../actions/index";

const mapDispatchToProps = dispatch => {
  return {
    addPlayer: player => dispatch(addPlayer(player))
  };
};

class ConnectedForm extends Component {
  constructor() {
    super();

    this.state = {
      name : '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.id]: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { name } = this.state;
    const id = uuidv1();
    this.props.addPlayer({ name, id });
    this.setState({ name: "" });
  }

  render() {
    const { name } = this.state;
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
        <button type="submit" className="button is-primary">
          SAVE
        </button>
      </form>
    );
  }
}

const Form = connect(null, mapDispatchToProps)(ConnectedForm);

export default Form;
