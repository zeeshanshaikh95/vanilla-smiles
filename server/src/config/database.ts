import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10_000,
  });
  console.log(`[db] connected to ${config.mongoUri.replace(/\/\/[^@]*@/, '//***@')}`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
