import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import mongoose from 'mongoose';

// Custom format for pretty-printing logs
const prettyPrint = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += '\n' + JSON.stringify(metadata, null, 2);
  }
  return msg;
});

// Create a Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    prettyPrint
  ),
  defaultMeta: { service: 'workout-app' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console());
}

// Helper function to truncate long strings
const truncate = (str: any, maxLength: number = 100): string => {
  if (str === undefined || str === null) return '';
  const stringified = typeof str === 'string' ? str : JSON.stringify(str);
  if (stringified.length <= maxLength) return stringified;
  return stringified.slice(0, maxLength) + '...';
};

// Middleware to log requests and responses
export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request
  logger.info(`Incoming ${req.method} request to ${req.originalUrl}`, {
    ip: req.ip,
    headers: truncate(req.headers),
    body: truncate(req.body)
  });

  // Capture the original end function
  const originalEnd = res.end;
  let responseBody: any;

  // Override end function to capture response body
  res.end = function (chunk: any, ...rest: any[]) {
    if (chunk) {
      responseBody = chunk.toString();
    }
    originalEnd.apply(res, [chunk, ...rest]);
  };

  // Log response when it's finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`Outgoing response for ${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      headers: truncate(res.getHeaders()),
      body: truncate(responseBody)
    });
  });

  next();
};

// Mongoose middleware to log database operations
mongoose.set('debug', (collectionName: string, method: string, query: any, doc: any) => {
  logger.info(`MongoDB ${method} operation on ${collectionName}`, {
    query: truncate(query),
    doc: truncate(doc)
  });
});

export { logger };