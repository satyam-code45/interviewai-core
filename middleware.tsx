import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware - No authentication needed
 * This app is only accessed from authenticated endpoints
 * All routes are accessible without checks
 */
export async function middleware(request: NextRequest) {
  // No authentication check needed - assuming user is already authenticated
  // from the parent/redirecting endpoint
  return NextResponse.next();
}

export const config = {
  // No route protection needed
  matcher: [],
};
