import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { authRateLimiter } from '../../middlewares/rateLimit.middleware';
import { login, logout, me, register } from './auth.controller';

export const authRoutes = Router();

authRoutes.post('/register', authRateLimiter, register);
authRoutes.post('/login', authRateLimiter, login);
authRoutes.get('/me', authMiddleware, me);
authRoutes.post('/logout', authMiddleware, logout);
