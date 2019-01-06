import React, { Component } from "react";
import { connect } from "react-redux";
import { createMatch, updateMatch, setEditingMatch } from "../actions/matches";
import FormField from './FormField';
import Loadable from 'react-loadable';
import "react-datepicker/dist/react-datepicker.css";

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
  <FormField description='Score (optional)'>
    <input className='input' name='score' placeholder='5-3' onChange={onChange} value={score}/>
  </FormField>);

const CommentBox= ({comment, onChange}) => (
  <FormField description='Comments (optional)'>
    <input className='input' name='comment' placeholder='A well fought match' onChange={onChange} value={comment}/>
  </FormField>);

const LoadableDatePicker = Loadable({
  loading: () => <div>Loading...</div>,
  loader: () => import( /* webpackPrefetch: true */ 'react-datepicker'),
});

const DatetimeChooser = ({time, onChange}) => (
  <FormField description='Match time'>
    <div>
      <LoadableDatePicker 
          selected={time ? new Date(time) : null} 
          onChange={onChange} 
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="yyyy-MM-dd h:mm aa"
          placeholderText="Use default"
          timeCaption="Time"/>
    </div>
  </FormField>
);

const initialState = {
    opponentId: null,
    winner: null,
    comment: '',
    score: '',
    time: null,
};

const mapDispatchToProps = dispatch => {
  return {
    createMatch: (match) => dispatch(createMatch(match)),
    updateMatch: (match) => dispatch(updateMatch(match)),
    cancelEditing: () => dispatch(setEditingMatch(null)),
  };
};

const mapStateToProps = state => {
  return { players: state.players, user: state.userContext.currentUser };
};

const getMatchScore = (match) => {
  if (match.player1_score + match.player2_score != 1) {
    return [match.player1_score, match.player2_score].sort().reverse().join('-');
  } else return '';
};

class ConnectedForm extends Component {
  constructor(props) {
    super(props);
    this.state = {...initialState};
    const m = props.currentlyEditing;
    if (m) {
      this.state.opponentId = m.player1_id == props.user.id ? m.player2_id : m.player1_id;
      this.state.winner = m.player1_score == m.player2_score ? 'draw' : m.player1_score > m.player2_score ? 'player1' : 'player2';
      this.state.comment = m.comment || '';
      this.state.score = getMatchScore(m);
      this.state.time = m.created_at;
    }
    this.opponentSelected = this.opponentSelected.bind(this);
    this.setComment = this.setComment.bind(this);
    this.setScore = this.setScore.bind(this);
    this.setTime = this.setTime.bind(this);
    this.winnerSelected = this.winnerSelected.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    const scores = this.getScores();
    const match = {
      player1_id: this.props.user.id,
      player2_id: this.state.opponentId,
      player1_score: scores[0],
      player2_score: scores[1],
      comment: this.state.comment == '' ? null : this.state.comment,
      created_at: this.state.time,
    };
    if (this.props.currentlyEditing) {
      this.props.updateMatch({ ...match, id: this.props.currentlyEditing.id });
      this.props.cancelEditing();
    } else {
      this.props.createMatch(match);
    }
    this.setState({ winner: null, comment: '', score: ''});
  }

  opponentSelected(event) {
    this.setState({opponentId: parseInt(event.target.value)});
  }

  setComment(event) {
    this.setState({ comment : event.target.value });
  }

  setTime(time) {
    this.setState({ time });
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
    const {opponentId, winner, score, comment, time } = this.state;
    const { players, user, currentlyEditing, cancelEditing } = this.props;
    const opponent = (opponentId && players.find(p => p.id == opponentId));
    return (
      <form onSubmit={this.handleSubmit}>
        <OpponentSelector onChange={this.opponentSelected} opponentId={opponentId} opponents={(players || []).filter(p => p.id != user.id)} />
        <WinnerSelector winner={winner} onChange={this.winnerSelected} opponent={opponent && opponent.name} />
        <ScoreSelector score={score} onChange={this.setScore} />
        <CommentBox onChange={this.setComment} comment={comment} />
        <DatetimeChooser onChange={this.setTime} time={time} />
        <button type="submit" className="button is-primary" disabled={!this.canSubmit()}>
          SAVE
        </button>
        { currentlyEditing && 
          <button type='button' className="button is-warning" onClick={cancelEditing}>
            Cancel editing
          </button>
        }
      </form>
    );
  }
}

const Form = connect(mapStateToProps, mapDispatchToProps)(ConnectedForm);

export default Form;
