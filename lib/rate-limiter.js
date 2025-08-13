// lib/rate-limiter.js
// import rateLimit from 'express-rate-limit';
// import MongoStore from 'rate-limit-mongo';

const createRateLimiter = (options) => {
  // Temporarily disable rate limiting for all environments to fix build issues.
  // TODO: Replace with a Next.js-compatible rate-limiting library.
  return (req, res, next) => {
    if (typeof next === "function") {
      next();
    }
  };
};

// Stricter limit for sensitive actions like login
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message:
    "Too many login attempts from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// General purpose limiter for other API routes
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper to apply the middleware to a Next.js API handler
export function applyRateLimiter(handler, limiter) {
  return async (req, res) => {
    try {
      await new Promise((resolve, reject) => {
        limiter(req, res, (result) => {
          if (result instanceof Error) {
            return reject(result);
          }
          return resolve(result);
        });
      });
      // If the rate limiter doesn't throw, proceed with the handler
      return handler(req, res);
    } catch (error) {
      // If rate-limited, the limiter will have already sent the response
      // so we don't need to do anything here.
    }
  };
}
