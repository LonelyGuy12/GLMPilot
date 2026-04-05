import cors from 'cors';
import { config } from '../config/env.js';

export const corsMiddleware = cors({
  origin: config.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
