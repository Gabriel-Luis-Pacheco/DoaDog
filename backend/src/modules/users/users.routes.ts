import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { getProfile, updateProfile } from './users.controller';

export const userRoutes = Router();

userRoutes.get('/me', authMiddleware, getProfile);
userRoutes.get('/profile', authMiddleware, getProfile);
userRoutes.put('/profile', authMiddleware, updateProfile);
userRoutes.patch('/profile', authMiddleware, updateProfile);
