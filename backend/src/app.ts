import express from 'express';
import type { Request } from 'express';
import path from 'node:path';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { globalRateLimiter } from './middlewares/rateLimit.middleware';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/users.routes';
import { dogRoutes } from './modules/dogs/dogs.routes';
import { donationCampaignRoutes } from './modules/donationCampaigns/donationCampaigns.routes';
import { donationRoutes } from './modules/donations/donations.routes';
import { webhookRoutes } from './modules/webhooks/webhooks.routes';
import { adoptionRequestRoutes } from './modules/adoptionRequests/adoptionRequests.routes';
import { partnerRoutes } from './modules/partners/partners.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { uploadRoutes } from './modules/uploads/uploads.routes';

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin && !config.isProduction) {
      callback(null, true);
      return;
    }

    if (origin && config.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('CORS origin not allowed.'));
  },
  credentials: true,
};

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors(corsOptions));
app.use(
  express.json({
    limit: '100kb',
    verify: (req, _res, buffer) => {
      (req as Request & { rawBody?: Buffer }).rawBody = Buffer.from(buffer);
    },
  })
);
app.use(globalRateLimiter);
app.use('/uploads', express.static(path.resolve(config.UPLOAD_DIR)));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'doadog-backend',
  });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/dogs', dogRoutes);
app.use('/uploads', uploadRoutes);
app.use('/adoption-requests', adoptionRequestRoutes);
app.use('/donation-campaigns', donationCampaignRoutes);
app.use('/donations', donationRoutes);
app.use('/partners', partnerRoutes);
app.use('/admin', adminRoutes);
app.use('/webhooks', webhookRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
