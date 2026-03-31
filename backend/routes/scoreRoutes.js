import { Router } from 'express';
const router = Router();
import { getScores, saveScore } from '../controllers/scoreController';

router.get('/', getScores);
router.post('/', saveScore);

export default router;