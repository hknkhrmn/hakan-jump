import React from 'react';

const Leaderboard = ({ scores }) => (
  <div className="hj-lb">
    <div style={{ padding: '10px', borderBottom: '2px solid #1a1a1a', fontWeight: 'bold' }}>🏆 Şampiyonlar</div>
    <div style={{ padding: '10px' }}>
      {scores.map((s, i) => (
        <div key={i} className="hj-lb-row">
          <span>{i + 1}. {s.name}</span>
          <strong>{s.score}</strong>
        </div>
      ))}
    </div>
  </div>
);

export default Leaderboard;