import React from "react";
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
const mapStateToProps = state => {
  return { players: state.players, user: state.user };
};
class ConnectedList extends React.Component {
  getFancyName(player, idx) {
    let prefix = '';
    if (idx == 0) {
      prefix = '😁 ';
    } else if (idx == (this.props.players.length - 1)) {
      prefix = '😞 ';
    }
    if (this.props.user && this.props.user.id == player.id) {
      prefix += '☝️';
    }
    return prefix + player.name;
  }
  render() {
    return this.props.players == null ? <div>Loading...</div> : (
    <table className="table">
    	<thead><tr><th>Player Name</th><th>Current Elo</th></tr></thead>
    	<tbody>
      {this.props.players.map((player, idx) => (
        <tr key={player.id || 'unknown'} className={player.games_played == 0 ? 'inactive' : ''}>
        	<th>{player.id ? <Link to={`/players/${player.id}`}>{ this.getFancyName(player, idx) }</Link> : this.getFancyName(player.name, idx)}</th>
        	<td>{Math.round(player.elo)}</td>
        </tr>
      ))}
      </tbody>
    </table>);
}
}
const List = connect(mapStateToProps)(ConnectedList);
export default List;
