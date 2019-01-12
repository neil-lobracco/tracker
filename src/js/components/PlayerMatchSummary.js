import React from 'react';
import { connect } from "react-redux";

const resultToKey = { '-1': 'losses', 0: 'draws', 1: 'wins' };
const getResults = (playerId, players, matches) => {
    if (!playerId || !players || !matches) { return []; }
    let matchups = {};
    for (const match of matches) {
        if (![match.player1_id, match.player2_id].includes(playerId)) { continue; }
        const isPlayer1 = match.player1_id == playerId;
        const p1Result = match.player1_score > match.player2_score ? 1 : (match.player1_score < match.player2_score ? -1 : 0);
        const playerResult = isPlayer1 ? p1Result : -p1Result;
        const otherPlayerId = isPlayer1 ? match.player2_id : match.player1_id;
        if (!matchups[otherPlayerId]) { matchups[otherPlayerId] = { wins: 0, losses: 0, draws: 0}; }
        matchups[otherPlayerId][resultToKey[playerResult]]++;
    }
    let result = [];
    for (let [pid, outcomes] of Object.entries(matchups)) {
        let playerName = players.find(p => p.id == pid).name;
        result.push({name: playerName, results: outcomes, id: pid});
    }
    return result;
};
const HeadToHead = ({playerId, players, matches}) => {
    const results = getResults(playerId, players, matches);
    console.log(results);
    return (
        <table className='table'>
            <thead>
                <tr>
                    <th>Opponent</th>
                    <th>Record</th>
                </tr>
            </thead>
            <tbody>
                {results.map((row) => (
                    <tr key={row.id}>
                        <td>{row.name}</td>
                        <td>{row.results.wins + '-' + row.results.losses + (row.results.draws ? '-' + row.results.draws : '')}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const mapStateToProps = (state) => ({matches: state.matches.all, players: state.players });
const PlayerMatchSummary = connect(mapStateToProps)(({playerId, matches, players}) => (
    <div className='player-match-summary'>
        <HeadToHead playerId={playerId} matches={matches} players={players} />
    </div>
));
export default PlayerMatchSummary;
