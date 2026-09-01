import { AdoptionRequestStatus } from '@prisma/client';
import { z } from 'zod';
import { enumValue, optionalTrimmed } from '../../utils/validation';

export const createAdoptionRequestSchema = z.object({
  body: z.object({
    dogId: z.string().uuid(),
    message: z.string().trim().min(10).max(2000),
    housingType: z.string().trim().min(2).max(120),
    hasYard: z.boolean().default(false),
    hasOtherPets: z.boolean().default(false),
    experience: z.string().trim().min(5).max(2000),
    routine: z.string().trim().min(5).max(2000),
    familyAgreement: z.boolean(),
    responsibilityAgreement: z.boolean(),
    adopterName: z.string().trim().min(2).max(120).optional(),
    adopterEmail: z.string().trim().email().max(180).optional(),
    adopterPhone: optionalTrimmed(40),
    adopterCity: optionalTrimmed(120),
    adopterState: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional(),
  }),
});

export const adoptionRequestListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(20),
    dogId: z.string().uuid().optional(),
    status: enumValue(AdoptionRequestStatus).optional(),
  }),
});

export const updateAdoptionRequestStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: enumValue(AdoptionRequestStatus),
    statusNote: optionalTrimmed(2000),
  }),
});
