const express = require('express');
const router = express.Router();
// Buradaki yolun küçük harf 'score' olduğundan emin ol:
const Score = require('../models/score'); 

// GET: Tüm skorları getir
router.get('/', async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 }).limit(10);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: "Skorlar alınamadı", error: err.message });
  }
});

// POST: Yeni skor kaydet
router.post('/', async (req, res) => {
  const { name, score } = req.body;
  try {
    const newScore = new Score({ name, score });
    await newScore.save();
    res.status(201).json(newScore);
  } catch (err) {
    res.status(400).json({ message: "Skor kaydedilemedi", error: err.message });
  }
});

module.exports = router;