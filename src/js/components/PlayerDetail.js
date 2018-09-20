import React from 'react';
import { connect } from "react-redux";
import EloChart from "./EloChart";

const mapStateToProps = state => {
  return { eloEntries: state.eloEntries };
};

const getEntriesFor = (playerId, entries) => {
  if (entries == null) { return null; }
  return entries.filter(e => e.player_id == playerId);
};

const PlayerDetail = ( { match, eloEntries }) => 
    <EloChart title='Elo rating over time' entries={getEntriesFor(match.params.playerId, eloEntries)} />;

export default connect(mapStateToProps)(PlayerDetail);
