export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, message: string, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const badRequest = (message = 'Invalid request.') => new AppError(400, message, 'BAD_REQUEST');
export const unauthorized = (message = 'Authentication required.') => new AppError(401, message, 'UNAUTHORIZED');
export const forbidden = (message = 'Forbidden.') => new AppError(403, message, 'FORBIDDEN');
export const notFound = (message = 'Resource not found.') => new AppError(404, message, 'NOT_FOUND');
export const conflict = (message = 'Resource already exists.') => new AppError(409, message, 'CONFLICT');
