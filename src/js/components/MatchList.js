import React from "react";
import { connect } from "react-redux";
import ReactTable from "react-table";
import 'react-table/react-table.css';
import { formatRelative } from 'date-fns';
import { setEditingMatch } from '../actions/matches';

const getMatchDescription = (match, players, user) => {
  if (!players || players.length == 0) { return ''; }
  const player1_name = players.find(p => p.id == match.player1_id).name;
  const player2_name = players.find(p => p.id == match.player2_id).name;
  if (match.player1_score == match.player2_score) { return `${player1_name} drew against ${player2_name}`; }
  const player1_won = match.player1_score > match.player2_score;
  let desc = player1_won ? `${player1_name} def. ${player2_name}` : `${player2_name} def. ${player1_name}`;
  if (user && [match.player1_id, match.player2_id].includes(user.id)) {
    desc += (player1_won == (user.id == match.player1_id)) ? " 🎉" : " 😢";
  }
  return desc;
};
const getEloChange = (match, eloEntries) => {
  if (!eloEntries) { return null; }
  let lastEntry, change;
  for (const entry of eloEntries) {
    if (entry.match_id == match.id) {
      if (!lastEntry) { return null; }
      change = entry.score - lastEntry.score;
      break;
    } else {
      lastEntry = entry;
    }
  }
  return '±' + Math.round(Math.abs(change) * 10) / 10;
};
const getMatchScore = (match) => {
  if (match.player1_score + match.player2_score != 1) {
    return [match.player1_score, match.player2_score].sort().reverse().join('-');
  } else return '';
};

const getColumns = (players, user, eloEntries, currentMembership, editMatchHandler) => {
  let columns = [
    {
      Header: 'Time',
      accessor: 'created_at',
      Cell: (props) => <span title={props.value} className='relative-date'>{formatRelative(props.value, new Date())}</span>,
      minWidth: 150,
    },
    {
      id: 'outcome',
      Header: 'Outcome',
      accessor: (m) => () => getMatchDescription(m, players, user),
      Cell: (row) => row.value(),
      minWidth: 200,
    },
    {
      id: 'score',
      Header: 'Score',
      accessor: (m) => () => getMatchScore(m),
      Cell: (row) => row.value(),
      maxWidth: 75,
    },
    {
      id: 'elochange',
      Header: 'Elo Change',
      accessor: (m) => () => getEloChange(m, eloEntries),
      Cell: (row) => row.value(),
    },
    {
      Header: 'Comment',
      accessor: 'comment',
    },
  ];
  if (currentMembership && currentMembership.role == 'admin') {
    columns.push({
      Header: 'Edit',
      id: 'edit',
      accessor: (m) => [m.player1_id, m.player2_id].includes(user.id) && m.id,
      maxWidth: 40,
      Cell: (row) => row.value && <a className='edit-match' data-matchid={row.value} onClick={editMatchHandler}>⚙️</a>
    });
  }
  return columns;
};

const mapStateToProps = state => {
  return { matches: state.matches.all, players: state.players, user: state.userContext.currentUser, eloEntries: state.eloEntries, currentMembership: state.leagues.currentMembership };
};
const mapDispatchToProps = dispatch => {
  return { setEditingMatch: (matchid) => dispatch(setEditingMatch(matchid))};
};

const MatchList = connect(mapStateToProps, mapDispatchToProps)(({ matches, players, user, eloEntries, currentMembership, setEditingMatch }) => {
  const editMatchHandler = (e) => setEditingMatch(matches.find(m => m.id == e.target.dataset.matchid));
  return matches != null &&
    <ReactTable
      data={matches}
      columns={getColumns(players, user, eloEntries, currentMembership, editMatchHandler)}
      minRows='2'
    />
});
export default MatchList;