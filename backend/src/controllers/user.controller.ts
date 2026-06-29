import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';

export const updateProfile = async (req: AuthRequest & { file?: Express.Multer.File }, res: Response): Promise<void> => {
  try {
    const { fullName, phone } = req.body;

    const updateData: Record<string, unknown> = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (req.file) updateData.avatarUrl = (req.file as unknown as { path: string }).path;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: updateData,
      select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true, role: true }
    });

    sendSuccess(res, user, 'Profile updated');
  } catch {
    sendError(res, 'Failed to update profile', 500);
  }
};

export const getAllSkills = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const skills = await prisma.skill.findMany({ orderBy: { category: 'asc' } });
    sendSuccess(res, skills);
  } catch {
    sendError(res, 'Failed to fetch skills', 500);
  }
};