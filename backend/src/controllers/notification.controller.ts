import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', unreadOnly } = req.query;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user!.userId,
        ...(unreadOnly === 'true' && { isRead: false })
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.userId, isRead: false }
    });

    sendSuccess(res, { notifications, unreadCount });
  } catch {
    sendError(res, 'Failed to fetch notifications', 500);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { userId: req.user!.userId, isRead: false },
        data: { isRead: true }
      });
    } else {
      await prisma.notification.update({
        where: { id, userId: req.user!.userId },
        data: { isRead: true }
      });
    }

    sendSuccess(res, null, 'Notification(s) marked as read');
  } catch {
    sendError(res, 'Failed to update notification', 500);
  }
};