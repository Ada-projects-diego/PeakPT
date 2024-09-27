import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import mongoose from 'mongoose';

// Create a Winston logger
const logger = winston.createLogger({
  level: '[PEAKPT INFO]',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'workout-app' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Middleware to log requests and responses
export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    headers: req.headers,
    body: req.body
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
    logger.info('Outgoing response', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      headers: res.getHeaders(),
      body: responseBody
    });
  });

  next();
};

// Mongoose middleware to log database operations
mongoose.set('debug', (collectionName: string, method: string, query: any, doc: any) => {
  logger.info('MongoDB operation', {
    collection: collectionName,
    method,
    query,
    doc
  });
});

export { logger };