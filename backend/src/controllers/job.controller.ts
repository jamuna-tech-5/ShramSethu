import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title, description, category, locationCity, locationState,
      locationAddress, budgetMin, budgetMax, durationDays, requiredSkills, minGigScore
    } = req.body;

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!customerProfile) {
      sendError(res, 'Customer profile not found', 404);
      return;
    }

    const job = await prisma.job.create({
      data: {
        customerId: customerProfile.id,
        title,
        description,
        category,
        locationCity,
        locationState,
        locationAddress,
        budgetMin: parseFloat(budgetMin),
        budgetMax: parseFloat(budgetMax),
        durationDays: durationDays ? parseInt(durationDays) : null,
        requiredSkills: requiredSkills || [],
        minGigScore: minGigScore ? parseInt(minGigScore) : 0
      },
      include: {
        customer: { include: { user: { select: { fullName: true, avatarUrl: true } } } }
      }
    });

    await prisma.customerProfile.update({
      where: { id: customerProfile.id },
      data: { totalJobsPosted: { increment: 1 } }
    });

    sendSuccess(res, job, 'Job created successfully', 201);
  } catch {
    sendError(res, 'Failed to create job', 500);
  }
};

export const getJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, city, status, search, page = '1', limit = '10', minBudget, maxBudget } = req.query;

    const jobs = await prisma.job.findMany({
      where: {
        ...(status ? { status: status as 'OPEN' } : { status: 'OPEN' }),
        ...(category && { category: { contains: category as string, mode: 'insensitive' } }),
        ...(city && { locationCity: { contains: city as string, mode: 'insensitive' } }),
        ...(search && {
          OR: [
            { title: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } }
          ]
        }),
        ...(minBudget && { budgetMin: { gte: parseFloat(minBudget as string) } }),
        ...(maxBudget && { budgetMax: { lte: parseFloat(maxBudget as string) } })
      },
      include: {
        customer: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const total = await prisma.job.count({
      where: { status: 'OPEN' }
    });

    sendSuccess(res, { jobs, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch {
    sendError(res, 'Failed to fetch jobs', 500);
  }
};

export const getJobById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { include: { user: { select: { fullName: true, avatarUrl: true, email: true } } } },
        assignedWorker: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
        applications: {
          include: {
            worker: { include: { user: { select: { fullName: true, avatarUrl: true } } } }
          }
        },
        reviews: { include: { reviewer: { select: { fullName: true, avatarUrl: true } } } },
        _count: { select: { applications: true } }
      }
    });

    if (!job) {
      sendError(res, 'Job not found', 404);
      return;
    }

    sendSuccess(res, job);
  } catch {
    sendError(res, 'Failed to fetch job', 500);
  }
};

export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id }, include: { customer: true } });

    if (!job) { sendError(res, 'Job not found', 404); return; }
    if (job.customer.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      sendError(res, 'Unauthorized', 403); return;
    }

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data: req.body
    });

    sendSuccess(res, updated, 'Job updated successfully');
  } catch {
    sendError(res, 'Failed to update job', 500);
  }
};

