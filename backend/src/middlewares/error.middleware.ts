import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { config } from '../config/env';
import { AppError } from '../utils/errors';

export function notFoundMiddleware(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `Route ${req.method} ${req.path} not found.`, 'ROUTE_NOT_FOUND'));
}

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data.',
        details: config.isProduction ? undefined : error.flatten(),
      },
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const message = error.code === 'P2002' ? 'Duplicated resource.' : 'Database request failed.';
    res.status(error.code === 'P2002' ? 409 : 400).json({
      error: {
        code: 'DATABASE_ERROR',
        message,
      },
    });
    return;
  }

  if (!config.isProduction) {
    console.error(error);
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: config.isProduction ? 'Internal server error.' : error instanceof Error ? error.message : 'Unknown error.',
      stack: config.isProduction || !(error instanceof Error) ? undefined : error.stack,
    },
  });
}
