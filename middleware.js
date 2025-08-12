// middleware.js
import { NextResponse } from 'next/server';
import { loginRateLimiter } from './lib/rate-limiter';

export async function middleware(req) {
  // Apply rate limiting only to the credentials sign-in API route
  if (req.nextUrl.pathname === '/api/auth/callback/credentials' && req.method === 'POST') {
    try {
      await new Promise((resolve, reject) => {
        // express-rate-limit middleware expects `next` function to be called.
        // We can simulate it to resolve or reject the promise.
        loginRateLimiter(req, NextResponse.next(), (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      return NextResponse.next();
    } catch (error) {
      // If rate-limited, the error object from express-rate-limit is not a standard Response,
      // so we construct a new one.
      return new NextResponse('Too many requests.', { status: 429 });
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/auth/callback/credentials',
};
