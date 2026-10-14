import dotenv from 'dotenv';
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || (nodeEnv === 'production' ? null : 'workvault_secret_key_default');

if (nodeEnv === 'production' && !jwtSecret) {
  throw new Error('JWT_SECRET must be configured in production');
}

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret,
  jwtExpiresIn: '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
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
