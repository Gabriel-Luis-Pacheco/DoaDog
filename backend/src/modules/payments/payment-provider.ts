import { PaymentProviderName } from '@prisma/client';

export interface CreatePixPaymentInput {
  amountInCents: number;
  donorName: string;
  donorEmail: string;
  campaignId: string;
  campaignTitle: string;
}

export interface CreatePixPaymentResult {
  externalPaymentId: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt: Date;
}

export interface PaymentProvider {
  getProviderName(): PaymentProviderName;
  createPixPayment(input: CreatePixPaymentInput): Promise<CreatePixPaymentResult>;
}
