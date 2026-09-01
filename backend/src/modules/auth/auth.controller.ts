import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { hashPassword, verifyPassword } from '../../lib/password';
import { signAccessToken } from '../../lib/jwt';
import { asyncHandler } from '../../utils/async-handler';
import { conflict, unauthorized } from '../../utils/errors';
import { presentUser } from '../../utils/presenters';
import { loginSchema, registerSchema } from './auth.schemas';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { body } = registerSchema.parse(req);
  const email = body.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw conflict('Email already registered.');
  }

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email,
      passwordHash: await hashPassword(body.password),
      role: body.role,
      profile: {
        create: {
          phone: body.phone,
          city: body.city,
          state: body.state,
        },
      },
    },
    include: { profile: true },
  });

  const token = signAccessToken({ sub: user.id, role: user.role });

  res.status(201).json({
    user: presentUser(user),
    token,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { body } = loginSchema.parse(req);
  const email = body.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw unauthorized('Invalid email or password.');
  }

  const passwordMatches = await verifyPassword(body.password, user.passwordHash);
  if (!passwordMatches) {
    throw unauthorized('Invalid email or password.');
  }

  const token = signAccessToken({ sub: user.id, role: user.role });

  const userWithProfile = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    include: { profile: true },
  });

  res.json({
    user: presentUser(userWithProfile),
    token,
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user!.id },
    include: { profile: true },
  });

  res.json({ user: presentUser(user) });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true });
});
