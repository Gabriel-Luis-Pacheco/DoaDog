import { createHmac, timingSafeEqual } from 'node:crypto';
import { Request, Response } from 'express';
import { DonationStatus, PaymentProviderName, Prisma } from '@prisma/client';
import { config } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../utils/async-handler';
import { unauthorized } from '../../utils/errors';
import { abacatePayWebhookSchema, mockPaymentConfirmedSchema } from './webhooks.schemas';

type UnknownRecord = Record<string, unknown>;

function validateWebhookSecret(req: Request) {
  if (!config.webhookSecret) return;

  const providedSecret =
    req.header('x-webhook-secret') ??
    req.header('x-doadog-webhook-secret') ??
    (!config.isProduction
      ? getString(req.query.secret) ?? getString(req.query.webhookSecret) ?? getString(req.query.token)
      : undefined);
  if (providedSecret !== config.webhookSecret) {
    throw unauthorized('Invalid webhook secret.');
  }
}

export function isValidWebhookSignature(rawBody: Buffer, signatureHeader: string, secret: string) {
  const providedSignature = signatureHeader.trim().replace(/^sha256=/i, '');
  if (!/^[a-f0-9]{64}$/i.test(providedSignature)) return false;

  const expectedSignature = createHmac('sha256', secret).update(rawBody).digest('hex');
  const providedBuffer = Buffer.from(providedSignature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

function validateAbacatePayWebhook(req: Request) {
  if (!config.webhookSecret) return;

  const signature = req.header('x-webhook-signature');
  if (signature) {
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!rawBody || !isValidWebhookSignature(rawBody, signature, config.webhookSecret)) {
      throw unauthorized('Invalid webhook signature.');
    }
    return;
  }

  validateWebhookSecret(req);
}

function asRecord(value: unknown): UnknownRecord | undefined {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as UnknownRecord;
  }

  return undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function extractAbacatePayFields(payload: UnknownRecord) {
  const data = asRecord(payload.data) ?? payload;
  const payment = asRecord(data.payment) ?? asRecord(data.pixQrCode) ?? data;

  return {
    eventId: getString(payload.eventId) ?? getString(payload.id),
    type: getString(payload.type) ?? getString(payload.event) ?? 'abacatepay.webhook',
    externalPaymentId:
      getString(payment.externalPaymentId) ??
      getString(payment.externalId) ??
      getString(payment.id) ??
      getString(data.externalPaymentId),
    amountInCents: getNumber(payment.amountInCents) ?? getNumber(payment.amount) ?? getNumber(data.amountInCents),
    status: getString(payment.status) ?? getString(data.status) ?? getString(payload.status),
  };
}

function isPaidStatus(status?: string, type?: string) {
  const normalizedStatus = status?.toLowerCase();
  const normalizedType = type?.toLowerCase();

  return (
    normalizedStatus === 'paid' ||
    normalizedStatus === 'approved' ||
    normalizedStatus === 'completed' ||
    normalizedType?.includes('paid') ||
    normalizedType?.includes('payment_confirmed')
  );
}

async function processPaymentConfirmation(input: {
  provider: PaymentProviderName;
  eventId?: string;
  externalPaymentId: string;
  type: string;
  payload: Prisma.InputJsonValue;
  paidAmountInCents?: number;
}) {
  if (input.eventId) {
    const existingEvent = await prisma.paymentEvent.findUnique({ where: { eventId: input.eventId } });
    if (existingEvent) {
      return { duplicated: true, paid: false, donationFound: true };
    }
  }

  return prisma.$transaction(async (tx) => {
    const event = await tx.paymentEvent.create({
      data: {
        provider: input.provider,
        eventId: input.eventId,
        externalPaymentId: input.externalPaymentId,
        type: input.type,
        payload: input.payload,
      },
    });

    const donation = await tx.donation.findUnique({
      where: { externalPaymentId: input.externalPaymentId },
    });

    if (!donation) {
      return { duplicated: false, paid: false, donationFound: false };
    }

    if (input.paidAmountInCents !== undefined && input.paidAmountInCents !== donation.amountInCents) {
      await tx.paymentEvent.update({
        where: { id: event.id },
        data: { processedAt: new Date() },
      });
      return { duplicated: false, paid: false, donationFound: true, amountMismatch: true };
    }

    if (donation.status !== DonationStatus.PENDING) {
      await tx.paymentEvent.update({
        where: { id: event.id },
        data: { processedAt: new Date() },
      });
      return { duplicated: false, paid: donation.status === DonationStatus.PAID, donationFound: true };
    }

    const paidAt = new Date();

    await tx.donation.update({
      where: { id: donation.id },
      data: {
        status: DonationStatus.PAID,
        paidAt,
      },
    });

    await tx.donationCampaign.update({
      where: { id: donation.campaignId },
      data: {
        currentAmountInCents: {
          increment: donation.amountInCents,
        },
      },
    });

    await tx.paymentEvent.update({
      where: { id: event.id },
      data: { processedAt: paidAt },
    });

    return { duplicated: false, paid: true, donationFound: true };
  });
}

export const mockPaymentConfirmed = asyncHandler(async (req: Request, res: Response) => {
  validateWebhookSecret(req);
  const { body } = mockPaymentConfirmedSchema.parse(req);

  const result = await processPaymentConfirmation({
    provider: PaymentProviderName.MOCK,
    eventId: body.eventId,
    externalPaymentId: body.externalPaymentId,
    type: 'mock.payment_confirmed',
    payload: body,
  });

  res.json({
    received: true,
    ...result,
  });
});

export const abacatePayWebhook = asyncHandler(async (req: Request, res: Response) => {
  validateAbacatePayWebhook(req);
  const { body } = abacatePayWebhookSchema.parse(req);
  const fields = extractAbacatePayFields(body);

  if (fields.eventId) {
    const existingEvent = await prisma.paymentEvent.findUnique({ where: { eventId: fields.eventId } });
    if (existingEvent) {
      res.json({ received: true, duplicated: true });
      return;
    }
  }

  if (!fields.externalPaymentId || !isPaidStatus(fields.status, fields.type)) {
    await prisma.paymentEvent.create({
      data: {
        provider: PaymentProviderName.ABACATEPAY,
        eventId: fields.eventId,
        externalPaymentId: fields.externalPaymentId,
        type: fields.type,
        payload: body as Prisma.InputJsonValue,
      },
    });

    res.json({ received: true, processed: false });
    return;
  }

  const result = await processPaymentConfirmation({
    provider: PaymentProviderName.ABACATEPAY,
    eventId: fields.eventId,
    externalPaymentId: fields.externalPaymentId,
    type: fields.type,
    payload: body as Prisma.InputJsonValue,
    paidAmountInCents: fields.amountInCents,
  });

  res.json({
    received: true,
    ...result,
  });
});
