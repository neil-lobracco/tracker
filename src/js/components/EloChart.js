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

  getPlayerName(playerId) {
    let player = this.props.players.find(p => p.id == playerId);
    return player ? player.name : null;
  }

  getChartInfo() {
    let idToEntries = {};
    for (const entry of this.props.entries) {
      idToEntries[entry.player_id] = idToEntries[entry.player_id] || [];
      idToEntries[entry.player_id].push(entry);
    }
    const singleSeries = Object.keys(idToEntries).length == 1;
    const layout = this.getChartLayout(singleSeries);
    const data = singleSeries ?  this.getSingleSeriesData() : this.getMultiSeriesData(idToEntries);
    return { data, layout };
  }

  getMultiSeriesData(idToEntries) {
    for (var prop in idToEntries) {
      if (idToEntries[prop].length == 0) {
        idToEntries.delete(prop);
      } else {
        idToEntries[prop].reverse();
      }
    }
    const sortedEntries = this.props.entries.sort((e1, e2) => e1.created_at - e2.created_at);
    const firstDataPoint = new Date(new Date(sortedEntries[0].created_at.getTime()).setHours(23,59,59,999));
    const lastDate = sortedEntries[sortedEntries.length - 1].created_at;
    let currentDataPoint = firstDataPoint;
    let xPoints = [];
    while (currentDataPoint < lastDate) {
      xPoints.push(currentDataPoint);
      let cloned = new Date(currentDataPoint.getTime());
      currentDataPoint = new Date(cloned.setDate(cloned.getDate() + 1));
    }
    xPoints.push(lastDate);
    const seriesName = (playerId) => this.getPlayerName(playerId);
    const getLastBefore = (entries, d) => { const e = entries.find(e => e.created_at < d); return e && e.score; } ; //sorted by player then created_at
    const series = Object.entries(idToEntries).map(([k, entries]) => {
      return {  
        x: [...xPoints, lastDate],
        y: [...xPoints.map(d => getLastBefore(entries, d)), entries[0].score],
        type: 'scatter',
        line: {shape: 'hv'},
        mode: 'lines+markers',
        name : seriesName(k),
      };
    });
    return series;
  }

  getSingleSeriesData() {
    const series = [{
        x: this.props.entries.map( ((e,idx) => idx)),
        y: this.props.entries.map(e => e.score),
        type: 'scatter',
        line: {shape: 'hv'},
        mode: 'lines+markers',
    }];
    return series;
  }


  getChartTitle() {
    return `Elo Score over time for ${this.getPlayerName(this.props.playerId)}`;
  }

  getChartLayout(singleSeries) {
    return {
      width: '70%',
      height: '70%',
      title: this.props.title || (singleSeries && this.getChartTitle()),
      yaxis : { title: 'Elo rating' },
      xaxis : { title: singleSeries ? 'Games played' : 'Time'},
    };
  }

  render() {
    if (this.hasData()) {
      const chartInfo = this.getChartInfo();
      return <LoadableChart data={chartInfo.data} layout={ chartInfo.layout } />
    } else {
      return <div>Loading...</div>;
    }
  }
}
export default connect(mapStateToProps)(EloChart);
