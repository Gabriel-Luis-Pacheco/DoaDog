import { Request, Response } from 'express';
import { PartnerStatus, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { authMiddleware, requireAdmin } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { notFound } from '../../utils/errors';
import { presentPartner } from '../../utils/presenters';
import { createPartnerSchema, partnerIdSchema, partnerListSchema, updatePartnerSchema } from './partners.schemas';

export const listPartners = asyncHandler(async (req: Request, res: Response) => {
  const { query } = partnerListSchema.parse(req);
  const where: Prisma.PartnerWhereInput = {
    deletedAt: null,
    status: query.status ?? PartnerStatus.ACTIVE,
    category: query.category,
    city: query.city,
    state: query.state,
  };
  const skip = (query.page - 1) * query.pageSize;

  const [partners, total] = await Promise.all([
    prisma.partner.findMany({
      where,
      orderBy: [{ city: 'asc' }, { name: 'asc' }],
      skip,
      take: query.pageSize,
    }),
    prisma.partner.count({ where }),
  ]);

  res.json({
    data: partners.map(presentPartner),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  });
});

export const getPartner = asyncHandler(async (req: Request, res: Response) => {
  const { params } = partnerIdSchema.parse(req);
  const partner = await prisma.partner.findFirst({
    where: { id: params.id, deletedAt: null, status: PartnerStatus.ACTIVE },
  });

  if (!partner) {
    throw notFound('Partner not found.');
  }

  res.json({ partner: presentPartner(partner) });
});

export const createPartner = [
  authMiddleware,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { body } = createPartnerSchema.parse(req);
    const partner = await prisma.partner.create({
      data: {
        ...body,
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ partner: presentPartner(partner) });
  }),
];

export const updatePartner = [
  authMiddleware,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { body, params } = updatePartnerSchema.parse(req);
    const partner = await prisma.partner.findFirst({ where: { id: params.id, deletedAt: null } });

    if (!partner) {
      throw notFound('Partner not found.');
    }

    const updatedPartner = await prisma.partner.update({
      where: { id: params.id },
      data: body,
    });

    res.json({ partner: presentPartner(updatedPartner) });
  }),
];
