import React, { Component } from "react";
import { connect } from "react-redux";
import { createMatch } from "../actions/index";

const OpponentSelector = ({onChange, opponentId, opponents}) => {
  return (
    <div className="select">
      <select onChange={onChange} value={opponentId || 'selectone'}>
        <option key='selectone' value='selectone' disabled='disabled'>Select opponent</option>
      {(opponents || []).map(player => (
        <option key={player.id} value={player.id}>{player.name}</option>
      ))}
      </select>
    </div>);
};

const WinnerSelector = ({opponent, onChange, winner}) => {
  if (opponent == null) { return null; }
  return (
    <div className="control">
      <label className="radio">Winner: </label>
      <label className="radio">
        <input type="radio" name="winner" value="player1" checked={winner == "player1"} onChange={onChange}/>
        Me
      </label>
      <label className="radio">
        <input type="radio" name="winner" value="player2" checked={winner == "player2"} onChange={onChange}/>
        {opponent}
      </label>
      <label className="radio">
        <input type="radio" name="winner" value="draw" checked={winner == "draw"} onChange={onChange}/>
        Draw            
      </label>
    </div>);
};

const ScoreSelector = ({score, onChange}) => (
  <div className='field'>
    <label className='label'>Score (optional)</label>
    <div className='control'>
      <input className='input' name='score' placeholder='5-3' onChange={onChange} value={score}/>
    </div>
  </div>);

const CommentBox= ({comment, onChange}) => (
  <div className='field'>
    <label className='label'>Comments (optional)</label>
    <div className='control'>
      <input className='input' name='comment' placeholder='A well fought match' onChange={onChange} value={comment}/>
    </div>
  </div>);

const initialState = {
    opponentId: null,
    winner: null,
    comment: '',
    score: '',
};

const mapDispatchToProps = dispatch => {
  return {
    createMatch: (match) => dispatch(createMatch(match))
  };
};

const mapStateToProps = state => {
  return { players: state.players, user: state.userContext.currentUser };
};

class ConnectedForm extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  handleSubmit(event) {
    event.preventDefault();

    const scores = this.getScores();
    this.props.createMatch({
      player1_id: this.props.user.id,
      player2_id: this.state.opponentId,
      player1_score: scores[0],
      player2_score: scores[1],
      comment: this.state.comment == '' ? null : this.state.comment,
    });
    this.setState({ winner: null, comment: '', score: ''});
  }

  opponentSelected(event) {
    this.setState({opponentId: parseInt(event.target.value)});
  }

  setComment(event) {
    this.setState({ comment : event.target.value });
  }

  getScores() {
    const { winner, score } = this.state;
    if (winner == null) { return null; }
    if (score == '') {
      switch (winner) {
        case 'player1':
          return [1,0];
        case 'player2':
          return [0,1];
        case 'draw':
          return [0.5, 0.5];
      }
    }
    const matchRes = score.match(/(\d+)-(\d+)/);
    if (matchRes == null) { return null; }
    const results = matchRes.slice(1).map(r => parseInt(r));
    if (isNaN(results[0] || isNaN(results[1]))) { return null; }
    if ((winner == 'draw') != (results[0] == results[1])) { return null; }
    return results.sort((s1,s2) => winner == 'player1' ? s2 - s1 : s1 - s2);
  }

  setScore(event) {
    this.setState({ score: event.target.value });
  }

  canSubmit() {
    return this.state.opponentId != null && this.getScores() != null;
  }

  winnerSelected(event) {
    this.setState({winner: event.target.value});
  }

  render() {
    const {opponentId, winner, score, comment } = this.state;
    const { players, user } = this.props;
    const opponent = (opponentId && players.find(p => p.id == opponentId));
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <OpponentSelector onChange={this.opponentSelected.bind(this)} opponentId={opponentId} opponents={(players || []).filter(p => p.id != user.id)} />
        <WinnerSelector winner={winner} onChange={this.winnerSelected.bind(this)} opponent={opponent && opponent.name} />
        <ScoreSelector score={score} onChange={this.setScore.bind(this)} />
        <CommentBox onChange={this.setComment.bind(this)} comment={comment} />
        <button type="submit" className="button is-primary" disabled={!this.canSubmit()}>
          SAVE
        </button>
      </form>
    );
  }
}

const Form = connect(mapStateToProps, mapDispatchToProps)(ConnectedForm);

export default Form;
