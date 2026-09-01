import { Router } from 'express';
import { optionalAuthMiddleware } from '../../middlewares/auth.middleware';
import { createCampaignPixDonation, getDonationStatus, listMyDonations } from './donations.controller';

export const donationRoutes = Router();

donationRoutes.post('/create-pix', optionalAuthMiddleware, createCampaignPixDonation);
donationRoutes.post('/campaigns/:campaignId/pix', optionalAuthMiddleware, createCampaignPixDonation);
donationRoutes.get('/my', ...listMyDonations);
donationRoutes.get('/status/:id', getDonationStatus);
donationRoutes.get('/:id/status', getDonationStatus);
