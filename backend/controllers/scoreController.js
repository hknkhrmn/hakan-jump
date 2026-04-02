// Score modelini içe aldık - DOSYA YOLUNA DİKKAT (küçük harf score)
const Score = require('../models/score');

// GET: Tüm skorları büyükten küçüğe sırala (İlk 10)
exports.getScores = async (req, res) => {
  try {
    // Veritabanında score alanına göre büyükten küçüğe (-1) sırala
    const scores = await Score.find().sort({ score: -1 }).limit(10);
    res.json(scores);
  } catch (err) {
    // 500 Hatası: Sunucu veritabanına ulaşamadığında buraya düşer
    res.status(500).json({ message: "Skorlar alınamadı", error: err.message });
  }
};

// POST: Yeni skor kaydet 
exports.saveScore = async (req, res) => {
  const { name, score } = req.body;

  // Gelen verinin boş olup olmadığını kontrol edelim (Opsiyonel ama iyi olur)
  if (!name || score === undefined) {
    return res.status(400).json({ message: "İsim ve skor alanları zorunludur." });
  }

  try {
    const newScore = new Score({ name, score });
    await newScore.save(); // MongoDB'ye yazma işlemi
    res.status(201).json(newScore); // Kayıt başarılı (201 Created)
  } catch (err) {
    // 400 Hatası: Veri formatı şemaya uymadığında buraya düşer
    res.status(400).json({ message: "Skor kaydedilemedi", error: err.message });
  }
};