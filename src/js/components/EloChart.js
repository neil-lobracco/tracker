import React from 'react';
import { connect } from "react-redux";
import Loadable from 'react-loadable';

const LoadableChart = Loadable({
  loader: () => import( /* webpackPrefetch: true */ 'react-plotly.js').then(i => i.default),
  loading: () => <div>Loading...</div>,
});

const mapStateToProps = state => {
  return { players: state.players, matches: state.matches };
};

class EloChart extends React.Component {

  hasDataLoaded() {
    return this.props.entries != null && this.props.players != null && this.props.matches != null;
  }

  hasData() {
    return this.props.entries.length > 0 && this.props.players.length > 0 && this.props.matches.length > 0;
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
      if (idToEntries[prop].length < 2) {
        delete idToEntries[prop];
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
    const seriesName = (playerId) => this.getPlayerName(playerId);
    const getLastBefore = (entries, d) => { const e = entries.find(e => e.created_at < d); return e && e.score; } ; //sorted by player then created_at
    const series = Object.entries(idToEntries).map(([k, entries]) => {
      return {  
        x: [...xPoints, lastDate],
        y: [...xPoints.map(d => getLastBefore(entries, d)), entries[0].score],
        type: 'scatter',
        //line: {shape: 'hv'},
        mode: 'lines+markers',
        name : seriesName(k),
        //marker: { size: 4 },
        //line: {width: 1 },
      };
    });
    return series;
  }

  getMatchDescriptions(entries) {
    let prior = null;
    return entries.map(entry => {
      const result = this.getMatchDescription(entry, prior);
      prior = entry;
      return result;
    });
  }

  getMatchDescription(entry, prior) {
    if (entry.match_id == null) {
      return 'Initial rating';
    }
    const match = this.props.matches.find(m => m.id == entry.match_id);
    if (match == null) { return null; }
    const isPlayer1 = this.props.playerId == match.player1_id;
    const otherPlayerId = isPlayer1 ? match.player2_id : match.player1_id;
    const otherPlayerName = this.props.players.find(p => p.id == otherPlayerId).name;
    const relativeScore = (match.player1_score - match.player2_score) * (isPlayer1 ? 1 : -1);
    const scoreStr = (match.player1_score + match.player2_score == 1) ? '' : ` ${[match.player1_score, match.player2_score].sort().reverse().join('-')}`;
    const eloChange = Math.round((entry.score - prior.score) * 10) / 10;
    const eloDescription = eloChange > 0 ? `Rating increased ${eloChange} points` : `Rating dropped ${0-eloChange} points`;
    if (relativeScore > 0){
      return `Beat ${otherPlayerName}${scoreStr} (${eloDescription})`;
    } else if (relativeScore == 0) {
      return `Drew${scoreStr} against ${otherPlayerName} (${eloDescription})`;
    } else if (relativeScore < 0) {
      return `Lost${scoreStr} to ${otherPlayerName} (${eloDescription})`;
    }
  }

  getSingleSeriesData() {
    const series = [{
        x: this.props.entries.map( ((e,idx) => idx)),
        y: this.props.entries.map(e => e.score),
        text: this.getMatchDescriptions(this.props.entries),
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
      width: this.props.width,
      height: this.props.height,
      title: this.props.title || (singleSeries && this.getChartTitle()),
      yaxis : { title: 'Elo rating' },
      xaxis : { title: singleSeries ? 'Games played' : 'Time'},
    };
  }

  render() {
    if (!this.hasDataLoaded()) {
      return <div>Loading...</div>;
    } else if (!this.hasData()) {
      return <div>No data available yet</div>

    } else {
      const chartInfo = this.getChartInfo();
      return <LoadableChart data={chartInfo.data} layout={ chartInfo.layout } />;
    }
  }
}
export default connect(mapStateToProps)(EloChart);
