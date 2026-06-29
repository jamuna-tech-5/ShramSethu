import { Router } from 'express';
import { applyForLoan, getLoanApplications } from '../controllers/loan.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize('WORKER'), getLoanApplications);
router.post('/', authenticate, authorize('WORKER'), applyForLoan);

export default router;