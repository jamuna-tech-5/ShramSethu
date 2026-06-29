import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';
import { getLoanEligibility } from '../utils/gigScore';

export const applyForLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, purpose } = req.body;

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!workerProfile) { sendError(res, 'Worker profile not found', 404); return; }

    const eligibility = getLoanEligibility(workerProfile.gigScore);
    if (!eligibility.eligible) {
      sendError(res, eligibility.message, 400);
      return;
    }

    if (parseFloat(amount) > eligibility.maxAmount) {
      sendError(res, `Maximum loan amount is ₹${eligibility.maxAmount}`, 400);
      return;
    }

    const loan = await prisma.loanApplication.create({
      data: {
        workerId: workerProfile.id,
        amount: parseFloat(amount),
        purpose,
        gigScoreAtApplication: workerProfile.gigScore,
        status: 'PENDING',
        partnerBank: 'State Bank of India'
      }
    });

    await prisma.notification.create({
      data: {
        userId: req.user!.userId,
        type: 'SYSTEM',
        title: 'Loan Application Submitted',
        message: `Your loan application for ₹${amount} has been submitted. We'll notify you of the status.`
      }
    });

    sendSuccess(res, loan, 'Loan application submitted', 201);
  } catch {
    sendError(res, 'Failed to submit loan application', 500);
  }
};

export const getLoanApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!workerProfile) { sendError(res, 'Worker not found', 404); return; }

    const loans = await prisma.loanApplication.findMany({
      where: { workerId: workerProfile.id },
      orderBy: { createdAt: 'desc' }
    });

    const eligibility = getLoanEligibility(workerProfile.gigScore);

    sendSuccess(res, { loans, eligibility, gigScore: workerProfile.gigScore });
  } catch {
    sendError(res, 'Failed to fetch loan applications', 500);
  }
};