import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('twitch_session');
  const isAuthPath = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/api/auth');
  
  // Allow auth-related paths without authentication
  if (isAuthPath) {
    return NextResponse.next();
  }
  
  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};