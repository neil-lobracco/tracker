import React from 'react';
import { connect } from "react-redux";
import {loadPlayerDetail }from "../actions/index";
import Loadable from 'react-loadable';

const LoadableChart = Loadable({
  loader: () => import( /* webpackPrefetch: true */ 'react-plotly.js'),
  loading: () => <div>Loading...</div>,
});

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
        x: this.props.playerDetail.eloEntries.map((e,idx) => idx),
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

  getChartLayout() {
    return {
      width: '70%',
      height: '70%',
      title: this.getChartTitle(),
      xaxis : { title: 'Games played' },
      yaxis : { title: 'Elo rating' },
    };
  }

  componentDidMount() {
    if (!this.hasValidDetailsLoaded()) {
      this.props.loadPlayerDetail(this.props.match.params.playerId);
    }
  }

  render() {
    return this.hasValidDetailsLoaded() && this.hasPlayersLoaded() ? (
      <LoadableChart
        data={this.getChartData()}
        layout={ this.getChartLayout()}
      />
    ) : <div>Loading...</div>;
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(PlayerDetail);
