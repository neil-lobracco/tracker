import React, { useState } from "react";
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

const Form = ({ createMatch, updateMatch, cancelEditing, players, user, currentlyEditing }) => {
  const [state, setState] = useState(() => {
    const state = {...initialState};
    const m = currentlyEditing;
    if (m) {
      state.opponentId = m.player1_id == user.id ? m.player2_id : m.player1_id;
      state.winner = m.player1_score == m.player2_score ? 'draw' : m.player1_score > m.player2_score ? 'player1' : 'player2';
      state.comment = m.comment || '';
      state.score = getMatchScore(m);
      state.time = m.created_at;
    }
    return state;
  });

  const getScores = () => {
    const { winner, score } = state;
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const scores = getScores();
    const match = {
      player1_id: user.id,
      player2_id: state.opponentId,
      player1_score: scores[0],
      player2_score: scores[1],
      comment: state.comment == '' ? null : state.comment,
      created_at: state.time,
    };
    if (currentlyEditing) {
      updateMatch({ ...match, id: currentlyEditing.id });
      cancelEditing();
    } else {
      createMatch(match);
    }
    setState({ ...state, winner: null, comment: '', score: ''});
  };

  const opponentSelected = (event)  => {
    setState({...state, opponentId: parseInt(event.target.value)});
  };
  const setComment = (event) => {
    setState({...state, comment : event.target.value });
  };
  const setTime = (time) => {
    setState({...state,  time });
  };
  const setScore = (event) => {
    setState({...state, score: event.target.value });
  };
  const winnerSelected = (event) => {
    setState({...state, winner: event.target.value});
  };
  const canSubmit = () => state.opponentId != null && getScores() != null;
  const {opponentId, winner, score, comment, time } = state;
  const opponent = (opponentId && players.find(p => p.id == opponentId));
  return (
    <form onSubmit={handleSubmit}>
      <OpponentSelector onChange={opponentSelected} opponentId={opponentId} opponents={(players || []).filter(p => p.id != user.id)} />
      <WinnerSelector winner={winner} onChange={winnerSelected} opponent={opponent && opponent.name} />
      <ScoreSelector score={score} onChange={setScore} />
      <CommentBox onChange={setComment} comment={comment} />
      <DatetimeChooser onChange={setTime} time={time} />
      <button type="submit" className="button is-primary" disabled={!canSubmit()}>
        SAVE
      </button>
      { currentlyEditing && 
        <button type='button' className="button is-warning" onClick={cancelEditing}>
          Cancel editing
        </button>
      }
    </form>
  );
};

const MatchForm = connect(mapStateToProps, mapDispatchToProps)(Form);

export default MatchForm;
