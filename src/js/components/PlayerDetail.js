import React from 'react';
import Plot from 'react-plotly.js';
import { connect } from "react-redux";
import {loadPlayerDetail }from "../actions/index";

const mapDispatchToProps = dispatch => {
  return {
    loadPlayerDetail: playerId => dispatch(loadPlayerDetail(playerId)),
  };
};

const mapStateToProps = state => {
  return { players: state.players, playerDetail: state.playerDetail };
};

class PlayerDetail extends React.Component {

  hasValidDetailsLoaded() {
    return this.props.playerDetail.playerId == this.props.match.params.playerId;
  }

  hasPlayersLoaded() {
    return this.props.players.length > 0;
  }

  getChartData() {
    return [
      {
        x: this.props.playerDetail.eloEntries.map(e => e.created_at),
        y: this.props.playerDetail.eloEntries.map(e => e.score),
        type: 'scatter',
        mode: 'lines+points',
        marker: {color: 'red'},
      },
    ];
  }

  getChartTitle() {
    const playerName = this.props.players.find(p => p.id == this.props.match.params.playerId).name;
    return `Elo Score over time for ${playerName}`;
  }

  componentDidMount() {
    if (!this.hasValidDetailsLoaded()) {
      this.props.loadPlayerDetail(this.props.match.params.playerId);
    }
  }

  render() {
    return this.hasValidDetailsLoaded() && this.hasPlayersLoaded() ? (
      <Plot
        data={this.getChartData()}
        layout={ {width: '70%', height: '70%', title: this.getChartTitle()} }
      />
    ) : <div>Loading...</div>;
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(PlayerDetail);
