import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers, totalWorkers, totalCustomers,
      totalJobs, activeJobs, completedJobs,
      totalTransactions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'WORKER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'OPEN' } }),
      prisma.job.count({ where: { status: 'COMPLETED' } }),
      prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: 'SUCCESS' } })
    ]);

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, fullName: true, email: true, role: true, createdAt: true, isVerified: true }
    });

    sendSuccess(res, {
      stats: {
        totalUsers, totalWorkers, totalCustomers,
        totalJobs, activeJobs, completedJobs,
        totalTransactionVolume: parseFloat(totalTransactions._sum.amount?.toString() || '0')
      },
      recentUsers
    });
  } catch {
    sendError(res, 'Failed to fetch admin stats', 500);
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', role, search } = req.query;

    const users = await prisma.user.findMany({
      where: {
        ...(role && { role: role as 'WORKER' | 'CUSTOMER' | 'ADMIN' }),
        ...(search && {
          OR: [
            { fullName: { contains: search as string, mode: 'insensitive' } },
            { email: { contains: search as string, mode: 'insensitive' } }
          ]
        })
      },
      select: {
        id: true, fullName: true, email: true, phone: true,
        role: true, isVerified: true, isActive: true, createdAt: true,
        workerProfile: { select: { gigScore: true, totalJobsCompleted: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const total = await prisma.user.count();

    sendSuccess(res, { users, total });
  } catch {
    sendError(res, 'Failed to fetch users', 500);
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) { sendError(res, 'User not found', 404); return; }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive }
    });

    sendSuccess(res, updated, `User ${updated.isActive ? 'activated' : 'deactivated'}`);
  } catch {
    sendError(res, 'Failed to toggle user status', 500);
  }
};

export const verifyDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const doc = await prisma.document.update({
      where: { id },
      data: { isVerified: true, verifiedAt: new Date(), verifiedBy: req.user!.userId }
    });

    await prisma.notification.create({
      data: {
        userId: doc.userId,
        type: 'SYSTEM',
        title: '✅ Document Verified',
        message: 'Your document has been verified by our team.'
      }
    });

    sendSuccess(res, doc, 'Document verified');
  } catch {
    sendError(res, 'Failed to verify document', 500);
  }
};

export const getAllJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;

    const jobs = await prisma.job.findMany({
      include: {
        customer: { include: { user: { select: { fullName: true } } } },
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    sendSuccess(res, jobs);
  } catch {
    sendError(res, 'Failed to fetch jobs', 500);
  }
};