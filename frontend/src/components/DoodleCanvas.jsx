import React, { useRef, useEffect } from "react";
import { bgMusic, bounceSound, fallSound } from "../utils/audio";

const jitter = (n, a = 1.8) => n + (Math.random() - 0.5) * a;

const wobblyRect = (ctx, x, y, w, h, stroke, fill) => {
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(jitter(x), jitter(y));
  ctx.lineTo(jitter(x + w), jitter(y));
  ctx.lineTo(jitter(x + w), jitter(y + h));
  ctx.lineTo(jitter(x), jitter(y + h));
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.stroke();
  ctx.restore();
};

const PLAT_COLORS = {
  normal: { stroke: "#2d6a4f", fill: "#b7e4c7" },
  spring: { stroke: "#b5451b", fill: "#f4a261" },
  cracked: { stroke: "#6b6b6b", fill: "#d6d6d6" },
};

const GAME_W = 350;
const GAME_H = 550;

const CHARACTERS = [
  { src: "/hakan1.svg", label: "🔒 Güvenlik Hakanı", minScore: 0 },
  { src: "/hakan2.svg", label: "⚙️ Mühendis Hakanı", minScore: 1000 },
  { src: "/hakan3.svg", label: "💻 Frontend Hakanı", minScore: 2000 },
];

const getCharIndex = (score) => {
  if (score >= 2000) return 2;
  if (score >= 1000) return 1;
  return 0;
};

