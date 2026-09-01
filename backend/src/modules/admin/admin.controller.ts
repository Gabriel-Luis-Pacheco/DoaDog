import { Request, Response } from 'express';
import { DonationCampaignStatus, ModerationStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { authMiddleware, requireAdmin } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { badRequest, notFound } from '../../utils/errors';
import { presentAdoptionRequest, presentDog, presentDonationCampaign } from '../../utils/presenters';
import { moderateCampaignSchema, moderateDogSchema, moderationListSchema } from './admin.schemas';

export const getModerationQueue = [
  authMiddleware,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { query } = moderationListSchema.parse(req);
    const take = query.pageSize;
    const skip = (query.page - 1) * take;

    const [dogs, campaigns, adoptionRequests] = await Promise.all([
      prisma.dog.findMany({
        where: { deletedAt: null, moderationStatus: ModerationStatus.PENDING },
        include: { images: true },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }),
      prisma.donationCampaign.findMany({
        where: { deletedAt: null, status: DonationCampaignStatus.PENDING },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }),
      prisma.adoptionRequest.findMany({
        orderBy: { createdAt: 'desc' },
        take,
      }),
    ]);

    res.json({
      dogs: dogs.map(presentDog),
      campaigns: campaigns.map(presentDonationCampaign),
      adoptionRequests: adoptionRequests.map(presentAdoptionRequest),
    });
  }),
];

export const moderateDog = [
  authMiddleware,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { body, params } = moderateDogSchema.parse(req);

    if (body.moderationStatus === ModerationStatus.REJECTED && !body.rejectionReason) {
      throw badRequest('rejectionReason is required when rejecting a dog.');
    }

    const dog = await prisma.dog.findFirst({ where: { id: params.id, deletedAt: null } });
    if (!dog) {
      throw notFound('Dog not found.');
    }

    const updatedDog = await prisma.$transaction(async (tx) => {
      const result = await tx.dog.update({
        where: { id: params.id },
        data: {
          moderationStatus: body.moderationStatus,
          rejectionReason: body.moderationStatus === ModerationStatus.REJECTED ? body.rejectionReason : null,
        },
        include: { images: true },
      });

      await tx.adminAction.create({
        data: {
          adminId: req.user!.id,
          action: `DOG_${body.moderationStatus}`,
          entityType: 'dog',
          entityId: params.id,
          reason: body.rejectionReason,
        },
      });

      return result;
    });

    res.json({ dog: presentDog(updatedDog) });
  }),
];

export const moderateCampaign = [
  authMiddleware,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { body, params } = moderateCampaignSchema.parse(req);

    if (body.status === DonationCampaignStatus.REJECTED && !body.rejectionReason) {
      throw badRequest('rejectionReason is required when rejecting a campaign.');
    }

    const campaign = await prisma.donationCampaign.findFirst({ where: { id: params.id, deletedAt: null } });
    if (!campaign) {
      throw notFound('Campaign not found.');
    }

    const updatedCampaign = await prisma.$transaction(async (tx) => {
      const result = await tx.donationCampaign.update({
        where: { id: params.id },
        data: {
          status: body.status,
          rejectionReason: body.status === DonationCampaignStatus.REJECTED ? body.rejectionReason : null,
        },
      });

      await tx.adminAction.create({
        data: {
          adminId: req.user!.id,
          action: `CAMPAIGN_${body.status}`,
          entityType: 'donation_campaign',
          entityId: params.id,
          reason: body.rejectionReason,
        },
      });

      return result;
    });

    res.json({ campaign: presentDonationCampaign(updatedCampaign) });
  }),
];
