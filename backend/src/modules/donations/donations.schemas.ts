import { z } from 'zod';

const pixBodySchema = z.object({
  campaignId: z.string().uuid().optional(),
  amountInCents: z.coerce.number().int().min(100).max(500000),
  donorName: z.string().trim().min(2).max(120),
  donorEmail: z.string().trim().email().max(180),
});

export const createPixDonationSchema = z.object({
  params: z.object({
    campaignId: z.string().uuid().optional(),
  }),
  body: pixBodySchema,
});

export const donationIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const donationListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(20),
  }),
});
