import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { UserRole } from '@prisma/client';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, password, fullName, role = 'WORKER' } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });

    if (existingUser) {
      sendError(res, 'Email or phone already registered', 409);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        fullName,
        role: role as UserRole,
        wallet: { create: { balance: 0 } },
        ...(role === 'WORKER' && {
          workerProfile: {
            create: {
              gigScore: 300,
              incomeConsistencyScore: 0,
              customerRatingScore: 0,
              jobCompletionScore: 0,
              experienceScore: 0,
              financialBehaviourScore: 0,
              digitalReputationScore: 0
            }
          }
        }),
        ...(role === 'CUSTOMER' && {
          customerProfile: { create: {} }
        })
      },
      select: {
        id: true, email: true, phone: true, fullName: true, role: true, isVerified: true, createdAt: true
      }
    });

    const accessToken = generateAccessToken({ userId: user.id, role: user.role, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, email: user.email });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    // Welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM',
        title: 'Welcome to ShramSethu! 🎉',
        message: `Welcome ${user.fullName}! Your account has been created. Complete your profile to get started.`
      }
    });

    sendSuccess(res, { user, accessToken, refreshToken }, 'Registration successful', 201);
  } catch (error) {
    console.error('Register error:', error);
    sendError(res, 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        workerProfile: true,
        customerProfile: true,
        wallet: true
      }
    });

    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    if (!user.isActive) {
      sendError(res, 'Account has been deactivated', 403);
      return;
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, email: user.email });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    const { passwordHash, refreshToken: _, otp, ...safeUser } = user;
    void passwordHash; void _; void otp;

    sendSuccess(res, { user: safeUser, accessToken, refreshToken }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Login failed', 500);
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      sendError(res, 'Refresh token required', 400);
      return;
    }

    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.refreshToken !== token) {
      sendError(res, 'Invalid refresh token', 401);
      return;
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id, role: user.role, email: user.email });

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

    sendSuccess(res, { accessToken, refreshToken: newRefreshToken });
  } catch {
    sendError(res, 'Invalid refresh token', 401);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    if (userId) {
      await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    }
    sendSuccess(res, null, 'Logged out successfully');
  } catch {
    sendError(res, 'Logout failed', 500);
  }
};

export const getMe = async (req: Request & { user?: { userId: string } }, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        workerProfile: { include: { skills: { include: { skill: true } } } },
        customerProfile: true,
        wallet: true
      }
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const { passwordHash, refreshToken, otp, ...safeUser } = user;
    void passwordHash; void refreshToken; void otp;

    sendSuccess(res, safeUser);
  } catch {
    sendError(res, 'Failed to fetch user', 500);
  }
};