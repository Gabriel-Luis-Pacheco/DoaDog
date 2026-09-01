import { DonationCampaignStatus, ModerationStatus } from '@prisma/client';
import { z } from 'zod';
import { enumValue, optionalTrimmed } from '../../utils/validation';

export const moderationListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(20),
  }),
});

export const moderateDogSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    moderationStatus: enumValue(ModerationStatus),
    rejectionReason: optionalTrimmed(2000),
  }),
});

export const moderateCampaignSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: enumValue(DonationCampaignStatus),
    rejectionReason: optionalTrimmed(2000),
  }),
});
