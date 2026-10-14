import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`\n✅ MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Error: ${error.message}`);
    // In production or CLI scripts, exit on failure; in tests/dev, log error clearly
    if (process.env.NODE_ENV !== 'test') {
      console.error('Fatal database connection error. Exiting application...');
      process.exit(1);
    }
    throw error;
  }
};
