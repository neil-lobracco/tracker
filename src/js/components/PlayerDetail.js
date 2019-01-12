import React from 'react';
import { connect } from "react-redux";
import EloChart from "./EloChart";
import PlayerMatchSummary from "./PlayerMatchSummary";

const mapStateToProps = state => {
  return { eloEntries: state.eloEntries };
};

const getEntriesFor = (playerId, entries) => {
  if (entries == null) { return null; }
  return entries.filter(e => e.player_id == playerId);
};

const PlayerDetail = ( { match, eloEntries }) => (
  <div className='player-detail'>
    <EloChart playerId={match.params.playerId} entries={getEntriesFor(match.params.playerId, eloEntries)} />
    <PlayerMatchSummary playerId={parseInt(match.params.playerId)} />
  </div>
);

export default connect(mapStateToProps)(PlayerDetail);
