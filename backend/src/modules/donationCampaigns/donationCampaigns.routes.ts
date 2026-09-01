import { Router } from 'express';
import { createCampaign, getCampaign, listCampaigns, updateCampaign } from './donationCampaigns.controller';

export const donationCampaignRoutes = Router();

donationCampaignRoutes.get('/list', listCampaigns);
donationCampaignRoutes.get('/detail/:id', getCampaign);
donationCampaignRoutes.get('/', listCampaigns);
donationCampaignRoutes.get('/:id', getCampaign);
donationCampaignRoutes.post('/create', ...createCampaign);
donationCampaignRoutes.post('/', ...createCampaign);
donationCampaignRoutes.put('/update/:id', ...updateCampaign);
donationCampaignRoutes.put('/:id', ...updateCampaign);
