import { Router } from 'express';
import { abacatePayWebhook, mockPaymentConfirmed } from './webhooks.controller';

export const webhookRoutes = Router();

webhookRoutes.post('/mock/payment-confirmed', mockPaymentConfirmed);
webhookRoutes.post('/abacatepay', abacatePayWebhook);
