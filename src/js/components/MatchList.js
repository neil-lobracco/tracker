import React from "react";
import { connect } from "react-redux";

const getMatchDescription = (match, players) => {
  const player1_name = players.find(p => p.id == match.player1_id).name;
  const player2_name = players.find(p => p.id == match.player2_id).name;
  if (match.player1_score == match.player2_score) { return `${player1_name} drew against ${player2_name}`; }
  return match.player1_score > match.player2_score ? `${player1_name} def. ${player2_name}` : `${player2_name} def. ${player1_name}`;
};
const getMatchScore = (match) => {
  if (match.player1_score + match.player2_score != 1) {
    return [match.player1_score, match.player2_score].sort().reverse().join('-');
  } else return '';
};

const mapStateToProps = state => {
  return { matches: state.matches, players: state.players };
};
const ConnectedList = ({ matches, players }) => (
  <table className="table">
  	<thead><tr><th>Date</th><th>Outcome</th><th>Score</th><th>Comment</th></tr></thead>
  	<tbody>
    {matches.map(match => (
      <tr key={match.id}>
      	<td>{match.created_at}</td>
      	<td>{getMatchDescription(match, players)}</td>
        <td>{getMatchScore(match)}</td>
        <td>{match.comment}</td>
      </tr>
    ))}
    </tbody>
  </table>
);
const List = connect(mapStateToProps)(ConnectedList);
export default List;
