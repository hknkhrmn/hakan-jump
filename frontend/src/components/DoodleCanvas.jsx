import React, { useRef, useEffect } from 'react';

const jitter = (n, a = 1.8) => n + (Math.random() - 0.5) * a;

const wobblyRect = (ctx, x, y, w, h, stroke, fill) => {
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(jitter(x),     jitter(y));
  ctx.lineTo(jitter(x + w), jitter(y));
  ctx.lineTo(jitter(x + w), jitter(y + h));
  ctx.lineTo(jitter(x),     jitter(y + h));
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  ctx.stroke();
  ctx.restore();
};

const PLAT_COLORS = {
  normal:  { stroke: '#2d6a4f', fill: '#b7e4c7' },
  spring:  { stroke: '#b5451b', fill: '#f4a261' },
  cracked: { stroke: '#6b6b6b', fill: '#d6d6d6' },
};

// Oyun mantığının çalıştığı sabit koordinat uzayı

const GAME_W = 350;
const GAME_H = 550;

const CHARACTERS = [
  { src: '/hakan1.svg', label: '🔒 Güvenlik Hakanı', minScore: 0    },
  { src: '/hakan2.svg', label: '⚙️ Mühendis Hakanı', minScore: 1000 },
  { src: '/hakan3.svg', label: '💻 Frontend Hakanı', minScore: 2000 },
];

const getCharIndex = (score) => {
  if (score >= 2000) return 2;
  if (score >= 1000) return 1;
  return 0;
};

