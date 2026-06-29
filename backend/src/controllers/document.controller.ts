import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';
import { DocumentType } from '@prisma/client';

export const uploadDocument = async (req: AuthRequest & { file?: Express.Multer.File }, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 'No file uploaded', 400);
      return;
    }

    const { documentType } = req.body;

    const document = await prisma.document.create({
      data: {
        userId: req.user!.userId,
        documentType: documentType as DocumentType,
        fileUrl: (req.file as unknown as { path: string }).path,
        fileName: req.file.originalname
      }
    });

    // Update financial behaviour score slightly
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user!.userId }
    });

    if (workerProfile) {
      const docCount = await prisma.document.count({ where: { userId: req.user!.userId } });
      const newScore = Math.min(docCount * 15, 100);
      await prisma.workerProfile.update({
        where: { id: workerProfile.id },
        data: { financialBehaviourScore: newScore }
      });
    }

    sendSuccess(res, document, 'Document uploaded successfully', 201);
  } catch {
    sendError(res, 'Failed to upload document', 500);
  }
};

export const getDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' }
    });

    sendSuccess(res, documents);
  } catch {
    sendError(res, 'Failed to fetch documents', 500);
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const document = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!document) { sendError(res, 'Document not found', 404); return; }
    if (document.userId !== req.user!.userId) { sendError(res, 'Unauthorized', 403); return; }

    await prisma.document.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Document deleted successfully');
  } catch {
    sendError(res, 'Failed to delete document', 500);
  }
};