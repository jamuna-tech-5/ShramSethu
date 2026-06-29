import { Router } from 'express';
import { uploadDocument, getDocuments, deleteDocument } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/', authenticate, getDocuments);
router.post('/', authenticate, upload.single('file'), uploadDocument);
router.delete('/:id', authenticate, deleteDocument);

export default router;