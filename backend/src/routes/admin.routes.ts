import { Router } from 'express';
import {
  getDashboardStats, getAllUsers, toggleUserStatus,
  verifyDocument, getAllJobs
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/documents/:id/verify', verifyDocument);
router.get('/jobs', getAllJobs);

export default router;