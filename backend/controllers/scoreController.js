const Score = require('../models/Score');

exports.getScores = async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 }).limit(10);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: "Skorlar alınamadı" });
  }
};

exports.saveScore = async (req, res) => {
  const { name, score } = req.body;
  try {
    const newScore = new Score({ name, score });
    await newScore.save();
    res.status(201).json(newScore);
  } catch (err) {
    res.status(400).json({ message: "Skor kaydedilemedi" });
  }
};