const DoodleCanvas = ({ onGameOver }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const gs = useRef({
    player: { x: 135, y: 420, w: 75, h: 75, vy: 0, vx: 0 },
    platforms: [],
    score: 0,
    dead: false,
    charIndex: 0,
    labelFrames: 0,
    lastTime: 0, // FPS bağımsızlığı için zaman takibi
  });

  const touchState = useRef({
    isTouching: false,
    lastX: 0,
    sensitivity: 0.15,
  });

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const canvasElement = canvasRef.current;
    const ctx = canvasElement.getContext("2d");

    canvasElement.width = GAME_W;
    canvasElement.height = GAME_H;

    const paperCv = document.createElement("canvas");
    paperCv.width = GAME_W;
    paperCv.height = GAME_H;
    const pCtx = paperCv.getContext("2d");
    pCtx.fillStyle = "#f7f3eb";
    pCtx.fillRect(0, 0, GAME_W, GAME_H);
    for (let ly = 32; ly < GAME_H; ly += 32) {
      pCtx.strokeStyle = "rgba(160,185,210,0.30)";
      pCtx.lineWidth = 0.7;
      pCtx.beginPath();
      pCtx.moveTo(0, ly);
      pCtx.lineTo(GAME_W, ly);
      pCtx.stroke();
    }
    pCtx.strokeStyle = "rgba(210,90,90,0.22)";
    pCtx.lineWidth = 1.5;
    pCtx.beginPath();
    pCtx.moveTo(30, 0);
    pCtx.lineTo(30, GAME_H);
    pCtx.stroke();

    const imgs = CHARACTERS.map(({ src }) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const TYPES = ["normal", "normal", "normal", "spring", "cracked"];
    const makePlat = (x, y) => ({
      x,
      y,
      w: 52 + Math.random() * 22,
      h: 10,
      type: TYPES[Math.floor(Math.random() * TYPES.length)],
    });

    const reset = () => {
      gs.current.score = 0;
      gs.current.dead = false;
      gs.current.charIndex = 0;
      gs.current.labelFrames = 0;
      gs.current.lastTime = performance.now(); // Zamanı sıfırla
      gs.current.player = { x: 135, y: 420, w: 75, h: 75, vy: 0, vx: 0 };
      gs.current.platforms = [
        { x: 110, y: 490, w: 80, h: 10, type: "normal" },
        ...Array.from({ length: 6 }, (_, i) =>
          makePlat(20 + Math.random() * (GAME_W - 90), 400 - i * 80),
        ),
      ];
    };
    reset();

    const particles = [];
    const burst = (x, y, color) => {
      for (let i = 0; i < 6; i++) {
        particles.push({
          x,
          y,
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
      if (p.type === "spring") {
        ctx.save();
        ctx.strokeStyle = "#9b2226";
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        const cx = p.x + p.w / 2;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(cx + (i % 2 === 0 ? -4 : 4), p.y - i * 3);
          ctx.lineTo(cx + (i % 2 === 0 ? 4 : -4), p.y - i * 3 - 3);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (p.type === "cracked") {
        ctx.save();
        ctx.strokeStyle = "#888";
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

    const drawPlayer = (p) => {
      const img = imgs[gs.current.charIndex];
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, p.x, p.y, p.w, p.h);
      } else {
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2, r = p.w / 2;
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    };

    const drawScore = (score) => {
      ctx.font = "bold 18px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = "#1a1a1a";
      ctx.fillText(`⭐ ${score}`, 36, 26);
    };

    const drawCharLabel = () => {
      const { charIndex, labelFrames } = gs.current;
      if (labelFrames <= 0) return;
      const label = CHARACTERS[charIndex].label;
      const alpha = Math.min(labelFrames / 40, 1);
      const fadeOut = Math.min(labelFrames / 20, 1);
      ctx.save();
      ctx.globalAlpha = Math.min(alpha, fadeOut);
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(247,243,235,0.92)";
      ctx.fillRect(0, GAME_H / 2 - 44, GAME_W, 52);
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, GAME_H / 2 - 44); ctx.lineTo(GAME_W, GAME_H / 2 - 44); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, GAME_H / 2 + 8); ctx.lineTo(GAME_W, GAME_H / 2 + 8); ctx.stroke();
      ctx.font = "bold 22px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = "#2d6a4f";
      ctx.fillText("Karakter değişti!", GAME_W / 2, GAME_H / 2 - 18);
      ctx.font = "18px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = "#1a1a1a";
      ctx.fillText(label, GAME_W / 2, GAME_H / 2 + 2);
      ctx.textAlign = "left";
      ctx.restore();
      gs.current.labelFrames--;
    };

    const drawGameOver = (score) => {
      ctx.drawImage(paperCv, 0, 0);
      wobblyRect(ctx, 38, GAME_H / 2 - 64, GAME_W - 76, 130, "#1a1a1a", "rgba(247,243,235,0.96)");
      ctx.textAlign = "center";
      ctx.font = "bold 26px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = "#e63946";
      ctx.fillText("Oyun Bitti!", GAME_W / 2, GAME_H / 2 - 22);
      ctx.font = "20px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = "#1a1a1a";
      ctx.fillText(`Skor: ${score}`, GAME_W / 2, GAME_H / 2 + 10);
      ctx.font = "14px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = "#555";
      ctx.fillText("(yeniden başlamak için tıkla)", GAME_W / 2, GAME_H / 2 + 40);
      ctx.textAlign = "left";
    };

    const startBgMusic = async () => {
      if (bgMusic.paused) {
        bgMusic.currentTime = 0;
        bgMusic.play().catch((e) => console.warn("Müzik başlatılamadı:", e));
      } else {
        bgMusic.currentTime = 0;
      }
    };

    let animId;
    const loop = () => {
      const { player: p, platforms } = gs.current;

      // --- DELTA TIME HESAPLAMA ---
      const now = performance.now();
      const deltaTime = (now - gs.current.lastTime) / 1000;
      gs.current.lastTime = now;
      const dt = Math.min(deltaTime, 0.1); // Sekme değişiminde fırlamayı önle
      const timeStep = dt * 60; // 60 FPS bazlı katsayı
      // ----------------------------

      p.x += p.vx * timeStep;
      p.vy += (isMobile ? 0.12 : 0.22) * timeStep;
      p.y += p.vy * timeStep;

      const maxSpeed = isMobile ? 3.5 : 5;
      if (p.vx > maxSpeed) p.vx = maxSpeed;
      if (p.vx < -maxSpeed) p.vx = -maxSpeed;

      if (!touchState.current.isTouching) {
        p.vx *= Math.pow(0.98, timeStep); // Sürtünmeyi zamanla uyarla
        if (Math.abs(p.vx) < 0.1) p.vx = 0;
      }

      if (p.x + p.w < 0) p.x = GAME_W;
      if (p.x > GAME_W) p.x = -p.w;

      platforms.forEach((pl) => {
        if (
          p.vy > 0 &&
          p.x + p.w > pl.x &&
          p.x < pl.x + pl.w &&
          p.y + p.h > pl.y &&
          p.y + p.h < pl.y + pl.h + 14
        ) {
          if (pl.type === "cracked") {
            pl.broken = (pl.broken || 0) + 1;
            if (pl.broken > 1) return;
          }
          p.vy = pl.type === "spring"
              ? (isMobile ? -10 : -14)
              : (isMobile ? -6.5 : -9);
          burst(p.x + p.w / 2, pl.y, PLAT_COLORS[pl.type].stroke);
          bounceSound.currentTime = 0;
          bounceSound.play().catch((e) => console.warn("Bounce sesi çalınamadı:", e));
        }
      });

      if (p.y < 200) {
        const delta = 200 - p.y;
        p.y = 200;
        platforms.forEach((pl) => {
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
        gs.current.charIndex = newCharIndex;
        gs.current.labelFrames = 120;
      }

      if (p.y > GAME_H + 60) {
        if (!gs.current.dead) {
          gs.current.dead = true;
          fallSound.currentTime = 0;
          fallSound.play().catch((e) => console.warn("Fall sesi çalınamadı:", e));
          bgMusic.pause();
          drawGameOver(gs.current.score);
          onGameOver(gs.current.score);
        }
        return;
      }

      ctx.drawImage(paperCv, 0, 0);
      platforms.forEach((pl) => { if (!(pl.broken > 1)) drawPlat(pl); });

      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx * timeStep;
        pt.y += pt.vy * timeStep;
        pt.vy += 0.1 * timeStep;
        pt.life -= 0.065 * timeStep;
        if (pt.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = pt.life;
        ctx.fillStyle = pt.color;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }

      drawPlayer(p);
      drawScore(gs.current.score);
      drawCharLabel();
      animId = requestAnimationFrame(loop);
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      touchState.current.isTouching = true;
      touchState.current.lastX = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (!touchState.current.isTouching) return;
      const currentX = e.touches[0].clientX;
      const deltaX = currentX - touchState.current.lastX;
      gs.current.player.vx += deltaX * touchState.current.sensitivity;
      const touchMaxSpeed = isMobile ? 4 : 6;
      if (gs.current.player.vx > touchMaxSpeed) gs.current.player.vx = touchMaxSpeed;
      if (gs.current.player.vx < -touchMaxSpeed) gs.current.player.vx = -touchMaxSpeed;
      touchState.current.lastX = currentX;
    };

    const handleTouchEnd = (e) => { e.preventDefault(); touchState.current.isTouching = false; };

    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") gs.current.player.vx = -5;
      if (e.key === "ArrowRight" || e.key === "d") gs.current.player.vx = 5;
    };
    const onKeyUp = (e) => {
      if (["ArrowLeft", "ArrowRight", "a", "d"].includes(e.key)) gs.current.player.vx = 0;
    };

    const onClick = async () => {
      if (gs.current.dead) {
        reset();
        await startBgMusic();
        loop();
      }
    };

    canvasElement.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvasElement.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvasElement.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvasElement.addEventListener("click", onClick);

    startBgMusic();
    loop();

    return () => {
      canvasElement.removeEventListener("touchstart", handleTouchStart);
      canvasElement.removeEventListener("touchmove", handleTouchMove);
      canvasElement.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvasElement.removeEventListener("click", onClick);
      cancelAnimationFrame(animId);
      bgMusic.pause();
    };
  }, [onGameOver]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#eee8d8" }}>
      <canvas ref={canvasRef} width={GAME_W} height={GAME_H} style={{ width: "auto", height: "100%", maxWidth: "100%", objectFit: "contain", cursor: "none", touchAction: "none" }} />
    </div>
  );
};

export default DoodleCanvas;