import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().default('file:./dev.db'),
  DATABASE_PROVIDER: z.enum(['sqlite', 'mysql', 'postgresql']).default('sqlite'),
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required').default('development-secret-key-replace-in-production-12345'),
  KODPRESS_UPLOAD_DIR: z.string().default('public/uploads'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_PROVIDER: process.env.DATABASE_PROVIDER,
  AUTH_SECRET: process.env.AUTH_SECRET,
  KODPRESS_UPLOAD_DIR: process.env.KODPRESS_UPLOAD_DIR,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
export default env;
