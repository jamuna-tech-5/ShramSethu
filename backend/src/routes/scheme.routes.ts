import { Router } from 'express';
import { getSchemes, getEligibleSchemes, applyToScheme } from '../controllers/scheme.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getSchemes);
router.get('/eligible', authenticate, authorize('WORKER'), getEligibleSchemes);
router.post('/:schemeId/apply', authenticate, authorize('WORKER'), applyToScheme);

export default router;

