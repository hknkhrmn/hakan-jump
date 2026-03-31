import { Router } from 'express';
const router = Router();
import { getScores, saveScore } from '../controllers/scoreController';

// GET isteği gelirse skorları getir
router.get('/', getScores);

// POST isteği gelirse yeni skor kaydet
router.post('/', saveScore);

export default router;