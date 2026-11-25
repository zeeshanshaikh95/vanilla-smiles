import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/** Treat blank values as unset (common on hosting platforms). */
function envValue(name: string): string | undefined {
  const raw = process.env[name];
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  return trimmed === '' ? undefined : trimmed;
}

function requireEnv(name: string, fallback?: string): string {
  const value = envValue(name) ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. See .env.example at the project root.`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return envValue(name) ?? fallback;
}

function numberEnv(name: string, fallback: number): number {
  const raw = envValue(name);
  const parsed = raw === undefined ? fallback : Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const config = {
  env: optionalEnv('NODE_ENV', 'development'),
  port: numberEnv('PORT', 4000),
  mongoUri: requireEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017/vanilla-smiles'),
  jwtSecret: requireEnv(
    'JWT_SECRET',
    'dev-only-insecure-secret-change-me-2f7c1d8b4a960e35c7b1d4f8a2e6903c'
  ),
  jwtExpiresIn: optionalEnv('JWT_EXPIRES_IN', '12h'),
  corsOrigins: optionalEnv('CORS_ORIGINS', 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean),
  publicSiteUrl: optionalEnv('PUBLIC_SITE_URL', 'http://localhost:5173'),
  publicApiUrl: optionalEnv('PUBLIC_API_URL', 'http://localhost:4000'),
  adminEmail: optionalEnv('ADMIN_EMAIL', 'admin@vanillasmiles.local'),
  adminPassword: optionalEnv('ADMIN_PASSWORD', 'HayaNur@2026'),
  autoSeed: envValue('AUTO_SEED') === 'true',
  uploadsUrlPrefix: '/uploads',
  upload: {
    maxBytes: numberEnv('UPLOAD_MAX_BYTES', 8 * 1024 * 1024),
    maxFiles: numberEnv('UPLOAD_MAX_FILES', 10),
  },
} as const;

export const isProd = config.env === 'production';
