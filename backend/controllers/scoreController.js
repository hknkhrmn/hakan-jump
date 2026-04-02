// Score modelini içe aldık
const Score = require('../models/Score');

// Tüm skorları büyükten küçüğe sırala
// Max 10 kayıt şeklinde yapıldı limit 10 vererek
exports.getScores = async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 }).limit(10);
    res.json(scores);
  } catch (err) {
    // Hata alınması durumunda 
    res.status(500).json({ message: "Skorlar alınamadı" });
  }
};

// Yeni skor kaydet 
exports.saveScore = async (req, res) => {
  const { name, score } = req.body;
  try {
    const newScore = new Score({ name, score });
    await newScore.save(); // MongoDb ye yaz 
    res.status(201).json(newScore); // Kayıt başarıyla oluşturuldu
  } catch (err) {
    // Geçersiz veri yada validasyon hatası
    res.status(400).json({ message: "Skor kaydedilemedi" });
  }
};