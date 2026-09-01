import { BeneficiaryType, DonationCampaignStatus, HelpType, UrgencyLevel } from '@prisma/client';
import { z } from 'zod';
import { enumValue, optionalTrimmed } from '../../utils/validation';

const campaignBaseSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(3000),
  helpType: enumValue(HelpType).default(HelpType.OTHER),
  beneficiaryType: enumValue(BeneficiaryType).default(BeneficiaryType.DOG),
  beneficiaryName: z.string().trim().min(2).max(160),
  city: optionalTrimmed(120),
  state: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional(),
  imageUrl: z.string().trim().url().max(2048).optional(),
  goalAmountInCents: z.coerce.number().int().positive(),
  suggestedAmountInCents: z.coerce.number().int().positive().optional(),
  urgencyLevel: enumValue(UrgencyLevel).default(UrgencyLevel.MEDIUM),
  status: enumValue(DonationCampaignStatus).optional(),
  rejectionReason: optionalTrimmed(2000),
  dogId: z.string().uuid().optional(),
});

export const createCampaignSchema = z.object({
  body: campaignBaseSchema,
});

export const updateCampaignSchema = z.object({
  body: campaignBaseSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided.',
    }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const campaignIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const campaignListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(20),
    status: enumValue(DonationCampaignStatus).optional(),
    helpType: enumValue(HelpType).optional(),
    city: z.string().trim().min(1).max(120).optional(),
    state: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional(),
    urgencyLevel: enumValue(UrgencyLevel).optional(),
    dogId: z.string().uuid().optional(),
  }),
});
