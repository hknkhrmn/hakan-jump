import React, { useRef, useEffect } from 'react';
import { bgMusic, bounceSound, fallSound } from '../utils/audio';

// Koordinata küçük rastgele sapma ekle — el çizimi hissi için
const jitter = (n, a = 1.8) => n + (Math.random() - 0.5) * a;

// Hafif yamuk (handmade görünümlü) dikdörtgen çiz
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

// Platform tiplerinin renk tanımları
const PLAT_COLORS = {
  normal:  { stroke: '#2d6a4f', fill: '#b7e4c7' }, // yeşil — standart
  spring:  { stroke: '#b5451b', fill: '#f4a261' }, // turuncu — süper zıplama
  cracked: { stroke: '#6b6b6b', fill: '#d6d6d6' }, // gri — bir kez kullanılabilir
};

// Oyun koordinat uzayı — CSS boyutundan bağımsız, sabit
const GAME_W = 350;
const GAME_H = 550;

// 3 Hakan karakteri ve hangi skorda devreye girdikleri
const CHARACTERS = [
  { src: '/hakan1.svg', label: '🔒 Güvenlik Hakanı', minScore: 0    },
  { src: '/hakan2.svg', label: '⚙️ Mühendis Hakanı', minScore: 1000 },
  { src: '/hakan3.svg', label: '💻 Frontend Hakanı', minScore: 2000 },
];

// Skora göre aktif karakter indeksini döner
const getCharIndex = (score) => {
  if (score >= 2000) return 2;
  if (score >= 1000) return 1;
  return 0;
};

