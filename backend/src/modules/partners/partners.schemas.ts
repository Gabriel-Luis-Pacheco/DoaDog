import { PartnerStatus } from '@prisma/client';
import { z } from 'zod';
import { enumValue, optionalTrimmed } from '../../utils/validation';

const partnerBaseSchema = z.object({
  name: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  description: z.string().trim().min(10).max(2000),
  contactUrl: z.string().trim().url().max(2048).optional(),
  contactEmail: z.string().trim().email().max(180).optional(),
  contactPhone: optionalTrimmed(40),
  socialUrl: z.string().trim().url().max(2048).optional(),
  status: enumValue(PartnerStatus).default(PartnerStatus.ACTIVE),
});

export const createPartnerSchema = z.object({
  body: partnerBaseSchema,
});

export const updatePartnerSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: partnerBaseSchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  }),
});

export const partnerIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const partnerListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(20),
    category: z.string().trim().min(1).max(120).optional(),
    city: z.string().trim().min(1).max(120).optional(),
    state: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional(),
    status: enumValue(PartnerStatus).optional(),
  }),
});
