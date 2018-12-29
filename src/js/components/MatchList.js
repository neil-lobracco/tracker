import React from "react";
import { connect } from "react-redux";
import ReactTable from "react-table";
import 'react-table/react-table.css'
import { formatRelative } from 'date-fns';
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
const getColumns = (players, user) => {
  return [
    {
      Header: 'Time',
      accessor: 'created_at',
      Cell: (props) => <span title={props.value} className='relative-date'>{formatRelative(props.value, new Date())}</span>,
    },
    {
      id: 'outcome',
      Header: 'Outcome',
      accessor: (m) => getMatchDescription(m, players, user),
    },
    {
      id: 'score',
      Header: 'Score',
      accessor: (m) => getMatchScore(m),
    },
    {
      Header: 'Comment',
      accessor: 'comment',
    },
  ];
};
const getMatchScore = (match) => {
  if (match.player1_score + match.player2_score != 1) {
    return [match.player1_score, match.player2_score].sort().reverse().join('-');
  } else return '';
};

const mapStateToProps = state => {
  return { matches: state.matches, players: state.players, user: state.userContext.currentUser };
};

const MatchList = connect(mapStateToProps)(({ matches, players, user }) => (
  matches != null &&
  <ReactTable
    data={matches}
    columns={getColumns(players, user)}
    minRows='2'
  />
));
export default MatchList;