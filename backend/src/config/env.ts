import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must have at least 16 characters'),
  FRONTEND_URL: z.string().optional().default('http://localhost:8081'),
  PUBLIC_API_URL: z.string().url().optional(),
  UPLOAD_DIR: z.string().optional().default('uploads'),
  PAYMENT_PROVIDER: z.enum(['mock', 'abacatepay']).default('mock'),
  ABACATEPAY_API_KEY: z.string().optional().default(''),
  ABACATEPAY_WEBHOOK_SECRET: z.string().optional().default(''),
  WEBHOOK_SECRET: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Invalid environment variables: ${issues}`);
}

const env = parsed.data;
const webhookSecret = env.ABACATEPAY_WEBHOOK_SECRET || env.WEBHOOK_SECRET;

if (env.NODE_ENV === 'production') {
  if (!env.FRONTEND_URL || env.FRONTEND_URL.includes('*')) {
    throw new Error('FRONTEND_URL must be explicit in production. CORS "*" is not allowed.');
  }

  if (env.JWT_SECRET.includes('change-me') || env.JWT_SECRET.includes('replace-with')) {
    throw new Error('JWT_SECRET must be changed in production.');
  }

  if (!webhookSecret || webhookSecret.includes('change-me') || webhookSecret.includes('replace-with')) {
    throw new Error('WEBHOOK_SECRET or ABACATEPAY_WEBHOOK_SECRET must be changed in production.');
  }
}

if (env.PAYMENT_PROVIDER === 'abacatepay' && !env.ABACATEPAY_API_KEY) {
  throw new Error('ABACATEPAY_API_KEY is required when PAYMENT_PROVIDER=abacatepay.');
}

export const config = {
  ...env,
  webhookSecret,
  publicApiUrl: env.PUBLIC_API_URL || `http://localhost:${env.PORT}`,
  isProduction: env.NODE_ENV === 'production',
  corsOrigins: env.FRONTEND_URL.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
