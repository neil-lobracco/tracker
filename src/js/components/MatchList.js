import React from "react";
import { connect } from "react-redux";
import moment from 'moment';
const getMatchDescription = (match, players, user) => {
  if (!players || players.length == 0) { return ''; }
  const player1_name = players.find(p => p.id == match.player1_id).name;
  const player2_name = players.find(p => p.id == match.player2_id).name;
  if (match.player1_score == match.player2_score) { return `${player1_name} drew against ${player2_name}`; }
  const player1_won = match.player1_score > match.player2_score;
  let desc = player1_won ? `${player1_name} def. ${player2_name}` : `${player2_name} def. ${player1_name}`;
  if (user && [match.player1_id, match.player2_id].includes(user.id)) {
    desc += (player1_won == (user.id == match.player1_id)) ? " 🎉" : " 😢";
  }
  return desc;
};
const getMatchScore = (match) => {
  if (match.player1_score + match.player2_score != 1) {
    return [match.player1_score, match.player2_score].sort().reverse().join('-');
  } else return '';
};

const mapStateToProps = state => {
  return { matches: state.matches, players: state.players, user: state.user };
};
const ConnectedList = ({ matches, players, user }) => (
  matches != null &&
  <table className="table">
  	<thead><tr><th>Time</th><th>Outcome</th><th>Score</th><th>Comment</th></tr></thead>
  	<tbody>
    {matches.map(match => (
      <tr key={match.id}>
      	<td>{moment(match.created_at).calendar()}</td>
      	<td>{getMatchDescription(match, players, user)}</td>
        <td>{getMatchScore(match)}</td>
        <td>{match.comment}</td>
      </tr>
    ))}
    </tbody>
  </table>
);
const List = connect(mapStateToProps)(ConnectedList);
export default List;