const DoodleCanvas = ({ onGameOver }) => {
  const canvasRef = useRef(null);

  const gs = useRef({
    player: { x: 140, y: 440, w: 36, h: 36, vy: 0 },
    platforms: [],
    score: 0,
    dead: false,
    charIndex: 0,
    labelFrames: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    // canvas.width/height = oyun koordinat uzayı (sabit)
    // CSS width/height    = ekrandaki görsel boyut (global.css halleder)
    canvas.width  = GAME_W;
    canvas.height = GAME_H;

    // Kağıt arka plan 
    const paperCv  = document.createElement('canvas');
    paperCv.width  = GAME_W;
    paperCv.height = GAME_H;
    const pCtx     = paperCv.getContext('2d');
    pCtx.fillStyle = '#f7f3eb';
    pCtx.fillRect(0, 0, GAME_W, GAME_H);
    for (let ly = 32; ly < GAME_H; ly += 32) {
      pCtx.strokeStyle = 'rgba(160,185,210,0.30)';
      pCtx.lineWidth   = 0.7;
      pCtx.beginPath(); pCtx.moveTo(0, ly); pCtx.lineTo(GAME_W, ly); pCtx.stroke();
    }
    pCtx.strokeStyle = 'rgba(210,90,90,0.22)';
    pCtx.lineWidth   = 1.5;
    pCtx.beginPath(); pCtx.moveTo(30, 0); pCtx.lineTo(30, GAME_H); pCtx.stroke();

    // Karakter görselleri
    const imgs = CHARACTERS.map(({ src }) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    // Platformlar
    const TYPES   = ['normal', 'normal', 'normal', 'spring', 'cracked'];
    const makePlat = (x, y) => ({
      x, y,
      w: 52 + Math.random() * 22,
      h: 10,
      type: TYPES[Math.floor(Math.random() * TYPES.length)],
    });

    const reset = () => {
      gs.current.score       = 0;
      gs.current.dead        = false;
      gs.current.charIndex   = 0;
      gs.current.labelFrames = 0;
      gs.current.player      = { x: 135, y: 440, w: 36, h: 36, vy: 0 };
      gs.current.platforms   = [
        { x: 110, y: 490, w: 80, h: 10, type: 'normal' },
        ...Array.from({ length: 6 }, (_, i) =>
          makePlat(20 + Math.random() * (GAME_W - 90), 400 - i * 80)
        ),
      ];
    };
    reset();

    // Parçacıklar
    const particles = [];
    const burst = (x, y, color) => {
      for (let i = 0; i < 6; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 3.5,
          vy: -Math.random() * 2.5 - 0.5,
          life: 1,
          r: Math.random() * 3 + 1,
          color,
        });
      }
    };

    const drawPlat = (p) => {
      const { stroke, fill } = PLAT_COLORS[p.type];
      wobblyRect(ctx, p.x, p.y, p.w, p.h, stroke, fill);
      if (p.type === 'spring') {
        ctx.save();
        ctx.strokeStyle = '#9b2226';
        ctx.lineWidth   = 1.5;
        ctx.lineCap     = 'round';
        const cx = p.x + p.w / 2;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(cx + (i % 2 === 0 ? -4 : 4), p.y - i * 3);
          ctx.lineTo(cx + (i % 2 === 0 ? 4 : -4), p.y - i * 3 - 3);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (p.type === 'cracked') {
        ctx.save();
        ctx.strokeStyle = '#888';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(p.x + p.w * 0.35, p.y); ctx.lineTo(p.x + p.w * 0.45, p.y + p.h);
        ctx.moveTo(p.x + p.w * 0.6,  p.y); ctx.lineTo(p.x + p.w * 0.52, p.y + p.h);
        ctx.stroke();
        ctx.restore();
      }
    };

    const drawPlayer = (p) => {
      const img = imgs[gs.current.charIndex];
      if (img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.drawImage(img, p.x, p.y, p.w, p.h);
        ctx.restore();
      } else {
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2, r = p.w / 2;
        ctx.save();
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.restore();
      }
    };

    const drawScore = (score) => {
      ctx.save();
      ctx.font      = "bold 18px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText(`⭐ ${score}`, 36, 26);
      ctx.restore();
    };

    const drawCharLabel = () => {
      const { charIndex, labelFrames } = gs.current;
      if (labelFrames <= 0) return;
      const label   = CHARACTERS[charIndex].label;
      const alpha   = Math.min(labelFrames / 40, 1);
      const fadeOut = Math.min(labelFrames / 20, 1);
      ctx.save();
      ctx.globalAlpha = Math.min(alpha, fadeOut);
      ctx.textAlign   = 'center';
      ctx.fillStyle   = 'rgba(247,243,235,0.92)';
      ctx.fillRect(0, GAME_H / 2 - 44, GAME_W, 52);
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, GAME_H / 2 - 44); ctx.lineTo(GAME_W, GAME_H / 2 - 44); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, GAME_H / 2 + 8);  ctx.lineTo(GAME_W, GAME_H / 2 + 8);  ctx.stroke();
      ctx.font = "bold 22px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = '#2d6a4f';
      ctx.fillText('Karakter değişti!', GAME_W / 2, GAME_H / 2 - 18);
      ctx.font = "18px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText(label, GAME_W / 2, GAME_H / 2 + 2);
      ctx.textAlign = 'left';
      ctx.restore();
      gs.current.labelFrames--;
    };

    const drawGameOver = (score) => {
      ctx.drawImage(paperCv, 0, 0);
      wobblyRect(ctx, 38, GAME_H / 2 - 64, GAME_W - 76, 130, '#1a1a1a', 'rgba(247,243,235,0.96)');
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font      = "bold 26px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = '#e63946';
      ctx.fillText('Oyun Bitti!', GAME_W / 2, GAME_H / 2 - 22);
      ctx.font      = "20px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText(`Skor: ${score}`, GAME_W / 2, GAME_H / 2 + 10);
      ctx.font      = "14px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = '#555';
      ctx.fillText('(yeniden başlamak için tıkla)', GAME_W / 2, GAME_H / 2 + 40);
      ctx.textAlign = 'left';
      ctx.restore();
    };

    let animId;
    const loop = () => {
      const { player: p, platforms } = gs.current;

      p.vy += 0.22;
      p.y  += p.vy;
      if (p.x + p.w < 0) p.x = GAME_W;
      if (p.x > GAME_W)   p.x = -p.w;

      platforms.forEach(pl => {
        if (
          p.vy > 0 &&
          p.x + p.w > pl.x && p.x < pl.x + pl.w &&
          p.y + p.h > pl.y && p.y + p.h < pl.y + pl.h + 14
        ) {
          if (pl.type === 'cracked') {
            pl.broken = (pl.broken || 0) + 1;
            if (pl.broken > 1) return;
          }
          p.vy = pl.type === 'spring' ? -14 : -9;
          burst(p.x + p.w / 2, pl.y, PLAT_COLORS[pl.type].stroke);
        }
      });

      if (p.y < 200) {
        const delta = 200 - p.y;
        p.y = 200;
        platforms.forEach(pl => {
          pl.y += delta;
          if (pl.y > GAME_H + 20) {
            Object.assign(pl, makePlat(20 + Math.random() * (GAME_W - 90), -15));
            pl.broken = 0;
            gs.current.score += 10;
          }
        });
      }

      const newCharIndex = getCharIndex(gs.current.score);
      if (newCharIndex !== gs.current.charIndex) {
        gs.current.charIndex   = newCharIndex;
        gs.current.labelFrames = 120;
      }

      if (p.y > GAME_H + 60) {
        if (!gs.current.dead) {
          gs.current.dead = true;
          drawGameOver(gs.current.score);
          onGameOver(gs.current.score);
        }
        return;
      }

      ctx.drawImage(paperCv, 0, 0);
      platforms.forEach(pl => { if (!(pl.broken > 1)) drawPlat(pl); });

      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.1; pt.life -= 0.065;
        if (pt.life <= 0) { particles.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = pt.life;
        ctx.fillStyle   = pt.color;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      drawPlayer(p);
      drawScore(gs.current.score);
      drawCharLabel();
      animId = requestAnimationFrame(loop);
    };

    // Mouse/touch: CSS px  oyun koordinatı
    const toGameX = (clientX) => {
      const rect  = canvas.getBoundingClientRect();
      const ratio = GAME_W / rect.width;
      return (clientX - rect.left) * ratio;
    };
    const onMouseMove = (e) => { gs.current.player.x = toGameX(e.clientX) - gs.current.player.w / 2; };
    const onTouch     = (e) => { gs.current.player.x = toGameX(e.touches[0].clientX) - gs.current.player.w / 2; };
    const onClick     = ()  => { if (gs.current.dead) { reset(); loop(); } };

    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouch, { passive: true });
    canvas.addEventListener('click', onClick);
    loop();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('click', onClick);
      cancelAnimationFrame(animId);
    };
  }, [onGameOver]);

  return (
    <canvas
      ref={canvasRef}
      className="hj-canvas"
      width={GAME_W}
      height={GAME_H}
      style={{ cursor: 'none' }}
    />
  );
};

export default DoodleCanvas;