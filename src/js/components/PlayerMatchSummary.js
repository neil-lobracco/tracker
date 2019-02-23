import React from 'react';
import { connect } from "react-redux";
import { formatRelative } from 'date-fns';

const round = (score) => Math.round(score * 10) / 10;
const resultToKey = { '-1': 'losses', 0: 'draws', 1: 'wins' };
const winPercent = (selfElo, opponentElo) => {
    return (1 / (1 + (Math.pow(10,((opponentElo - selfElo) / 400))))) * 100;
};
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
    const selfElo = players.find(p => p.id == playerId).elo;
    let result = [];
    for (let [pid, outcomes] of Object.entries(matchups)) {
        let player = players.find(p => p.id == pid);
        result.push({name: player.name, winPercent: winPercent(selfElo, player.elo), results: outcomes, id: pid});
    }
    return result;
};
const HeadToHead = ({playerId, players, matches}) => {
    const results = getResults(playerId, players, matches);
    return (
        <div className='head-to-head'>
            <h2 style={{fontWeight: 'bold', fontSize: '20pt'}}>Head to Head</h2>
            <table className='table'>
                <thead>
                    <tr>
                        <th>Opponent</th>
                        <th>Record</th>
                        <th>Projected Win %</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((row) => (
                        <tr key={row.id}>
                            <td>{row.name}</td>
                            <td>{row.results.wins + '-' + row.results.losses + (row.results.draws ? '-' + row.results.draws : '')}</td>
                            <td>{round(row.winPercent)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ScoreSummary = ({playerId, entries, players, matches }) => {
    if (!(playerId && entries && players && matches)) { return null; }
    let current = entries[entries.length - 1];
    let highest = entries[0];
    let lowest = entries[0];
    let bestWin, worstLoss, lastEntry;
    for (const entry of entries) {
        if (entry.score > highest.score) { highest = entry; }
        if (entry.score < lowest.score) { lowest = entry; }
        if (entry.match_id) {
            const match = matches.find(m => m.id == entry.match_id);
            const wasP1 = match.player1_id == playerId;
            const scores = [match.player1_score,match.player2_score];
            if (!wasP1) { scores.reverse(); }
            const opponentId = wasP1 ? match.player2_id : match.player1_id;
            const won = scores[0] > scores[1];
            const lost = scores[1] > scores[0];
            const eloChange = entry.score - lastEntry.score;
            if (won) {
                if (!bestWin || bestWin.eloChange < eloChange) {
                    bestWin = { when: match.created_at, opponentId, eloChange, scores };
                }
            } else if (lost) {
                if (!worstLoss || worstLoss.eloChange > eloChange) {
                    worstLoss = { when: match.created_at, opponentId, eloChange, scores };
                }
            }
        }
        lastEntry = entry;
    }
    if (bestWin) {
        bestWin.opponentName = players.find(p => p.id == bestWin.opponentId).name;
    }
    if (worstLoss) {
        worstLoss.opponentName = players.find(p => p.id == worstLoss.opponentId).name;
    }
    return (
        <div className='elo-summary'>
            <h2 style={{fontWeight: 'bold', fontSize: '20pt'}}>Elo Summary</h2>
            <p>Current score: <b>{current.score}</b></p>
            <p>Highest Elo achieved: <b>{round(highest.score)}</b> on {formatRelative(highest.created_at, new Date())}</p>
            <p>Lowest Elo achieved: <b>{round(lowest.score)}</b> on {formatRelative(lowest.created_at, new Date())}</p>
            { bestWin &&
                <p>Best win: Beat {bestWin.opponentName} {bestWin.scores.join('-')} on {formatRelative(bestWin.when, new Date())} and gained {round(bestWin.eloChange)} Elo.</p>
            }
            { worstLoss &&
                <p>Worst loss: Lost to {worstLoss.opponentName} {worstLoss.scores.join('-')} on {formatRelative(worstLoss.when, new Date())} and dropped {round(-worstLoss.eloChange)} Elo.</p>
            }
        </div>
    );
};

const mapStateToProps = (state) => ({matches: state.matches.all, players: state.players });
const PlayerMatchSummary = connect(mapStateToProps)(({playerId, entries, matches, players}) => (
    <div className='player-match-summary columns'>
        <div className='column'>
            <HeadToHead playerId={playerId} matches={matches} players={players} />
        </div>
        <div className='column'>
            <ScoreSummary playerId={playerId} matches={matches} players={players} entries={entries} />
        </div>
    </div>
));
export default PlayerMatchSummary;
