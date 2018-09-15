import React from "react";
import { connect } from "react-redux";
const mapStateToProps = state => {
  return { players: state.players };
};
const ConnectedList = ({ players }) => (
  <table className="table">
  	<thead><tr><th>Player Name</th><th>ELO</th></tr></thead>
  	<tbody>
    {players.map(player => (
      <tr key={player.id}>
      	<th>{player.name}</th>
      	<td>{player.elo}</td>
      </tr>
    ))}
    </tbody>
  </table>
);
const List = connect(mapStateToProps)(ConnectedList);
export default List;
