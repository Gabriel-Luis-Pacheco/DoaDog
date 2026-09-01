import { Request, Response } from 'express';
import { DonationCampaignStatus, Prisma, UserRole } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { forbidden, notFound } from '../../utils/errors';
import { presentDonationCampaign } from '../../utils/presenters';
import {
  campaignIdSchema,
  campaignListSchema,
  createCampaignSchema,
  updateCampaignSchema,
} from './donationCampaigns.schemas';

function canManageCampaign(userId: string, role: UserRole, createdById: string) {
  return role === UserRole.ADMIN || userId === createdById;
}

async function assertDogExists(dogId?: string) {
  if (!dogId) return;

  const dog = await prisma.dog.findFirst({ where: { id: dogId, deletedAt: null }, select: { id: true } });
  if (!dog) {
    throw notFound('Dog not found.');
  }
}

export const listCampaigns = asyncHandler(async (req: Request, res: Response) => {
  const { query } = campaignListSchema.parse(req);
  const where: Prisma.DonationCampaignWhereInput = {
    deletedAt: null,
    status: DonationCampaignStatus.ACTIVE,
    helpType: query.helpType,
    city: query.city,
    state: query.state,
    urgencyLevel: query.urgencyLevel,
    dogId: query.dogId,
  };
  const skip = (query.page - 1) * query.pageSize;

  const [campaigns, total] = await Promise.all([
    prisma.donationCampaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.pageSize,
    }),
    prisma.donationCampaign.count({ where }),
  ]);

  res.json({
    data: campaigns.map(presentDonationCampaign),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  });
});

export const getCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { params } = campaignIdSchema.parse(req);
  const campaign = await prisma.donationCampaign.findFirst({
    where: { id: params.id, deletedAt: null, status: DonationCampaignStatus.ACTIVE },
  });

  if (!campaign) {
    throw notFound('Campaign not found.');
  }

  res.json({ campaign: presentDonationCampaign(campaign) });
});

export const createCampaign = [
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { body } = createCampaignSchema.parse(req);
    await assertDogExists(body.dogId);

    const campaign = await prisma.donationCampaign.create({
      data: {
        title: body.title,
        description: body.description,
        helpType: body.helpType,
        beneficiaryType: body.beneficiaryType,
        beneficiaryName: body.beneficiaryName,
        city: body.city,
        state: body.state,
        imageUrl: body.imageUrl,
        goalAmountInCents: body.goalAmountInCents,
        suggestedAmountInCents: body.suggestedAmountInCents,
        urgencyLevel: body.urgencyLevel,
        status: req.user!.role === UserRole.ADMIN ? body.status ?? DonationCampaignStatus.ACTIVE : DonationCampaignStatus.PENDING,
        rejectionReason: body.rejectionReason,
        dogId: body.dogId,
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ campaign: presentDonationCampaign(campaign) });
  }),
];

export const updateCampaign = [
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { body, params } = updateCampaignSchema.parse(req);
    const campaign = await prisma.donationCampaign.findFirst({ where: { id: params.id, deletedAt: null } });

    if (!campaign) {
      throw notFound('Campaign not found.');
    }

    if (!canManageCampaign(req.user!.id, req.user!.role, campaign.createdById)) {
      throw forbidden('You cannot update this campaign.');
    }

    if ((body.status || body.rejectionReason) && req.user!.role !== UserRole.ADMIN) {
      throw forbidden('Only admins can moderate campaigns.');
    }

    await assertDogExists(body.dogId);

    const updatedCampaign = await prisma.donationCampaign.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        helpType: body.helpType,
        beneficiaryType: body.beneficiaryType,
        beneficiaryName: body.beneficiaryName,
        city: body.city,
        state: body.state,
        imageUrl: body.imageUrl,
        goalAmountInCents: body.goalAmountInCents,
        suggestedAmountInCents: body.suggestedAmountInCents,
        urgencyLevel: body.urgencyLevel,
        status: body.status,
        rejectionReason: body.rejectionReason,
        dogId: body.dogId,
      },
    });

    res.json({ campaign: presentDonationCampaign(updatedCampaign) });
  }),
];
