import React from 'react';
import { connect } from "react-redux";
import {loadPlayerDetail }from "../actions/index";
import Loadable from 'react-loadable';

const LoadableChart = Loadable({
  loader: () => import( /* webpackPrefetch: true */ 'react-plotly.js'),
  loading: () => <div>Loading...</div>,
});

const mapStateToProps = state => {
  return { players: state.players };
};

class EloChart extends React.Component {

  hasData() {
    return this.props.entries != null && this.props.players != null;
  }

  singleSeries() {
    return this.props.entries.length == 1;
  }

  getPlayerName(playerId) {
    let player = this.props.players.find(p => p.id == playerId);
    return player ? player.name : null;
  }

  getChartData() {
    let idToEntries = {};
    for (const entry of this.props.entries) {
      idToEntries[entry.player_id] = idToEntries[entry.player_id] || [];
      idToEntries[entry.player_id].push(entry);
    }
    const singleSeries = Object.keys(idToEntries).length == 1;
    const xMapper = singleSeries ? ((e,idx) => idx) : ((e) => e.created_at);
    const seriesName = (playerId) => singleSeries ? null : this.getPlayerName(playerId);
    const series = Object.entries(idToEntries).map(([k, entries]) => {
      return {  
        x: entries.map(xMapper),
        y: entries.map(e => e.score),
        type: 'scatter',
        line: {shape: 'hv'},
        mode: 'lines+markers',
        name : seriesName(k),
      };
    }).filter(s => s.x.length > 1);
    return series;
  }

  getChartTitle() {
    const playerName = this.props.players.find(p => p.id == this.props.match.params.playerId).name;
    return `Elo Score over time for ${playerName}`;
  }

  getChartLayout() {
    return {
      width: '70%',
      height: '70%',
      title: this.props.title,
      yaxis : { title: 'Elo rating' },
    };
  }

  render() {
    return this.hasData() ? (
      <LoadableChart
        data={this.getChartData()}
        layout={ this.getChartLayout()}
      />
    ) : <div>Loading...</div>;
  }
}
export default connect(mapStateToProps)(EloChart);
