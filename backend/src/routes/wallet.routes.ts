import { Router } from 'express';
import {
  getWallet, createRazorpayOrder, verifyAndCreditWallet,
  withdrawFunds, getTransactions
} from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getWallet);
router.get('/transactions', authenticate, getTransactions);
router.post('/order', authenticate, createRazorpayOrder);
router.post('/verify', authenticate, verifyAndCreditWallet);
router.post('/withdraw', authenticate, withdrawFunds);

export default router;