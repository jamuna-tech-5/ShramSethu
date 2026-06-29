import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobId, revieweeId, rating, comment } = req.body;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'COMPLETED') {
      sendError(res, 'Job not found or not completed', 400);
      return;
    }

    const review = await prisma.review.create({
      data: {
        jobId,
        reviewerId: req.user!.userId,
        revieweeId,
        rating: parseInt(rating),
        comment
      }
    });

    // Update worker average rating
    const workerUser = await prisma.user.findUnique({
      where: { id: revieweeId },
      include: { workerProfile: true }
    });

    if (workerUser?.workerProfile) {
      const avgRating = await prisma.review.aggregate({
        where: { revieweeId },
        _avg: { rating: true }
      });

      await prisma.workerProfile.update({
        where: { id: workerUser.workerProfile.id },
        data: {
          averageRating: avgRating._avg.rating || 0,
          customerRatingScore: ((avgRating._avg.rating || 0) / 5) * 100
        }
      });
    }

    sendSuccess(res, review, 'Review submitted', 201);
  } catch {
    sendError(res, 'Failed to submit review', 500);
  }
};

export const getReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: { select: { fullName: true, avatarUrl: true } },
        job: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    sendSuccess(res, reviews);
  } catch {
    sendError(res, 'Failed to fetch reviews', 500);
  }
};