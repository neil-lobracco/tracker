import React from 'react';
import { connect } from "react-redux";
import Loadable from 'react-loadable';
import createPlotlyComponent from 'react-plotly.js/factory';

const LoadableChart = Loadable({
  loader: () => import( /* webpackPrefetch: true */ 'plotly.js-basic-dist').then(m => createPlotlyComponent(m)),
  loading: () => <div>Loading...</div>,
});

const hasDataLoaded = ({entries, players, matches}) => {
  return entries != null && players != null && matches != null;
};

const hasData = ({entries, players, matches}) => {
  return entries.length > 0 && players.length > 0 && matches.length > 0;
};

const getPlayerName = ({playerId, players}) => {
  let player = players.find(p => p.id == playerId);
  return player ? player.name : null;
};

const getChartInfo = ({matches, players, entries, playerId, ...rest}) => {
  let idToEntries = {};
  for (const entry of entries) {
    idToEntries[entry.player_id] = idToEntries[entry.player_id] || [];
    idToEntries[entry.player_id].push(entry);
  }
  const singleSeries = Object.keys(idToEntries).length == 1;
  const layout = getChartLayout({singleSeries, playerId, players, ...rest});
  const data = singleSeries ?  getSingleSeriesData({entries, playerId, players, matches}) : getMultiSeriesData({idToEntries, entries, players});
  return { data, layout };
}

const getMultiSeriesData = ({idToEntries, entries, players }) => {
  for (var prop in idToEntries) {
    if (idToEntries[prop].length < 2) {
      delete idToEntries[prop];
    } else {
      idToEntries[prop].reverse();
    }
  }
  const sortedEntries = entries.concat().sort((e1, e2) => e1.created_at - e2.created_at);
  const firstDataPoint = new Date(new Date(sortedEntries[0].created_at.getTime()).setHours(23,59,59,999));
  const lastDate = sortedEntries[sortedEntries.length - 1].created_at;
  let currentDataPoint = firstDataPoint;
  let xPoints = [];
  while (currentDataPoint < lastDate) {
    xPoints.push(currentDataPoint);
    let cloned = new Date(currentDataPoint.getTime());
    currentDataPoint = new Date(cloned.setDate(cloned.getDate() + 1));
  }
  const seriesName = (playerId) => getPlayerName({playerId, players});
  const getLastBefore = (entries, d) => { const e = entries.find(e => e.created_at < d); return e && e.score; } ; //sorted by player then created_at
  const series = Object.entries(idToEntries).map(([k, entries]) => {
    return {  
      x: [...xPoints, lastDate],
      y: [...xPoints.map(d => getLastBefore(entries, d)), entries[0].score],
      type: 'scatter',
      //line: {shape: 'hv'},
      mode: 'lines+markers',
      name : seriesName(k),
      marker: { size: 4 },
      line: {width: 1.5 },
    };
  });
  return series;
}

const getMatchDescriptions = ({entries, players, playerId, matches}) => {
  let prior = null;
  return entries.map(entry => {
    const result = getMatchDescription({entry, prior, players, playerId, matches});
    prior = entry;
    return result;
  });
};

const getMatchDescription = ({entry, prior, players, playerId, matches}) => {
  if (entry.match_id == null) {
    return 'Initial rating';
  }
  const match = matches.find(m => m.id == entry.match_id);
  if (match == null) { return null; }
  const isPlayer1 = playerId == match.player1_id;
  const otherPlayerId = isPlayer1 ? match.player2_id : match.player1_id;
  const otherPlayerName = players.find(p => p.id == otherPlayerId).name;
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
};

const getSingleSeriesData = ({entries, playerId, players, matches}) => {
  const series = [{
      x: entries.map( ((e,idx) => idx)),
      y: entries.map(e => e.score),
      text: getMatchDescriptions({entries, players, playerId, matches}),
      type: 'scatter',
      line: {shape: 'hv'},
      mode: 'lines+markers',
  }];
  return series;
};


const getChartTitle = ({playerId, players}) => {
  return `Elo Score over time for ${getPlayerName({playerId, players})}`;
};

const getChartLayout = ({singleSeries, playerId, players, width, height, title}) => {
  return {
    width: width,
    height: height,
    title: title || (singleSeries && getChartTitle({playerId, players})),
    yaxis : { title: 'Elo rating' },
    xaxis : { title: singleSeries ? 'Games played' : 'Time'},
  };
}


const mapStateToProps = state => {
  return { players: state.players, matches: state.matches.all };
};

const EloChart = connect(mapStateToProps)(({matches, players, entries, ...rest}) => {
  if (!hasDataLoaded({entries, players, matches})) {
    return <div>Loading...</div>;
  } else if (!hasData({entries, players, matches})) {
    return <div>No data available yet</div>
  } else {
    const chartInfo = getChartInfo({matches, players, entries, ...rest});
    return <LoadableChart data={chartInfo.data} layout={ chartInfo.layout } />;
  }
});
export default EloChart;