export const applyToJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { coverLetter, proposedRate } = req.body;

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!workerProfile) { sendError(res, 'Worker profile not found', 404); return; }

    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) { sendError(res, 'Job not found', 404); return; }
    if (job.status !== 'OPEN') { sendError(res, 'Job is no longer accepting applications', 400); return; }

    if (job.minGigScore > 0 && workerProfile.gigScore < job.minGigScore) {
      sendError(res, `Minimum GigScore of ${job.minGigScore} required`, 400);
      return;
    }

    const existing = await prisma.jobApplication.findUnique({
      where: { jobId_workerId: { jobId: req.params.id, workerId: workerProfile.id } }
    });

    if (existing) { sendError(res, 'Already applied to this job', 409); return; }

    const application = await prisma.jobApplication.create({
      data: {
        jobId: req.params.id,
        workerId: workerProfile.id,
        coverLetter,
        proposedRate: proposedRate ? parseFloat(proposedRate) : null
      }
    });

    // Notify customer
    const customer = await prisma.customerProfile.findUnique({
      where: { id: job.customerId }
    });
    if (customer) {
      await prisma.notification.create({
        data: {
          userId: customer.userId,
          type: 'JOB',
          title: 'New Job Application',
          message: `A worker has applied to your job "${job.title}"`,
          metadata: { jobId: job.id, applicationId: application.id }
        }
      });
    }

    sendSuccess(res, application, 'Application submitted successfully', 201);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      sendError(res, 'Already applied to this job', 409);
      return;
    }
    sendError(res, 'Failed to apply to job', 500);
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!workerProfile) { sendError(res, 'Worker not found', 404); return; }

    const applications = await prisma.jobApplication.findMany({
      where: { workerId: workerProfile.id },
      include: {
        job: {
          include: {
            customer: { include: { user: { select: { fullName: true, avatarUrl: true } } } }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    sendSuccess(res, applications);
  } catch {
    sendError(res, 'Failed to fetch applications', 500);
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: { include: { customer: true } }, worker: true }
    });

    if (!application) { sendError(res, 'Application not found', 404); return; }
    if (application.job.customer.userId !== req.user!.userId) {
      sendError(res, 'Unauthorized', 403); return;
    }

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status }
    });

    if (status === 'ACCEPTED') {
      await prisma.job.update({
        where: { id: application.jobId },
        data: { status: 'IN_PROGRESS', assignedWorkerId: application.workerId, startedAt: new Date() }
      });

      await prisma.notification.create({
        data: {
          userId: application.worker.userId,
          type: 'JOB',
          title: '🎉 Application Accepted!',
          message: `Your application for "${application.job.title}" has been accepted!`,
          metadata: { jobId: application.jobId }
        }
      });
    }

    sendSuccess(res, updated, 'Application status updated');
  } catch {
    sendError(res, 'Failed to update application status', 500);
  }
};

export const completeJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { customer: true, assignedWorker: true }
    });

    if (!job) { sendError(res, 'Job not found', 404); return; }
    if (job.customer.userId !== req.user!.userId) { sendError(res, 'Unauthorized', 403); return; }
    if (job.status !== 'IN_PROGRESS') { sendError(res, 'Job is not in progress', 400); return; }

    const { amount } = req.body;

    await prisma.$transaction(async (tx) => {
      await tx.job.update({
        where: { id: job.id },
        data: { status: 'COMPLETED', completedAt: new Date() }
      });

      if (job.assignedWorkerId && amount) {
        const workerWallet = await tx.wallet.findUnique({
          where: { userId: job.assignedWorker!.userId }
        });

        if (workerWallet) {
          await tx.wallet.update({
            where: { id: workerWallet.id },
            data: { balance: { increment: parseFloat(amount) } }
          });

          await tx.transaction.create({
            data: {
              walletId: workerWallet.id,
              type: 'CREDIT',
              amount: parseFloat(amount),
              status: 'SUCCESS',
              description: `Payment for job: ${job.title}`,
              jobId: job.id
            }
          });

          const now = new Date();
          await tx.earning.create({
            data: {
              workerId: job.assignedWorkerId,
              jobId: job.id,
              amount: parseFloat(amount),
              month: now.getMonth() + 1,
              year: now.getFullYear()
            }
          });

          await tx.workerProfile.update({
            where: { id: job.assignedWorkerId },
            data: {
              totalJobsCompleted: { increment: 1 },
              totalEarnings: { increment: parseFloat(amount) }
            }
          });

          await tx.notification.create({
            data: {
              userId: job.assignedWorker!.userId,
              type: 'PAYMENT',
              title: '💰 Payment Received',
              message: `₹${amount} has been credited for completing "${job.title}"`,
              metadata: { jobId: job.id, amount }
            }
          });
        }
      }
    });

    sendSuccess(res, null, 'Job marked as completed');
  } catch {
    sendError(res, 'Failed to complete job', 500);
  }
};

export const getCustomerJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!customerProfile) { sendError(res, 'Customer profile not found', 404); return; }

    const jobs = await prisma.job.findMany({
      where: { customerId: customerProfile.id },
      include: {
        _count: { select: { applications: true } },
        assignedWorker: { include: { user: { select: { fullName: true, avatarUrl: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    sendSuccess(res, jobs);
  } catch {
    sendError(res, 'Failed to fetch customer jobs', 500);
  }
};