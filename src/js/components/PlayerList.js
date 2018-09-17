import React from "react";
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
const mapStateToProps = state => {
  return { players: state.players };
};
const ConnectedList = ({ players }) => (
  <table className="table">
  	<thead><tr><th>Player Name</th><th>Current Elo</th></tr></thead>
  	<tbody>
    {players.map(player => (
      <tr key={player.id}>
      	<th><Link to={`/players/${player.id}`}>{player.name}</Link></th>
      	<td>{player.elo}</td>
      </tr>
    ))}
    </tbody>
  </table>
);
const List = connect(mapStateToProps)(ConnectedList);
export default List;
