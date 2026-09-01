import { z } from 'zod';
import { UserRole } from '@prisma/client';

const publicRoleSchema = z
  .enum(['USER', 'PROTECTOR', 'ONG', 'PARTNER', 'user', 'adopter', 'volunteer', 'protector', 'ngo', 'partner'])
  .optional()
  .transform((value) => {
    if (value === 'protector') return UserRole.PROTECTOR;
    if (value === 'ngo') return UserRole.ONG;
    if (value === 'partner') return UserRole.PARTNER;
    if (value === 'PROTECTOR' || value === 'ONG' || value === 'PARTNER') return value;
    return UserRole.USER;
  });

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(180),
    password: z.string().min(8).max(72),
    role: publicRoleSchema,
    phone: z.string().trim().max(40).optional(),
    city: z.string().trim().max(120).optional(),
    state: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(180),
    password: z.string().min(1).max(72),
  }),
});
