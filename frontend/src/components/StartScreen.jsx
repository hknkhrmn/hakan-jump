import React from 'react';

const StartScreen = ({ onStart, currentScore }) => (
  <div style={{
    padding: 'clamp(1.5rem, 4vw, 3rem)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  }}>
    <img
      src="/hakanjump9.png"
      alt="Hakan Jump"
      style={{ width: '250px', height: 'auto' }}
    />
    <h2 style={{
      fontSize: 'clamp(22px, 4vw, 32px)',
      fontWeight: 700,
      color: '#1a1a1a',
    }}>
      Hazır mısın?
    </h2>
    <p style={{
      fontSize: 'clamp(14px, 2.5vw, 18px)',
      color: '#666',
    }}>
      A-D yada ok tuşlarıyla sağa sola hareket et!
    </p>
    {currentScore !== null && (
      <p style={{
        fontSize: 'clamp(16px, 2.5vw, 20px)',
        color: '#1a1a1a',
      }}>
        Son Skor: <strong style={{ color: '#2d6a4f' }}>{currentScore}</strong>
      </p>
    )}
    <button className="hj-btn" onClick={onStart} style={{ marginTop: '0.5rem' }}>
      {currentScore !== null ? 'Tekrar Dene' : 'Başlat'}
    </button>
  </div>
);

export default StartScreen;