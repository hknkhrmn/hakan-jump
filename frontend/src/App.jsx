import React, { useState, useEffect, useCallback } from 'react';
import { scoreService } from './services/scoreService';


import DoodleCanvas from './components/DoodleCanvas';
import StartScreen from './components/StartScreen';
import Leaderboard from './components/Leaderboard';

function App() {
  const [leaderboard, setLeaderboard]   = useState([]);
  const [gameStarted, setGameStarted]   = useState(false);
  const [currentScore, setCurrentScore] = useState(null);
  const [highScore, setHighScore]       = useState(0);

  useEffect(() => {

    let isMounted = true;
    const fetchData = async () => {
      try {
        const data = await scoreService.getScores();
        if (isMounted) setLeaderboard(data);
      } catch (e) {
        console.error('Skorlar yüklenemedi:', e);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const handleGameOver = useCallback(async (score) => {
    setGameStarted(false);
    setCurrentScore(score);
    if (score > highScore) setHighScore(score);

    if (score > 0) {
      setTimeout(async () => {
        const name = prompt(`Oyun Bitti! Skorun: ${score}\nAdın ne?`);
        if (name?.trim()) {
          await scoreService.saveScore(name.trim(), score);
          const freshData = await scoreService.getScores();
          setLeaderboard(freshData);
        }
      }, 100);
    }
  }, [highScore]);

  return (
    <div className="hj-root">
      <div className="hj-header">
        <h1 className="hj-title">Hakan Jump</h1>
      </div>
      <div className="hj-layout">

        {/* ── OYUN KARTI ── */}
        <div className="hj-card">
          {!gameStarted ? (
            <StartScreen
              onStart={() => setGameStarted(true)}
              currentScore={currentScore}
            />
          ) : (
            /*
             * DoodleCanvas kendi wrapper'ını içinde taşıyor (wrapperRef).
             * Burada sadece border/shadow için ince bir kılıf yeterli —
             * padding veya min-height OLMAMALI, canvas boyutu belirlesin.
             */
            <div className="hj-canvas-shell">
              <DoodleCanvas onGameOver={handleGameOver} />
            </div>
          )}
        </div>

        {/* ── YAN PANEL ── */}
        <div className="hj-side">
          <div className="hj-score-card">
            <div className="hj-score-label">en yüksek</div>
            <div className="hj-score-val accent">{highScore || '—'}</div>
          </div>
          <Leaderboard scores={leaderboard} />
        </div>

      </div>
    </div>
  );
}

export default App;