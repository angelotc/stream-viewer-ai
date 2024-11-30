import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/callback',
  '/api/auth/login',
  '/api/auth/validate',
];

export function middleware(request: NextRequest) {
  // Check if the current path is public
  const isPublicPath = PUBLIC_PATHS.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  // Allow public paths without authentication
  if (isPublicPath) {
    return NextResponse.next();
  }

  const session = request.cookies.get('twitch_session');
  
  // Redirect to login if no session exists
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};