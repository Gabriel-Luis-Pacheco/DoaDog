import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    phone: z.string().trim().max(40).optional(),
    city: z.string().trim().max(120).optional(),
    state: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional(),
    avatarUrl: z.string().trim().url().max(2048).optional(),
    bio: z.string().trim().max(1000).optional(),
  }),
});
