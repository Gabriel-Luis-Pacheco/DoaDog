import { PaymentProviderName } from '@prisma/client';
import { config } from '../../config/env';
import { AppError } from '../../utils/errors';
import { CreatePixPaymentInput, CreatePixPaymentResult, PaymentProvider } from './payment-provider';

type AbacatePayPixResponse = {
  data?: {
    id?: string;
    externalId?: string;
    brCode?: string;
    qrCode?: string;
    brCodeBase64?: string;
    qrCodeBase64?: string;
    expiresAt?: string;
  };
  id?: string;
  externalId?: string;
  brCode?: string;
  qrCode?: string;
  brCodeBase64?: string;
  qrCodeBase64?: string;
  expiresAt?: string;
};

const ABACATEPAY_PIX_ENDPOINT = 'https://api.abacatepay.com/v1/pixQrCode/create';
const PAYMENT_PROVIDER_TIMEOUT_MS = 10000;

export class AbacatePayProvider implements PaymentProvider {
  getProviderName() {
    return PaymentProviderName.ABACATEPAY;
  }

  async createPixPayment(input: CreatePixPaymentInput): Promise<CreatePixPaymentResult> {
    if (!config.ABACATEPAY_API_KEY) {
      throw new AppError(500, 'AbacatePay API key is not configured.', 'PAYMENT_PROVIDER_NOT_CONFIGURED');
    }

    let response: Response;

    try {
      response = await fetch(ABACATEPAY_PIX_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.ABACATEPAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(PAYMENT_PROVIDER_TIMEOUT_MS),
        body: JSON.stringify({
          amount: input.amountInCents,
          description: `DoaDog - ${input.campaignTitle}`,
          expiresIn: 1800,
          customer: {
            name: input.donorName,
            email: input.donorEmail,
          },
          metadata: {
            campaignId: input.campaignId,
          },
        }),
      });
    } catch {
      throw new AppError(502, 'Payment provider is unavailable.', 'PAYMENT_PROVIDER_UNAVAILABLE');
    }

    if (!response.ok) {
      throw new AppError(502, 'Payment provider request failed.', 'PAYMENT_PROVIDER_ERROR');
    }

    const payload = (await response.json()) as AbacatePayPixResponse;
    const data = payload.data ?? payload;
    const externalPaymentId = data.externalId ?? data.id;
    const brCode = data.brCode ?? data.qrCode;
    const brCodeBase64 = data.brCodeBase64 ?? data.qrCodeBase64;

    if (!externalPaymentId || !brCode || !brCodeBase64) {
      throw new AppError(502, 'Payment provider returned an incomplete PIX payload.', 'PAYMENT_PROVIDER_INVALID_RESPONSE');
    }

    return {
      externalPaymentId,
      brCode,
      brCodeBase64,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : new Date(Date.now() + 30 * 60 * 1000),
    };
  }
}
