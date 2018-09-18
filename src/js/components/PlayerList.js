import React from "react";
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
const mapStateToProps = state => {
  return { players: state.players };
};
class ConnectedList extends React.Component {
  getFancyName(playerName, idx) {
    let prefix = '';
    if (idx == 0) {
      prefix = '😁 ';
    } else if (idx == (this.props.players.length - 1)) {
      prefix = '😞 ';
    }
    return prefix + playerName;
  }
  render() {
    return (
    <table className="table">
    	<thead><tr><th>Player Name</th><th>Current Elo</th></tr></thead>
    	<tbody>
      {this.props.players.map((player, idx) => (
        <tr key={player.id}>
        	<th><Link to={`/players/${player.id}`}>{ this.getFancyName(player.name, idx) }</Link></th>
        	<td>{Math.round(player.elo)}</td>
        </tr>
      ))}
      </tbody>
    </table>);
}
}
const List = connect(mapStateToProps)(ConnectedList);
export default List;
