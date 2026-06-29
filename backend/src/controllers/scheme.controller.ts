import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';

export const getSchemes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.query;

    const schemes = await prisma.governmentScheme.findMany({
      where: {
        isActive: true,
        ...(category && { category: { contains: category as string, mode: 'insensitive' } })
      },
      orderBy: { createdAt: 'desc' }
    });

    sendSuccess(res, schemes);
  } catch {
    sendError(res, 'Failed to fetch schemes', 500);
  }
};

export const getEligibleSchemes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user!.userId }
    });

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });

    if (!workerProfile || !user) {
      sendError(res, 'Worker not found', 404);
      return;
    }

    const schemes = await prisma.governmentScheme.findMany({ where: { isActive: true } });

    // Simple eligibility check
    const eligible = schemes.filter(scheme => {
      const criteria = scheme.eligibilityCriteria as Record<string, unknown> | null;
      if (!criteria) return true;
      return true; // Simplified — in production, do real criteria matching
    });

    sendSuccess(res, eligible);
  } catch {
    sendError(res, 'Failed to fetch eligible schemes', 500);
  }
};

export const applyToScheme = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { schemeId } = req.params;

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!workerProfile) { sendError(res, 'Worker not found', 404); return; }

    const existing = await prisma.schemeApplication.findFirst({
      where: { workerId: workerProfile.id, schemeId }
    });

    if (existing) { sendError(res, 'Already applied to this scheme', 409); return; }

    const application = await prisma.schemeApplication.create({
      data: { workerId: workerProfile.id, schemeId }
    });

    const scheme = await prisma.governmentScheme.findUnique({ where: { id: schemeId } });
    await prisma.notification.create({
      data: {
        userId: req.user!.userId,
        type: 'WELFARE',
        title: 'Scheme Application Submitted',
        message: `Your application for "${scheme?.name}" has been submitted.`
      }
    });

    sendSuccess(res, application, 'Application submitted', 201);
  } catch {
    sendError(res, 'Failed to apply to scheme', 500);
  }
};