const DoodleCanvas = ({ onGameOver }) => {
  const canvasRef = useRef(null);

  // Oyun state'i ref'te tutulur — her frame değiştiği için useState kullanmak
  // gereksiz render'a yol açar, useRef ile React'tan bağımsız tutulur
  const gs = useRef({
    player: { x: 135, y: 420, w: 75, h: 75, vy: 0, vx: 0 }, // vx: yatay hız
    platforms: [],
    score: 0,
    dead: false,
    charIndex: 0,
    labelFrames: 0, // karakter değişim bildiriminin kalan frame sayısı
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    // canvas.width/height = oyun koordinat uzayı (sabit)
    // Görsel boyut global.css'teki .hj-canvas sınıfı tarafından yönetilir
    canvas.width  = GAME_W;
    canvas.height = GAME_H;

    // Kağıt arka planı bir kez üret — her frame yeniden çizmek yerine
    // bu offscreen canvas'ı drawImage ile yapıştır (performans)
    const paperCv  = document.createElement('canvas');
    paperCv.width  = GAME_W;
    paperCv.height = GAME_H;
    const pCtx     = paperCv.getContext('2d');
    pCtx.fillStyle = '#f7f3eb';
    pCtx.fillRect(0, 0, GAME_W, GAME_H);
    // Defter yatay çizgileri
    for (let ly = 32; ly < GAME_H; ly += 32) {
      pCtx.strokeStyle = 'rgba(160,185,210,0.30)';
      pCtx.lineWidth   = 0.7;
      pCtx.beginPath(); pCtx.moveTo(0, ly); pCtx.lineTo(GAME_W, ly); pCtx.stroke();
    }
    // Sol kırmızı defter kenar çizgisi
    pCtx.strokeStyle = 'rgba(210,90,90,0.22)';
    pCtx.lineWidth   = 1.5;
    pCtx.beginPath(); pCtx.moveTo(30, 0); pCtx.lineTo(30, GAME_H); pCtx.stroke();

    // 3 karakter görselini önceden yükle — oyun sırasında bekleme olmasın
    const imgs = CHARACTERS.map(({ src }) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    // Platform tipi havuzu — normal ağırlıklı dağılım
    const TYPES    = ['normal', 'normal', 'normal', 'spring', 'cracked'];
    const makePlat = (x, y) => ({
      x, y,
      w: 52 + Math.random() * 22, // genişlik biraz rastgele
      h: 10,
      type: TYPES[Math.floor(Math.random() * TYPES.length)],
    });

    // Oyunu başa sıfırla — yeni oyun veya ölüm sonrası
    const reset = () => {
      gs.current.score       = 0;
      gs.current.dead        = false;
      gs.current.charIndex   = 0;
      gs.current.labelFrames = 0;
      gs.current.player      = { x: 135, y: 420, w: 75, h: 75, vy: 0, vx: 0 };
      gs.current.platforms   = [
        { x: 110, y: 490, w: 80, h: 10, type: 'normal' }, // başlangıçta garantili platform
        ...Array.from({ length: 6 }, (_, i) =>
          makePlat(20 + Math.random() * (GAME_W - 90), 400 - i * 80)
        ),
      ];
    };
    reset();

    // Zıplayınca çıkan parçacık efekti listesi
    const particles = [];
    const burst = (x, y, color) => {
      for (let i = 0; i < 6; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 3.5,
          vy: -Math.random() * 2.5 - 0.5,
          life: 1,           // 1'den 0'a azalır, 0'da yok olur
          r: Math.random() * 3 + 1,
          color,
        });
      }
    };

    // Platform çiz — tipine göre ek detay ekle
    const drawPlat = (p) => {
      const { stroke, fill } = PLAT_COLORS[p.type];
      wobblyRect(ctx, p.x, p.y, p.w, p.h, stroke, fill);

      // Spring platformu: üstüne yay işareti ekle
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

      // Cracked platform: üstüne çatlak çizgileri ekle
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

    // Oyuncuyu çiz — aktif karakterin SVG görseli, yüklenmediyse fallback daire
    const drawPlayer = (p) => {
      const img = imgs[gs.current.charIndex];
      if (img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.drawImage(img, p.x, p.y, p.w, p.h);
        ctx.restore();
      } else {
        // Görsel henüz yüklenmediyse geçici daire göster
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2, r = p.w / 2;
        ctx.save();
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.restore();
      }
    };

    // Sol üst köşeye mevcut skoru yaz
    const drawScore = (score) => {
      ctx.save();
      ctx.font      = "bold 18px 'Caveat', cursive, sans-serif";
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText(`⭐ ${score}`, 36, 26);
      ctx.restore();
    };

    // Karakter değişim bildirimi — ~2 saniye boyunca fade in/out göster
    const drawCharLabel = () => {
      const { charIndex, labelFrames } = gs.current;
      if (labelFrames <= 0) return;
      const label   = CHARACTERS[charIndex].label;
      const alpha   = Math.min(labelFrames / 40, 1);  // ilk 40 frame: fade in
      const fadeOut = Math.min(labelFrames / 20, 1);  // son 20 frame: fade out
      ctx.save();
      ctx.globalAlpha = Math.min(alpha, fadeOut);
      ctx.textAlign   = 'center';
      // Yarı saydam arka plan bandı
      ctx.fillStyle = 'rgba(247,243,235,0.92)';
      ctx.fillRect(0, GAME_H / 2 - 44, GAME_W, 52);
      // Üst ve alt kenarlık çizgileri
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
      gs.current.labelFrames--; // her frame bir azalt
    };

    // Oyun bitti ekranı — kağıt üzerine sonuç kutusu çiz
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

    // Arka plan müziğini başlat — zaten çalıyorsa başa sar
    const startBgMusic = async () => {
      if (bgMusic.paused) {
        bgMusic.currentTime = 0;
        bgMusic.play().catch(e => console.warn('Müzik başlatılamadı:', e));
      } else {
        bgMusic.currentTime = 0;
      }
    };

    // ── Ana oyun döngüsü ──────────────────────────────────────────────────────
    let animId;
    const loop = () => {
      const { player: p, platforms } = gs.current;

      // Yatay hareketi vx'ten uygula
      // Masaüstü: klavye listener'ı vx'i set eder
      // Mobil: gyroscope veya dokunma listener'ı vx'i set eder
      p.x += p.vx;

      // Yerçekimi uygula ve dikey pozisyonu güncelle
      p.vy += 0.22;
      p.y  += p.vy;

      // Ekran kenarı sarma — soldan çıkarsa sağdan, sağdan çıkarsa soldan girer
      if (p.x + p.w < 0)  p.x = GAME_W;      // sol kenardan çıktı → sağdan gir
      if (p.x > GAME_W)    p.x = -p.w;        // sağ kenardan çıktı → soldan gir

      // Platform çarpışma kontrolü
      platforms.forEach(pl => {
        if (
          p.vy > 0 &&                                       // sadece düşerken çarp
          p.x + p.w > pl.x && p.x < pl.x + pl.w &&         // yatay çakışma
          p.y + p.h > pl.y && p.y + p.h < pl.y + pl.h + 14 // dikey çakışma
        ) {
          // Cracked platform: ikinci çarpışmada kırılır, zıplamaz
          if (pl.type === 'cracked') {
            pl.broken = (pl.broken || 0) + 1;
            if (pl.broken > 1) return;
          }
          // Zıplama gücü: spring daha yüksek fırlatır
          p.vy = pl.type === 'spring' ? -14 : -9;
          burst(p.x + p.w / 2, pl.y, PLAT_COLORS[pl.type].stroke);

          // Zıplama sesi çal
          bounceSound.currentTime = 0;
          bounceSound.play().catch(e => console.warn('Bounce sesi çalınamadı:', e));
        }
      });

      // Kamera: oyuncu üst bölgeye girince platformları aşağı kaydır
      if (p.y < 200) {
        const delta = 200 - p.y;
        p.y = 200;
        platforms.forEach(pl => {
          pl.y += delta;
          // Ekran dışına çıkan platformu tepeden yeniden üret
          if (pl.y > GAME_H + 20) {
            Object.assign(pl, makePlat(20 + Math.random() * (GAME_W - 90), -15));
            pl.broken = 0;
            gs.current.score += 10; // her geçilen platform 10 puan
          }
        });
      }

      // Skor eşiği geçilince karakter değiştir
      const newCharIndex = getCharIndex(gs.current.score);
      if (newCharIndex !== gs.current.charIndex) {
        gs.current.charIndex   = newCharIndex;
        gs.current.labelFrames = 120; // ~2 saniye bildirim göster (60fps)
      }

      // Oyun bitti: oyuncu ekranın altından düştü
      if (p.y > GAME_H + 60) {
        if (!gs.current.dead) {
          gs.current.dead = true;
          fallSound.currentTime = 0;
          fallSound.play().catch(e => console.warn('Fall sesi çalınamadı:', e));
          bgMusic.pause();
          drawGameOver(gs.current.score);
          onGameOver(gs.current.score); // App.jsx'e skoru bildir
        }
        return; // döngüyü durdur
      }

      // ── Render ─────────────────────────────────────────────────────────────
      ctx.drawImage(paperCv, 0, 0); // kağıt arka planı yapıştır

      // Kırılmamış platformları çiz
      platforms.forEach(pl => { if (!(pl.broken > 1)) drawPlat(pl); });

      // Parçacıkları güncelle ve çiz
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx; pt.y += pt.vy;
        pt.vy += 0.1;       // parçacıklara da yerçekimi
        pt.life -= 0.065;   // zamanla solar
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
      animId = requestAnimationFrame(loop); // sonraki frame'i planla
    };

    // ── KONTROLLER ────────────────────────────────────────────────────────────

    // Masaüstü: klavye kontrolü
    // A / ArrowLeft → sola, D / ArrowRight → sağa, tuş bırakılınca dur
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft'  || e.key === 'a') gs.current.player.vx = -5;
      if (e.key === 'ArrowRight' || e.key === 'd') gs.current.player.vx =  5;
    };
    const onKeyUp = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) {
        gs.current.player.vx = 0;
      }
    };

    // Click: oyun bittikten sonra yeniden başlat
    const onClick = async () => {
      if (gs.current.dead) {
        reset();
        await startBgMusic();
        loop();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    canvas.addEventListener('click', onClick);

    startBgMusic();
    loop();

    // Component unmount olunca temizlik yap — bellek sızıntısı önle
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
      canvas.removeEventListener('click', onClick);
      cancelAnimationFrame(animId);
      bgMusic.pause();
    };
  }, [onGameOver]);

  return (
    // Canvas + mobil ok butonları bir arada
    <div style={{ position: 'relative', lineHeight: 0, fontSize: 0 }}>
      {/* Oyun alanı — boyutlandırma .hj-canvas ile CSS tarafından yönetilir */}
      <canvas
        ref={canvasRef}
        className="hj-canvas"
        width={GAME_W}
        height={GAME_H}
        style={{ cursor: 'none' }}
      />

      {/* Mobil ok butonları — sadece dokunmatik ekranda görünür */}
      <div className="hj-mobile-controls">
        <button
          className="hj-arrow-btn"
          onTouchStart={(e) => { e.preventDefault(); gs.current.player.vx = -5; }}
          onTouchEnd={(e)   => { e.preventDefault(); gs.current.player.vx =  0; }}
        >
          ◀
        </button>
        <button
          className="hj-arrow-btn"
          onTouchStart={(e) => { e.preventDefault(); gs.current.player.vx =  5; }}
          onTouchEnd={(e)   => { e.preventDefault(); gs.current.player.vx =  0; }}
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default DoodleCanvas;