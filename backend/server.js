const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware (Ara Yazılımlar)
app.use(cors()); // Farklı portlardan (Frontend: 5173) gelen isteklere izin ver
app.use(express.json()); // Gelen JSON verilerini anlamamızı sağlar

// Basit bir veri saklama alanı (Şimdilik veritabanı yerine dizi kullanıyoruz)
let highScores = [
  { id: 1, name: "Hakan", score: 1250 },
  { id: 2, name: "Zıplayan Reis", score: 850 }
];

// --- ROTHALAR (ROUTES) ---

// 1. Tüm skorları getir (GET)
app.get('/api/scores', (req, res) => {
  // Skorları en yüksekten en düşüğe sıralayıp gönderelim
  const sorted = [...highScores].sort((a, b) => b.score - a.score);
  res.json(sorted);
});

// 2. Yeni skor kaydet (POST)
app.post('/api/scores', (req, res) => {
  const { name, score } = req.body;

  if (!name || score === undefined) {
    return res.status(400).json({ error: "İsim ve skor eksik!" });
  }

  const newEntry = {
    id: Date.now(), // Benzersiz bir ID için zaman damgası
    name: name,
    score: score
  };

  highScores.push(newEntry);
  
  // Sadece ilk 10 skoru tutalım (Listeyi şişirmeyelim)
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 10);

  console.log(`Yeni skor kaydedildi: ${name} - ${score}`);
  res.status(201).json(newEntry);
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`-----------------------------------------`);
  console.log(`SERVER HAZIR: http://localhost:${PORT}`);
  console.log(`-----------------------------------------`);
});