import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { badRequest } from '../../utils/errors';
import { dogImageUpload, uploadDogImage } from './uploads.controller';

export const uploadRoutes = Router();

uploadRoutes.post('/dog-images', authMiddleware, (req, res, next) => {
  dogImageUpload.single('image')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    next(badRequest(error instanceof Error ? error.message : 'Invalid upload.'));
  });
}, uploadDogImage);
