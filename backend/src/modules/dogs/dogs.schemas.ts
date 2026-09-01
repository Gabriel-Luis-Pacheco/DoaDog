import { DogAgeRange, DogGender, DogSize, DogStatus, ModerationStatus, UrgencyLevel } from '@prisma/client';
import { z } from 'zod';
import { enumValue, optionalTrimmed } from '../../utils/validation';

const imageSchema = z.object({
  url: z.string().trim().url().max(2048),
  storageKey: z.string().trim().max(2048).optional(),
  sortOrder: z.coerce.number().int().min(0).max(20).optional(),
});

const dogBaseSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(10).max(2000),
  age: z.coerce.number().int().min(0).max(35).optional(),
  ageRange: enumValue(DogAgeRange).default(DogAgeRange.UNKNOWN),
  size: enumValue(DogSize).default(DogSize.UNKNOWN),
  gender: enumValue(DogGender).default(DogGender.UNKNOWN),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  address: optionalTrimmed(180),
  imageUrl: z.string().trim().url().max(2048).optional(),
  images: z.array(imageSchema).max(5).optional(),
  healthCondition: optionalTrimmed(2000),
  vaccinated: z.boolean().optional(),
  neutered: z.boolean().optional(),
  specialNeeds: optionalTrimmed(2000),
  contactName: optionalTrimmed(120),
  contactInfo: optionalTrimmed(180),
  status: enumValue(DogStatus).default(DogStatus.AVAILABLE),
  urgencyLevel: enumValue(UrgencyLevel).default(UrgencyLevel.MEDIUM),
});

export const createDogSchema = z.object({
  body: dogBaseSchema,
});

export const updateDogSchema = z.object({
  body: dogBaseSchema
    .partial()
    .extend({
      moderationStatus: enumValue(ModerationStatus).optional(),
      rejectionReason: optionalTrimmed(2000),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided.',
    }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const dogIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const dogListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(20),
    search: z.string().trim().max(120).optional(),
    city: z.string().trim().min(1).max(120).optional(),
    state: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional(),
    size: enumValue(DogSize).optional(),
    gender: enumValue(DogGender).optional(),
    ageRange: enumValue(DogAgeRange).optional(),
    status: enumValue(DogStatus).optional(),
    moderationStatus: enumValue(ModerationStatus).optional(),
  }),
});
