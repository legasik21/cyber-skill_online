import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Check if visitor_id cookie exists
  const visitorId = request.cookies.get('visitor_id')?.value;
  
  // Generate and set visitor_id if it doesn't exist
  if (!visitorId) {
    const newVisitorId = uuidv4();
    response.cookies.set('visitor_id', newVisitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }
  
  return response;
}

// Apply middleware to all routes except static files and api routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
