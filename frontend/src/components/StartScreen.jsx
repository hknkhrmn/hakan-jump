import React from 'react';

const StartScreen = ({ onStart, currentScore }) => (
  <div style={{ padding: '3rem', textAlign: 'center' }}>
    <div style={{ fontSize: '60px' }}>🐸</div>
    <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Hazır mısın?</h2>
    <p style={{ color: '#666', marginBottom: '20px' }}>Mouse ile sağa sola hareket et!</p>
    {currentScore !== null && (
      <p style={{ fontSize: '20px', marginBottom: '20px' }}>Son Skor: <strong>{currentScore}</strong></p>
    )}
    <button className="hj-btn" onClick={onStart}>
      {currentScore !== null ? 'Tekrar Dene' : 'Başlat'}
    </button>
  </div>
);

export default StartScreen;