import { Router } from 'express';
import { createReview, getReviews } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createReview);
router.get('/:userId', getReviews);

export default router;