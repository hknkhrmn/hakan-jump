import React from 'react';

const MEDALS = ['🥇', '🥈', '🥉'];

const Leaderboard = ({ scores }) => (
  <div className="hj-lb">
    <div className="hj-lb-head">🏆 Şampiyonlar</div>
    <div className="hj-lb-list">
      {!scores || scores.length === 0 ? (
        <div className="hj-lb-empty">Henüz kayıt yok...</div>
      ) : (
        scores.slice(0, 8).map((s, i) => (
          <div key={i} className="hj-lb-row">
            <span className="hj-lb-name">
              {i < 3 ? MEDALS[i] : `${i + 1}.`} {s.name}
            </span>
            <strong className="hj-lb-score">{s.score}</strong>
          </div>
        ))
      )}
    </div>
  </div>
);

export default Leaderboard;