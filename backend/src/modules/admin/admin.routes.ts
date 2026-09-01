import { Router } from 'express';
import { getModerationQueue, moderateCampaign, moderateDog } from './admin.controller';

export const adminRoutes = Router();

adminRoutes.get('/moderation', ...getModerationQueue);
adminRoutes.patch('/moderation/dogs/:id', ...moderateDog);
adminRoutes.patch('/moderation/donation-campaigns/:id', ...moderateCampaign);
