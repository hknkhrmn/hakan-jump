const express = require('express');
const router = express.Router();

// Controller'ları require ile dahil ediyoruz (import kullanmıyoruz)
const { getScores, saveScore } = require('../controllers/scoreController');

// GET isteği gelirse skorları getir
router.get('/', getScores);

// POST isteği gelirse yeni skor kaydet
router.post('/', saveScore);

module.exports = router;