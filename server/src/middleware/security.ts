import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Security Headers Middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // XSS protection filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy (allows microphone for senior voice companion)
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for React runtime & Vite
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https://images.unsplash.com blob:",
    "connect-src 'self' https://* http://*",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ');
  res.setHeader('Content-Security-Policy', csp);

  // HSTS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Attach a unique request ID for structured logging
  (req as any).requestId = req.headers['x-request-id'] || uuidv4().slice(0, 8);
  res.setHeader('X-Request-Id', (req as any).requestId);

  next();
}

// In-Memory Sliding-Window Rate Limiter
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export function createRateLimiter(options: { windowMs: number; max: number; message: string }) {
  const store = new Map<string, RateLimitRecord>();

  // Cleanup expired entries periodically (every 5 minutes)
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    // In test environment, allow bypassing rate limits
    if (process.env.NODE_ENV === 'test' && req.headers['x-bypass-rate-limit'] === 'test-suite') {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = store.get(ip);

    if (!record || now > record.resetTime) {
      store.set(ip, {
        count: 1,
        resetTime: now + options.windowMs
      });
      res.setHeader('X-RateLimit-Limit', options.max);
      res.setHeader('X-RateLimit-Remaining', options.max - 1);
      return next();
    }

    if (record.count >= options.max) {
      res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      res.status(429).json({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: options.message,
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000)
      });
      return;
    }

    record.count += 1;
    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - record.count));
    next();
  };
}

// Dedicated Rate Limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // max 15 passcode verification attempts per 5 minutes per IP
  message: 'Too many passcode attempts. Please wait 5 minutes before retrying.'
});

export const sosRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Emergency SOS rate limit reached. Please wait 1 minute.'
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 300,
  message: 'API rate limit exceeded. Please reduce request frequency.'
});

// Recursive Input Sanitization
function sanitizeValue(val: any): any {
  if (typeof val === 'string') {
    // Prevent prototype pollution or malicious tags
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags
      .replace(/javascript:/gi, '') // Strip inline javascript pseudoprotocol
      .trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val !== null && typeof val === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const key of Object.keys(val)) {
      // Disallow prototype pollution keys
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      cleanObj[key] = sanitizeValue(val[key]);
    }
    return cleanObj;
  }
  return val;
}

export function sanitizeInputs(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  next();
}

// Safe Centralized Error Handler (No stack trace leaks)
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const requestId = (req as any).requestId || 'unknown';
  const statusCode = err.status || err.statusCode || 500;

  console.error(`[ERROR] [${new Date().toISOString()}] [${requestId}] ${req.method} ${req.path}:`, err.message || err);

  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    code: err.code || 'SERVER_ERROR',
    message: isProduction && statusCode === 500
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal server error',
    requestId
  });
}
