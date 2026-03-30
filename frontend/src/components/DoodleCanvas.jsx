import React, { useRef, useEffect } from 'react';

// ── Küçük rastgele sapma — el çizimi hissi ───────────────────────────────────
const jitter = (n, a = 1.8) => n + (Math.random() - 0.5) * a;

// ── Hafif yamuk dikdörtgen ───────────────────────────────────────────────────
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

// ── Platform çeşidi renkleri ─────────────────────────────────────────────────
const PLAT_COLORS = {
  normal:  { stroke: '#2d6a4f', fill: '#b7e4c7' },
  spring:  { stroke: '#b5451b', fill: '#f4a261' },
  cracked: { stroke: '#6b6b6b', fill: '#d6d6d6' },
};

const DoodleCanvas = ({ onGameOver }) => {
  const canvasRef = useRef(null);

  const gs = useRef({
    player: { x: 140, y: 440, w: 36, h: 36, vy: 0 },
    platforms: [],
    score: 0,
    dead: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // ── Oyuncu görseli ───────────────────────────────────────────────────────
    const img = new Image();
    img.src = '/me.png';

    // ── Kağıt arka plan (bir kez üret) ──────────────────────────────────────
    const paperCv = document.createElement('canvas');
    paperCv.width = W; paperCv.height = H;
    const pCtx = paperCv.getContext('2d');
    pCtx.fillStyle = '#f7f3eb';
    pCtx.fillRect(0, 0, W, H);
    // Defter yatay çizgileri
    for (let ly = 32; ly < H; ly += 32) {
      pCtx.strokeStyle = 'rgba(160,185,210,0.30)';
      pCtx.lineWidth = 0.7;
      pCtx.beginPath(); pCtx.moveTo(0, ly); pCtx.lineTo(W, ly); pCtx.stroke();
    }
    // Sol kırmızı kenar
    pCtx.strokeStyle = 'rgba(210,90,90,0.22)';
    pCtx.lineWidth = 1.5;
    pCtx.beginPath(); pCtx.moveTo(30, 0); pCtx.lineTo(30, H); pCtx.stroke();

    // ── Platform fabrikası ───────────────────────────────────────────────────
    const TYPES = ['normal','normal','normal','spring','cracked'];
    const makePlat = (x, y) => ({
      x, y,
      w: 52 + Math.random() * 22,
      h: 10,
      type: TYPES[Math.floor(Math.random() * TYPES.length)],
    });

    // Başlangıç reset
    const reset = () => {
      gs.current.score = 0;
      gs.current.dead = false;
      gs.current.player = { x: 135, y: 440, w: 36, h: 36, vy: 0 };
      gs.current.platforms = [
        { x: 110, y: 490, w: 80, h: 10, type: 'normal' },
        ...Array.from({ length: 6 }, (_, i) =>
          makePlat(20 + Math.random() * (W - 90), 400 - i * 80)
        ),
      ];
    };
    reset();

    // ── Parçacıklar ──────────────────────────────────────────────────────────
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

    // ── Platform çiz ─────────────────────────────────────────────────────────
    const drawPlat = (p) => {
      const { stroke, fill } = PLAT_COLORS[p.type];
      wobblyRect(ctx, p.x, p.y, p.w, p.h, stroke, fill);

      if (p.type === 'spring') {
        // Küçük yay işareti
        ctx.save();
        ctx.strokeStyle = '#9b2226';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
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
        // Çatlak çizgileri
        ctx.save();
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x + p.w * 0.35, p.y);
        ctx.lineTo(p.x + p.w * 0.45, p.y + p.h);
        ctx.moveTo(p.x + p.w * 0.6, p.y);
        ctx.lineTo(p.x + p.w * 0.52, p.y + p.h);
        ctx.stroke();
        ctx.restore();
      }
    };

    // ── Oyuncu çiz ───────────────────────────────────────────────────────────
    const drawPlayer = (p) => {
      const cx = p.x + p.w / 2, cy = p.y + p.h / 2, r = p.w / 2;

      if (img.complete && img.naturalWidth > 0) {
        // Yuvarlak kırp
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, p.x, p.y, p.w, p.h);
        ctx.restore();
        // El çizimi daire çerçeve
        ctx.save();
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(jitter(cx, 0.6), jitter(cy, 0.6), r + 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else {
        // Fallback: basit yüz
        ctx.save();
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath(); ctx.arc(cx - 5, cy - 3, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 5, cy - 3, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, cy + 2, 5, 0.15, Math.PI - 0.15); ctx.stroke();
        ctx.restore();
      }
    };

    // ── Skor çiz ─────────────────────────────────────────────────────────────
    const drawScore = (score) => {
      ctx.save();
      ctx.font = "bold 18px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText(`⭐ ${score}`, 36, 26);
      ctx.restore();
    };

    // ── Game Over ekranı ─────────────────────────────────────────────────────
    const drawGameOver = (score) => {
      ctx.drawImage(paperCv, 0, 0);
      wobblyRect(ctx, 38, H / 2 - 64, W - 76, 130, '#1a1a1a', 'rgba(247,243,235,0.96)');
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = "bold 26px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = '#e63946';
      ctx.fillText('Oyun Bitti!', W / 2, H / 2 - 22);
      ctx.font = "20px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText(`Skor: ${score}`, W / 2, H / 2 + 10);
      ctx.font = "14px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = '#555';
      ctx.fillText('(yeniden başlamak için tıkla)', W / 2, H / 2 + 40);
      ctx.textAlign = 'left';
      ctx.restore();
    };

    // ── Ana döngü ────────────────────────────────────────────────────────────
    let animId;
    const loop = () => {
      const { player: p, platforms } = gs.current;

      // Fizik
      p.vy += 0.22;
      p.y  += p.vy;
      // Ekran kenarı sarma
      if (p.x + p.w < 0) p.x = W;
      if (p.x > W)        p.x = -p.w;

      // Çarpışma
      platforms.forEach(pl => {
        if (
          p.vy > 0 &&
          p.x + p.w > pl.x && p.x < pl.x + pl.w &&
          p.y + p.h > pl.y && p.y + p.h < pl.y + pl.h + 14
        ) {
          if (pl.type === 'cracked') {
            // Çatlak platform bir kez kullanılabilir
            pl.broken = (pl.broken || 0) + 1;
            if (pl.broken > 1) return;
          }
          const power = pl.type === 'spring' ? -14 : -9;
          p.vy = power;
          burst(p.x + p.w / 2, pl.y, PLAT_COLORS[pl.type].stroke);
        }
      });

      // Kamera
      if (p.y < 200) {
        const delta = 200 - p.y;
        p.y = 200;
        platforms.forEach(pl => {
          pl.y += delta;
          if (pl.y > H + 20) {
            Object.assign(pl, makePlat(20 + Math.random() * (W - 90), -15));
            pl.broken = 0;
            gs.current.score += 10;
          }
        });
      }

      // Ölüm
      if (p.y > H + 60) {
        if (!gs.current.dead) {
          gs.current.dead = true;
          drawGameOver(gs.current.score);
          onGameOver(gs.current.score);
        }
        return;
      }

      // ── Render ───────────────────────────────────────────────────────────
      ctx.drawImage(paperCv, 0, 0);

      platforms.forEach(pl => {
        if (!(pl.broken > 1)) drawPlat(pl);
      });

      // Parçacıklar
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.1; pt.life -= 0.065;
        if (pt.life <= 0) { particles.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = pt.life;
        ctx.fillStyle = pt.color;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      drawPlayer(p);
      drawScore(gs.current.score);

      animId = requestAnimationFrame(loop);
    };

    // ── Mouse / touch kontrolü ───────────────────────────────────────────────
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      gs.current.player.x = ((e.clientX - rect.left) / rect.width) * W - 18;
    };
    const onTouch = (e) => {
      const rect = canvas.getBoundingClientRect();
      gs.current.player.x = ((e.touches[0].clientX - rect.left) / rect.width) * W - 18;
    };
    const onClick = () => {
      if (gs.current.dead) { reset(); loop(); }
    };

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
      width={350}
      height={550}
      style={{ cursor: 'none', display: 'block' }}
    />
  );
};

export default DoodleCanvas;