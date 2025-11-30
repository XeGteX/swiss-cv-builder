
import dotenv from 'dotenv';
import { z } from 'zod';
// Load .env file
dotenv.config();
const envSchema = z.object({
    PORT: z.string().transform(Number).default('3000'),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters"),
    REFRESH_TOKEN_SECRET: z.string().min(10, "REFRESH_TOKEN_SECRET must be at least 10 characters"),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
    STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
    STRIPE_PRICE_ID_PRO: z.string().min(1, "STRIPE_PRICE_ID_PRO is required"),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    process.exit(1);
}
export const env = _env.data;
