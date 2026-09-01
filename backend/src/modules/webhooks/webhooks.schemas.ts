import { z } from 'zod';

export const mockPaymentConfirmedSchema = z.object({
  body: z.object({
    externalPaymentId: z.string().trim().min(1).max(160),
    eventId: z.string().trim().min(1).max(160),
  }),
});

export const abacatePayWebhookSchema = z.object({
  body: z.record(z.unknown()),
});
