// middleware.js
import { NextResponse } from "next/server";

export async function middleware(req) {
  // Basic middleware for portfolio site
  return NextResponse.next();
}

// Minimal configuration for basic portfolio
export const config = {
  matcher: [
    // Add paths that need middleware processing
  ],
};
