import React, { useState, useEffect, } from 'react';
import { getScores, saveScore } from './services/api';
import DoodleCanvas from './components/DoodleCanvas';

// ── Font & CSS inject ─────────────────────────────────────────────────────────
const inject = () => {
  if (document.getElementById('hj-css')) return;

  // Caveat: el yazısı görünümlü font
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap';
  document.head.appendChild(link);

  const s = document.createElement('style');
  s.id = 'hj-css';
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── GENEL ──────────────────────────────────────────────────────────── */
    .hj-root {
      min-height: 100vh;
      background: #eee8d8;
      background-image:
        repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(160,185,210,0.28) 31px, rgba(160,185,210,0.28) 32px),
        repeating-linear-gradient(90deg, transparent, transparent 31px, rgba(160,185,210,0.08) 31px, rgba(160,185,210,0.08) 32px);
      padding: 2rem 1.25rem 3rem;
      font-family: 'Caveat', cursive;
      position: relative;
    }
    /* Sol kırmızı defter çizgisi */
    .hj-root::before {
      content: '';
      position: fixed; top: 0; left: 48px;
      width: 2px; height: 100%;
      background: rgba(210,80,80,0.20);
      pointer-events: none;
    }

    /* ── BAŞLIK ──────────────────────────────────────────────────────────── */
    .hj-header {
      text-align: center;
      margin-bottom: 2.2rem;
    }
    .hj-eyebrow {
      font-size: 16px;
      color: #888;
      letter-spacing: 2px;
      margin-bottom: 4px;
    }
    .hj-title {
      font-size: clamp(36px, 7vw, 68px);
      font-weight: 700;
      color: #1a1a1a;
      line-height: 1;
      /* Hafif yamuk: el yazısı hissi */
      transform: rotate(-1.2deg);
      display: inline-block;
      position: relative;
    }
    /* Altı çizili gibi vurgu */
    .hj-title::after {
      content: '';
      position: absolute;
      left: 4px; bottom: -4px;
      width: 100%; height: 4px;
      background: #52b788;
      border-radius: 2px;
      transform: rotate(0.5deg) scaleX(0.95);
    }
    .hj-tagline {
      font-size: 17px;
      color: #888;
      margin-top: 10px;
    }

    /* ── LAYOUT ──────────────────────────────────────────────────────────── */
    .hj-layout {
      display: grid;
      grid-template-columns: 1fr 260px;
      gap: 1.5rem;
      max-width: 760px;
      margin: 0 auto;
      align-items: start;
    }
    @media (max-width: 720px) {
      .hj-layout { grid-template-columns: 1fr; }
    }

    /* ── "KAĞIT" KART ────────────────────────────────────────────────────── */
    .hj-card {
      background: #faf7f0;
      border: 2px solid #1a1a1a;
      border-radius: 3px;
      position: relative;
      /* Hafif kağıt gölgesi */
      box-shadow: 3px 4px 0 #c8c0b0;
    }
    /* Küçük delik (defter spiral hissi) */
    .hj-card::before {
      content: '';
      position: absolute;
      top: 12px; left: -8px;
      width: 12px; height: 12px;
      background: #eee8d8;
      border: 2px solid #bbb;
      border-radius: 50%;
    }

    /* ── BAŞLAT EKRANI ────────────────────────────────────────────────────── */
    .hj-start {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      min-height: 550px; padding: 2rem;
      text-align: center;
    }
    .hj-start-emoji { font-size: 56px; margin-bottom: 1rem; }
    .hj-start-title { font-size: 30px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
    .hj-start-sub { font-size: 18px; color: #777; margin-bottom: 1.8rem; line-height: 1.5; }

    .hj-hints { display: flex; gap: 10px; justify-content: center; margin-bottom: 2rem; flex-wrap: wrap; }
    .hj-hint {
      font-size: 15px; color: #555;
      border: 1.5px solid #bbb;
      border-radius: 3px; padding: 4px 12px;
      background: #f0ece2;
      transform: rotate(-0.5deg);
    }

    .hj-btn {
      font-family: 'Caveat', cursive;
      font-size: 22px; font-weight: 700;
      color: #faf7f0;
      background: #2d6a4f;
      border: 2px solid #1a1a1a;
      border-radius: 3px;
      padding: 0.6rem 2.2rem;
      cursor: pointer;
      box-shadow: 3px 3px 0 #1a1a1a;
      transition: transform 0.08s, box-shadow 0.08s;
      transform: rotate(-0.8deg);
    }
    .hj-btn:hover { transform: rotate(-0.8deg) translateY(-2px); box-shadow: 3px 5px 0 #1a1a1a; }
    .hj-btn:active { transform: rotate(-0.8deg) translateY(1px); box-shadow: 2px 2px 0 #1a1a1a; }

    /* ── CANVAS WRAP ─────────────────────────────────────────────────────── */
    .hj-canvas-wrap {
      border: 2px solid #1a1a1a;
      border-radius: 2px;
      overflow: hidden;
      display: flex;
    }
    .hj-canvas-wrap canvas { display: block; }

    /* ── YAN PANEL ───────────────────────────────────────────────────────── */
    .hj-side { display: flex; flex-direction: column; gap: 1rem; }

    /* ── SKOR KART ───────────────────────────────────────────────────────── */
    .hj-score-card {
      background: #faf7f0;
      border: 2px solid #1a1a1a;
      border-radius: 3px;
      box-shadow: 3px 4px 0 #c8c0b0;
      padding: 0.9rem 1rem;
      position: relative;
    }
    .hj-score-card::before {
      content: '';
      position: absolute; top: 10px; left: -8px;
      width: 12px; height: 12px;
      background: #eee8d8; border: 2px solid #bbb; border-radius: 50%;
    }
    .hj-score-label { font-size: 14px; color: #999; margin-bottom: 2px; }
    .hj-score-val { font-size: 32px; font-weight: 700; color: #1a1a1a; line-height: 1; }
    .hj-score-val.accent { color: #2d6a4f; }

    /* ── LİDER TABLOSU ───────────────────────────────────────────────────── */
    .hj-lb {
      background: #faf7f0;
      border: 2px solid #1a1a1a;
      border-radius: 3px;
      box-shadow: 3px 4px 0 #c8c0b0;
      overflow: hidden;
      position: relative;
    }
    .hj-lb::before {
      content: '';
      position: absolute; top: 10px; left: -8px;
      width: 12px; height: 12px;
      background: #eee8d8; border: 2px solid #bbb; border-radius: 50%;
    }
    .hj-lb-head {
      border-bottom: 2px solid #1a1a1a;
      padding: 0.6rem 1rem;
      font-size: 20px; font-weight: 700; color: #1a1a1a;
    }
    .hj-lb-list { padding: 0.4rem 0.5rem; }
    .hj-lb-empty { font-size: 16px; color: #aaa; text-align: center; padding: 2rem 1rem; }

    .hj-lb-row {
      display: flex; align-items: center;
      padding: 5px 8px; border-radius: 2px;
      margin-bottom: 2px;
      transition: background 0.12s;
    }
    .hj-lb-row:hover { background: rgba(0,0,0,0.04); }

    .hj-lb-rank { font-size: 15px; color: #bbb; width: 26px; flex-shrink: 0; }
    .hj-lb-rank.top { color: #1a1a1a; font-weight: 700; }

    .hj-lb-medal { font-size: 16px; margin-right: 4px; }

    .hj-lb-name { font-size: 17px; color: #1a1a1a; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .hj-lb-score { font-size: 17px; font-weight: 700; color: #2d6a4f; flex-shrink: 0; }

    /* Çizgi ayraçlar */
    .hj-lb-row + .hj-lb-row { border-top: 1px dashed #ddd; }

    /* ── KÜÇÜK DEKORASYONlar ─────────────────────────────────────────────── */
    .hj-deco {
      position: fixed; pointer-events: none; opacity: 0.12;
      font-size: 80px;
    }
    .hj-deco-tl { top: 16px; left: 56px; transform: rotate(-15deg); }
    .hj-deco-br { bottom: 20px; right: 20px; transform: rotate(10deg); }
  `;
  document.head.appendChild(s);
};

// ── Yardımcılar ───────────────────────────────────────────────────────────────
const MEDALS = ['🥇','🥈','🥉'];

function App() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameStarted, setGameStarted]   = useState(false);
  const [currentScore, setCurrentScore] = useState(null);
  const [highScore, setHighScore]       = useState(0);

  useEffect(() => { inject(); }, []);

  useEffect(() => {
    let live = true;
    getScores().then(d => { if (live) setLeaderboard(d); });
    return () => { live = false; };
  }, []);

  const handleStart = () => { setGameStarted(true); setCurrentScore(null); };

  const handleGameOver = async (score) => {
    setGameStarted(false);
    setCurrentScore(score);
    setHighScore(h => Math.max(h, score));

    if (score > 0) {
      const name = prompt(`Oyun Bitti! Skorun: ${score}\nAdın ne?`);
      if (name && name.trim()) {
        await saveScore(name.trim(), score);
        const fresh = await getScores();
        setLeaderboard(fresh);
      }
    }
  };

  return (
    <div className="hj-root">
      {/* Dekorasyon */}
      <div className="hj-deco hj-deco-tl">⭐</div>
      <div className="hj-deco hj-deco-br">🌙</div>

      {/* BAŞLIK */}
      <div className="hj-header">
        <p className="hj-eyebrow">mini oyun</p>
        <h1 className="hj-title">Hakan Jump</h1>
        <p className="hj-tagline">Ne kadar yüksek çıkabilirsin?</p>
      </div>

      {/* LAYOUT */}
      <div className="hj-layout">

        {/* ── OYUN PANELİ ── */}
        <div className="hj-card">
          {!gameStarted ? (
            <div className="hj-start">
              <div className="hj-start-emoji">🐸</div>
              <h2 className="hj-start-title">Hazır mısın?</h2>
              <p className="hj-start-sub">
                Mouse ile sola sağa git,<br />
                platformlara zıpla, yukarı çık!
              </p>
              <div className="hj-hints">
                <span className="hj-hint">← mouse →</span>
                <span className="hj-hint">↑ zıpla</span>
                <span className="hj-hint">🟧 yay = süper zıplama</span>
              </div>
              {currentScore !== null && (
                <p style={{ fontSize: 20, color: '#555', marginBottom: '1rem' }}>
                  Son skor: <strong style={{ color: '#2d6a4f' }}>{currentScore}</strong>
                </p>
              )}
              <button className="hj-btn" onClick={handleStart}>
                {currentScore !== null ? '🔁 Tekrar Oyna' : '▶ Başlat'}
              </button>
            </div>
          ) : (
            <div className="hj-canvas-wrap">
              <DoodleCanvas onGameOver={handleGameOver} />
            </div>
          )}
        </div>

        {/* ── YAN PANEL ── */}
        <div className="hj-side">

          {/* Skor kartları */}
          <div className="hj-score-card">
            <div className="hj-score-label">son skor</div>
            <div className="hj-score-val">
              {currentScore !== null ? currentScore : '—'}
            </div>
          </div>
          <div className="hj-score-card">
            <div className="hj-score-label">en yüksek</div>
            <div className="hj-score-val accent">{highScore || '—'}</div>
          </div>

          {/* Lider tablosu */}
          <div className="hj-lb">
            <div className="hj-lb-head">🏆 Şampiyonlar</div>
            <div className="hj-lb-list">
              {leaderboard.length === 0 ? (
                <div className="hj-lb-empty">Henüz kayıt yok...</div>
              ) : (
                leaderboard.slice(0, 8).map((item, i) => (
                  <div key={item.id || i} className="hj-lb-row">
                    {i < 3
                      ? <span className="hj-lb-medal">{MEDALS[i]}</span>
                      : <span className="hj-lb-rank">{i + 1}.</span>
                    }
                    <span className="hj-lb-name">{item.name}</span>
                    <span className="hj-lb-score">{item.score}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;