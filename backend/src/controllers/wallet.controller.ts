import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

export const getWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user!.userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!wallet) { sendError(res, 'Wallet not found', 404); return; }
    sendSuccess(res, wallet);
  } catch {
    sendError(res, 'Failed to fetch wallet', 500);
  }
};

export const createRazorpayOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 100) {
      sendError(res, 'Minimum deposit amount is ₹1', 400);
      return;
    }

    const order = await razorpay.orders.create({
      amount: Math.round(parseFloat(amount) * 100), // paise
      currency: 'INR',
      receipt: `wallet_${req.user!.userId}_${Date.now()}`
    });

    sendSuccess(res, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch {
    sendError(res, 'Failed to create payment order', 500);
  }
};

export const verifyAndCreditWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      sendError(res, 'Payment verification failed', 400);
      return;
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user!.userId } });
    if (!wallet) { sendError(res, 'Wallet not found', 404); return; }

    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: parseFloat(amount) } }
      }),
      prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount: parseFloat(amount),
          status: 'SUCCESS',
          description: 'Wallet top-up via Razorpay',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id
        }
      })
    ]);

    await prisma.notification.create({
      data: {
        userId: req.user!.userId,
        type: 'PAYMENT',
        title: '💰 Wallet Credited',
        message: `₹${amount} has been added to your wallet.`
      }
    });

    sendSuccess(res, null, 'Wallet credited successfully');
  } catch {
    sendError(res, 'Failed to verify payment', 500);
  }
};

export const withdrawFunds = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, accountNumber, ifscCode, accountName } = req.body;

    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user!.userId } });
    if (!wallet) { sendError(res, 'Wallet not found', 404); return; }

    if (parseFloat(wallet.balance.toString()) < parseFloat(amount)) {
      sendError(res, 'Insufficient balance', 400);
      return;
    }

    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: parseFloat(amount) } }
      }),
      prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT',
          amount: parseFloat(amount),
          status: 'SUCCESS',
          description: `Withdrawal to account ${accountNumber?.slice(-4)}`,
          referenceId: `WD_${Date.now()}`
        }
      })
    ]);

    sendSuccess(res, null, 'Withdrawal initiated successfully');
  } catch {
    sendError(res, 'Failed to process withdrawal', 500);
  }
};

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', type } = req.query;

    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user!.userId } });
    if (!wallet) { sendError(res, 'Wallet not found', 404); return; }

    const transactions = await prisma.transaction.findMany({
      where: {
        walletId: wallet.id,
        ...(type && { type: type as 'CREDIT' | 'DEBIT' })
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    sendSuccess(res, transactions);
  } catch {
    sendError(res, 'Failed to fetch transactions', 500);
  }
};