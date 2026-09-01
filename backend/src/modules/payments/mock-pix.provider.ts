import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { PaymentProviderName } from '@prisma/client';
import { CreatePixPaymentInput, CreatePixPaymentResult, PaymentProvider } from './payment-provider';

export class MockPixProvider implements PaymentProvider {
  getProviderName() {
    return PaymentProviderName.MOCK;
  }

  async createPixPayment(input: CreatePixPaymentInput): Promise<CreatePixPaymentResult> {
    const externalPaymentId = `mock_${randomUUID()}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const brCode = [
      '000201',
      '010212',
      `26${String(input.campaignId.length).padStart(2, '0')}${input.campaignId}`,
      `54${(input.amountInCents / 100).toFixed(2)}`,
      '5802BR',
      '5907DOADOG',
      '6009SAO PAULO',
      `62${String(externalPaymentId.length).padStart(2, '0')}${externalPaymentId}`,
      '6304MOCK',
    ].join('');

    return {
      externalPaymentId,
      brCode,
      brCodeBase64: Buffer.from(`MOCK_PIX:${brCode}`, 'utf8').toString('base64'),
      expiresAt,
    };
  }
}
