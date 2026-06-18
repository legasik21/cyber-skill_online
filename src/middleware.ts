import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { authConfig } from '@/auth.config';

// Edge-safe NextAuth instance (decodes the JWT session; no Node-only providers).
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const res = NextResponse.next();

  // Ensure every visitor has a stable, httpOnly visitor_id cookie.
  if (!req.cookies.get('visitor_id')?.value) {
    res.cookies.set('visitor_id', uuidv4(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }

  // Gate the admin dashboard + admin API. The login page and /api/auth/* stay public.
  const path = nextUrl.pathname;
  const isAdminPage = path.startsWith('/admin') && path !== '/admin/login';
  const isAdminApi = path.startsWith('/api/admin');

  if ((isAdminPage || isAdminApi) && !req.auth) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', nextUrl));
  }

  return res;
});

export const config = {
  // Run on everything except NextAuth's own endpoints and static assets.
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
