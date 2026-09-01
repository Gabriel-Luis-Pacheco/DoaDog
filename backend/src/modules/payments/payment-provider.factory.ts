import { config } from '../../config/env';
import { AbacatePayProvider } from './abacatepay.provider';
import { MockPixProvider } from './mock-pix.provider';
import { PaymentProvider } from './payment-provider';

export function makePaymentProvider(): PaymentProvider {
  if (config.PAYMENT_PROVIDER === 'abacatepay') {
    return new AbacatePayProvider();
  }

  return new MockPixProvider();
}
