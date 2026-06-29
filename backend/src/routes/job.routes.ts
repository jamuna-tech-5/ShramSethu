import { Router } from 'express';
import {
  createJob, getJobs, getJobById, updateJob,
  applyToJob, getMyApplications, updateApplicationStatus,
  completeJob, getCustomerJobs
} from '../controllers/job.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getJobs);
router.get('/my/posted', authenticate, authorize('CUSTOMER'), getCustomerJobs);
router.get('/my/applications', authenticate, authorize('WORKER'), getMyApplications);
router.post('/', authenticate, authorize('CUSTOMER'), createJob);
router.get('/:id', authenticate, getJobById);
router.put('/:id', authenticate, updateJob);
router.post('/:id/apply', authenticate, authorize('WORKER'), applyToJob);
router.post('/:id/complete', authenticate, authorize('CUSTOMER'), completeJob);
router.put('/applications/:applicationId/status', authenticate, authorize('CUSTOMER'), updateApplicationStatus);

export default router;