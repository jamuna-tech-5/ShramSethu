import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';
import { calculateGigScore, getLoanEligibility } from '../utils/gigScore';

export const getWorkerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const workerId = id || req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: workerId },
      include: {
        workerProfile: {
          include: {
            skills: { include: { skill: true } }
          }
        },
        wallet: true,
        documents: true
      }
    });

    if (!user || !user.workerProfile) {
      sendError(res, 'Worker not found', 404);
      return;
    }

    const { passwordHash, refreshToken, otp, ...safeUser } = user;
    void passwordHash; void refreshToken; void otp;

    const loanEligibility = getLoanEligibility(user.workerProfile.gigScore);

    sendSuccess(res, { ...safeUser, loanEligibility });
  } catch {
    sendError(res, 'Failed to fetch worker profile', 500);
  }
};

export const updateWorkerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bio, city, state, pincode, yearsExperience, isAvailable } = req.body;

    const updated = await prisma.workerProfile.update({
      where: { userId: req.user!.userId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(pincode !== undefined && { pincode }),
        ...(yearsExperience !== undefined && { yearsExperience: parseInt(yearsExperience) }),
        ...(isAvailable !== undefined && { isAvailable })
      }
    });

    sendSuccess(res, updated, 'Profile updated successfully');
  } catch {
    sendError(res, 'Failed to update profile', 500);
  }
};

export const recalculateGigScore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!workerProfile) {
      sendError(res, 'Worker profile not found', 404);
      return;
    }

    // Calculate components
    const totalJobs = workerProfile.totalJobsCompleted;
    const completionRate = totalJobs > 0
      ? Math.min((workerProfile.totalJobsCompleted / Math.max(totalJobs, 1)) * 100, 100)
      : 0;

    // Income consistency: check last 6 months of earnings
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentEarnings = await prisma.earning.groupBy({
      by: ['month', 'year'],
      where: {
        workerId: workerProfile.id,
        createdAt: { gte: sixMonthsAgo }
      },
      _sum: { amount: true }
    });

    const monthsWithEarnings = recentEarnings.length;
    const incomeConsistency = Math.min((monthsWithEarnings / 6) * 100, 100);

    const newScore = calculateGigScore({
      incomeConsistency,
      customerRatings: parseFloat(workerProfile.averageRating.toString()),
      jobCompletionRate: completionRate,
      yearsExperience: workerProfile.yearsExperience,
      financialBehaviour: workerProfile.financialBehaviourScore,
      digitalReputation: workerProfile.digitalReputationScore
    });

    const updated = await prisma.workerProfile.update({
      where: { id: workerProfile.id },
      data: {
        gigScore: newScore,
        incomeConsistencyScore: Math.round(incomeConsistency),
        jobCompletionScore: Math.round(completionRate)
      }
    });

    await prisma.notification.create({
      data: {
        userId: req.user!.userId,
        type: 'SCORE',
        title: 'GigScore Updated',
        message: `Your GigScore has been updated to ${newScore}. Keep completing jobs to improve!`
      }
    });

    sendSuccess(res, { ...updated, loanEligibility: getLoanEligibility(newScore) }, 'GigScore recalculated');
  } catch {
    sendError(res, 'Failed to recalculate GigScore', 500);
  }
};

export const getWorkerEarnings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!workerProfile) {
      sendError(res, 'Worker not found', 404);
      return;
    }

    const earnings = await prisma.earning.groupBy({
      by: ['month', 'year'],
      where: { workerId: workerProfile.id },
      _sum: { amount: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const formattedEarnings = earnings.map(e => ({
      month: monthNames[e.month - 1],
      year: e.year,
      amount: parseFloat(e._sum.amount?.toString() || '0')
    }));

    const totalEarnings = await prisma.earning.aggregate({
      where: { workerId: workerProfile.id },
      _sum: { amount: true }
    });

    sendSuccess(res, {
      monthly: formattedEarnings,
      total: parseFloat(totalEarnings._sum.amount?.toString() || '0'),
      totalJobs: workerProfile.totalJobsCompleted
    });
  } catch {
    sendError(res, 'Failed to fetch earnings', 500);
  }
};

export const addWorkerSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { skillId, level } = req.body;

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!workerProfile) {
      sendError(res, 'Worker profile not found', 404);
      return;
    }

    const workerSkill = await prisma.workerSkill.upsert({
      where: { workerId_skillId: { workerId: workerProfile.id, skillId } },
      update: { level },
      create: { workerId: workerProfile.id, skillId, level },
      include: { skill: true }
    });

    sendSuccess(res, workerSkill, 'Skill added successfully', 201);
  } catch {
    sendError(res, 'Failed to add skill', 500);
  }
};

export const removeWorkerSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { skillId } = req.params;

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!workerProfile) {
      sendError(res, 'Worker profile not found', 404);
      return;
    }

    await prisma.workerSkill.delete({
      where: { workerId_skillId: { workerId: workerProfile.id, skillId } }
    });

    sendSuccess(res, null, 'Skill removed successfully');
  } catch {
    sendError(res, 'Failed to remove skill', 500);
  }
};

export const searchWorkers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { city, skill, minScore, page = '1', limit = '10' } = req.query;

    const workers = await prisma.workerProfile.findMany({
      where: {
        isAvailable: true,
        ...(city && { city: { contains: city as string, mode: 'insensitive' } }),
        ...(minScore && { gigScore: { gte: parseInt(minScore as string) } }),
        ...(skill && {
          skills: { some: { skill: { name: { contains: skill as string, mode: 'insensitive' } } } }
        })
      },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
        skills: { include: { skill: true } }
      },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
      orderBy: { gigScore: 'desc' }
    });

    sendSuccess(res, workers);
  } catch {
    sendError(res, 'Failed to search workers', 500);
  }
};