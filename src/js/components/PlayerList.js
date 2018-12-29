import React from "react";
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
const mapStateToProps = state => {
  return { players: state.players, user: state.userContext.currentUser };
};
const getFancyName = ({player, idx, user, players}) => {
  let prefix = '';
  if (idx == 0) {
    prefix = '😁 ';
  } else if (idx == (players.length - 1)) {
    prefix = '😞 ';
  }
  if (user && user.id == player.id) {
    prefix += '☝️';
  }
  return prefix + player.name;
};

const PlayerList = connect(mapStateToProps)(({players, user}) => {
  return players == null ? <div>Loading...</div> : (
    <table className="table">
    	<thead><tr><th>Player Name</th><th>Current Elo</th></tr></thead>
    	<tbody>
      {players.map((player, idx) => (
        <tr key={player.id} className={player.games_played == 0 ? 'inactive' : ''}>
        	<th><Link to={`/players/${player.id}`}>{ getFancyName({player, idx, user, players}) }</Link></th>
        	<td>{Math.round(player.elo)}</td>
        </tr>
      ))}
      </tbody>
    </table>);
});
export default PlayerList;
