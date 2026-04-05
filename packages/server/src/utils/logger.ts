import winston from 'winston';
import { config } from '../config/env.js';

const { combine, timestamp, printf, colorize, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

const prodFormat = combine(timestamp(), json());

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: config.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
  defaultMeta: { service: 'glmpilot-server' },
});
