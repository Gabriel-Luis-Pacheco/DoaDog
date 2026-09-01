import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { config } from '../config/env';

export interface JwtUserPayload {
  sub: string;
  role: UserRole;
}

export function signAccessToken(payload: JwtUserPayload) {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyAccessToken(token: string): JwtUserPayload {
  const decoded = jwt.verify(token, config.JWT_SECRET);

  if (typeof decoded === 'string' || !decoded.sub || !decoded.role) {
    throw new Error('Invalid token payload.');
  }

  return {
    sub: String(decoded.sub),
    role: decoded.role as UserRole,
  };
}
