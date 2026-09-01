import { Router } from 'express';
import {
  createAdoptionRequest,
  listAdoptionRequests,
  updateAdoptionRequestStatus,
} from './adoptionRequests.controller';

export const adoptionRequestRoutes = Router();

adoptionRequestRoutes.post('/create', ...createAdoptionRequest);
adoptionRequestRoutes.post('/', ...createAdoptionRequest);
adoptionRequestRoutes.get('/list', ...listAdoptionRequests);
adoptionRequestRoutes.get('/', ...listAdoptionRequests);
adoptionRequestRoutes.patch('/update-status/:id', ...updateAdoptionRequestStatus);
adoptionRequestRoutes.patch('/:id/status', ...updateAdoptionRequestStatus);
