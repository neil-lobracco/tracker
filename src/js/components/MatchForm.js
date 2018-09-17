import React, { Component } from "react";
import { connect } from "react-redux";
import { createMatch } from "../actions/index";

const initialState = {
    contestants: [],
    winner: null,
    comment: null,
};

const getScores = winner => {
  switch (winner) {
    case 'player1':
      return [1,0];
    case 'player2':
      return [0,1];
    case 'draw':
      return [0.5, 0.5];
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createMatch: match => dispatch(createMatch(match))
  };
};

const mapStateToProps = state => {
  return { players: state.players };
};

class ConnectedForm extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  handleSubmit(event) {
    event.preventDefault();

    const scores = getScores(this.state.winner);
    this.props.createMatch({
      player1_id: this.state.contestants[0].id,
      player2_id: this.state.contestants[1].id,
      player1_score: scores[0],
      player2_score: scores[1],
      comment: this.state.comment,
    });
    this.setState(initialState);
  }

  playersSelected(event) {
    const contestants = [].slice.call(event.target.selectedOptions).map(o =>
      this.props.players.find(p => p.id == parseInt(o.value))
    );
    this.setState({contestants});
  }

  setComment(event) {
    let comment = event.target.value;
    if (!comment || comment.trim() == '') { comment = null; }
    this.setState({ comment });
  }

  canSubmit() {
    return this.state.contestants.length == 2 && this.state.winner != null;
  }

  winnerSelected(event) {
    this.setState({winner: event.target.value});
  }

  render() {
    const {contestants, winner } = this.state;
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <div className='columns'>
          <div className="select is-multiple column">
            <select multiple id="players" onChange={this.playersSelected.bind(this)}>
            {this.props.players.map(player => (
              <option key={player.id} value={player.id}>{player.name}</option>
            ))}
            </select>
          </div>
          <div className='column'>
            <label>Select the two contestants (Command or Ctrl-click to select multiple)</label>
          </div>
        </div>
        { contestants.length == 2 && 
          <div className="control">
            <label>Winner: </label>
            <label className="radio">
              <input type="radio" name="winner" value="player1" checked={winner == "player1"} onChange={this.winnerSelected.bind(this)}/>
              {contestants[0].name}
            </label>
            <label className="radio">
              <input type="radio" name="winner" value="player2" checked={winner == "player2"} onChange={this.winnerSelected.bind(this)}/>
              {contestants[1].name}
            </label>
            <label className="radio">
              <input type="radio" name="winner" value="draw" checked={winner == "draw"} onChange={this.winnerSelected.bind(this)}/>
              Draw            
            </label>
          </div>
        }
        <div className='control'>
          <input className='input' name='comment' placeholder='Match comments' onChange={this.setComment.bind(this)}/>
        </div>
        <button type="submit" className="button is-primary" disabled={!this.canSubmit()}>
          SAVE
        </button>
      </form>
    );
  }
}

const Form = connect(mapStateToProps, mapDispatchToProps)(ConnectedForm);

export default Form;
