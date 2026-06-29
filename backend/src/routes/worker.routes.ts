import { Router } from 'express';
import {
  getWorkerProfile, updateWorkerProfile, recalculateGigScore,
  getWorkerEarnings, addWorkerSkill, removeWorkerSkill, searchWorkers
} from '../controllers/worker.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/search', authenticate, searchWorkers);
router.get('/profile', authenticate, authorize('WORKER'), getWorkerProfile);
router.get('/profile/:id', authenticate, getWorkerProfile);
router.put('/profile', authenticate, authorize('WORKER'), updateWorkerProfile);
router.post('/gigscore/recalculate', authenticate, authorize('WORKER'), recalculateGigScore);
router.get('/earnings', authenticate, authorize('WORKER'), getWorkerEarnings);
router.post('/skills', authenticate, authorize('WORKER'), addWorkerSkill);
router.delete('/skills/:skillId', authenticate, authorize('WORKER'), removeWorkerSkill);

export default router;