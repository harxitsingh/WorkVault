import dotenv from 'dotenv';
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || (nodeEnv === 'production' ? null : 'workvault_secret_key_default');

if (nodeEnv === 'production' && !jwtSecret) {
  throw new Error('JWT_SECRET must be configured in production');
}

const parseOrigins = (val) => {
  if (!val) return [];
  return val.split(',').map((s) => s.trim()).filter(Boolean);
};

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175'
];

const envOrigins = [
  ...parseOrigins(process.env.CLIENT_URL),
  ...parseOrigins(process.env.ALLOWED_ORIGINS)
];

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envOrigins]));

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret,
  jwtExpiresIn: '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  allowedOrigins,
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/workvault',
  nodeEnv,
  platformFeePercentage: parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '10'),
  currency: process.env.CURRENCY || 'INR',
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  }
};
