import { NextFunction, Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { verifyAccessToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';
import { forbidden, unauthorized } from '../utils/errors';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.header('authorization');

    if (!header?.startsWith('Bearer ')) {
      throw unauthorized();
    }

    const token = header.slice('Bearer '.length).trim();
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true },
    });

    if (!user) {
      throw unauthorized();
    }

    req.user = user;
    next();
  } catch {
    next(unauthorized());
  }
}

export async function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.header('authorization');

    if (!header?.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = header.slice('Bearer '.length).trim();
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true },
    });

    if (!user) {
      throw unauthorized();
    }

    req.user = user;
    next();
  } catch {
    next(unauthorized());
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== UserRole.ADMIN) {
    next(forbidden('Admin access required.'));
    return;
  }

  next();
}

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(forbidden('Insufficient role for this action.'));
      return;
    }

    next();
  };
}
