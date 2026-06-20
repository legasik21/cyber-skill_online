import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { routing } from '@/i18n/routing';

// next-intl locale routing: handles the en (no-prefix) / de (/de) split,
// Accept-Language detection on first visit, NEXT_LOCALE cookie persistence and
// the alternate-link headers for search engines.
const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Run locale routing first; everything below decorates its response.
  const response = handleI18nRouting(request);

  // Ensure every visitor has a stable, httpOnly visitor_id cookie (used by the
  // public chat). Admin/api are excluded by the matcher, so this only runs on
  // public, localized routes — exactly where the chat widget lives.
  if (!request.cookies.get('visitor_id')?.value) {
    response.cookies.set('visitor_id', uuidv4(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }

  return response;
}

export const config = {
  // Run ONLY on public, localizable routes. Excludes:
  //   - /api and /admin            (kept entirely out of i18n; admin auth is
  //                                 enforced server-side, admin APIs self-check)
  //   - /_next, /_vercel           (framework internals)
  //   - /opengraph-image           (root metadata image route, no locale)
  //   - paths ENDING in a known static-file extension (favicon.ico, sitemap.xml,
  //     robots.txt, logos, fonts, …). We intentionally do NOT exclude every path
  //     containing a "." — the campaign routes /services/campaign-missions/1.0,
  //     /2.0 and /3.0 contain dots but are real, indexed pages that must be
  //     locale-rewritten (so /services/campaign-missions/1.0 stays prefix-free en).
  matcher: [
    '/((?!api|admin|_next|_vercel|opengraph-image|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|css|js|mjs|map|woff|woff2|ttf|otf|eot|txt|xml|json|mp4|webm|pdf)$).*)',
  ],
};
