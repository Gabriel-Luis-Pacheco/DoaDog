import { Router } from 'express';
import { createPartner, getPartner, listPartners, updatePartner } from './partners.controller';

export const partnerRoutes = Router();

partnerRoutes.get('/list', listPartners);
partnerRoutes.get('/detail/:id', getPartner);
partnerRoutes.get('/', listPartners);
partnerRoutes.get('/:id', getPartner);
partnerRoutes.post('/create', ...createPartner);
partnerRoutes.post('/', ...createPartner);
partnerRoutes.put('/update/:id', ...updatePartner);
partnerRoutes.put('/:id', ...updatePartner);
partnerRoutes.patch('/update/:id', ...updatePartner);
partnerRoutes.patch('/:id', ...updatePartner);
