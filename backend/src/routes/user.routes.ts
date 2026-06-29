import { Router } from 'express';
import { updateProfile, getAllSkills } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { avatarUpload } from '../middleware/upload.middleware';

const router = Router();

router.put('/profile', authenticate, avatarUpload.single('avatar'), updateProfile);
router.get('/skills', authenticate, getAllSkills);

export default router;