import { Request, Response } from 'express';
import { DonationCampaignStatus, DonationStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { badRequest, notFound } from '../../utils/errors';
import { presentDonation, presentPublicDonationStatus } from '../../utils/presenters';
import { makePaymentProvider } from '../payments/payment-provider.factory';
import { createPixDonationSchema, donationIdSchema, donationListSchema } from './donations.schemas';

export const createCampaignPixDonation = asyncHandler(async (req: Request, res: Response) => {
  const { body, params } = createPixDonationSchema.parse(req);
  const campaignId = params.campaignId ?? body.campaignId;

  if (!campaignId) {
    throw badRequest('campaignId is required.');
  }

  const campaign = await prisma.donationCampaign.findFirst({
    where: { id: campaignId, deletedAt: null },
  });

  if (!campaign) {
    throw notFound('Campaign not found.');
  }

  if (campaign.status !== DonationCampaignStatus.ACTIVE) {
    throw badRequest('Campaign is not active.');
  }

  const provider = makePaymentProvider();
  const payment = await provider.createPixPayment({
    amountInCents: body.amountInCents,
    donorName: body.donorName,
    donorEmail: body.donorEmail.toLowerCase(),
    campaignId: campaign.id,
    campaignTitle: campaign.title,
  });

  const donation = await prisma.donation.create({
    data: {
      campaignId: campaign.id,
      donorUserId: req.user?.id,
      donorName: body.donorName,
      donorEmail: body.donorEmail.toLowerCase(),
      amountInCents: body.amountInCents,
      status: DonationStatus.PENDING,
      externalPaymentId: payment.externalPaymentId,
      paymentProvider: provider.getProviderName(),
      brCode: payment.brCode,
      brCodeBase64: payment.brCodeBase64,
      expiresAt: payment.expiresAt,
    },
  });

  res.status(201).json({
    donation: presentDonation(donation),
    donationId: donation.id,
    brCode: donation.brCode,
    brCodeBase64: donation.brCodeBase64,
    externalPaymentId: donation.externalPaymentId,
    expiresAt: donation.expiresAt,
    status: donation.status,
  });
});

export const listMyDonations = [
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { query } = donationListSchema.parse(req);
    const where = { donorUserId: req.user!.id };
    const skip = (query.page - 1) * query.pageSize;

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              beneficiaryName: true,
              city: true,
              state: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      prisma.donation.count({ where }),
    ]);

    res.json({
      data: donations.map(presentDonation),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    });
  }),
];

export const getDonationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { params } = donationIdSchema.parse(req);
  const donation = await prisma.donation.findUnique({ where: { id: params.id } });

  if (!donation) {
    throw notFound('Donation not found.');
  }

  res.json({ donation: presentPublicDonationStatus(donation), status: donation.status });
});
