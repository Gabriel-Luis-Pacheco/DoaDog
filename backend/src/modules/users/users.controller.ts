import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../utils/async-handler';
import { presentUser } from '../../utils/presenters';
import { updateProfileSchema } from './users.schemas';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user!.id },
    include: { profile: true },
  });

  res.json({ user: presentUser(user) });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { body } = updateProfileSchema.parse(req);

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      name: body.name,
      profile: {
        upsert: {
          create: {
            phone: body.phone,
            city: body.city,
            state: body.state,
            avatarUrl: body.avatarUrl,
            bio: body.bio,
          },
          update: {
            phone: body.phone,
            city: body.city,
            state: body.state,
            avatarUrl: body.avatarUrl,
            bio: body.bio,
          },
        },
      },
    },
    include: { profile: true },
  });

  res.json({ user: presentUser(user) });
});
