# SEO Audit Plan — CyberSkill (localhost production build)

> Status: executed 2026-06-14 (read-only pass). Findings → `docs/SEO_AUDIT_REPORT.md`.
> This plan governs both the pre-deploy localhost audit and the post-deploy live re-audit.

## CONTEXT
- **Target:** LOCAL production build at `http://localhost:3000` (not yet on a domain). Confirm the port from the production server (`next start` defaults to 3000).
- **Project:** Next.js 15.3 App Router, TypeScript, Tailwind v4, `output: "standalone"`. World of Tanks boosting-services site (WN8 boost, credit farm, tier leveling, battle pass, campaign missions, onslaught, etc.).
- **Goal:** Maximize the codebase's organic-search readiness *before* it goes live on a domain.
- **Scope:** Full on-page + code-level technical SEO of the rendered production build. Public routes only; `admin/*` and `api/*` are out of ranking scope (admin should be noindex).
- **Language:** Single-language (`<html lang="en">`, no `[lang]` segments). i18n/hreflang scope therefore minimal — verify `<html lang>` only.

## LOCALHOST HANDLING
- Audit a PRODUCTION build, not the dev server: run build + preview (**Next.js: `npm run build && npm start`, serves `http://localhost:3000`**) and point the audit at that localhost URL. The dev server's HTML/bundle is not what ships.
  - **Fallback:** if `next start` complains under `output: "standalone"`, serve via `node .next/standalone/server.js`.
- Core Web Vitals / perf on localhost are NOT real-world (no network, CDN, or prod TTFB). Take impeccable/perf findings as CODE-LEVEL only — images, lazy-loading, bundle size, render/layout — which carry over. Absolute LCP/INP/TTFB numbers do not; re-measure on the live domain later.
- DEFER domain-dependent items to post-deploy (flag them, do NOT "fix" them to localhost values): canonical URLs, HTTPS/HSTS, www vs non-www, HTTP→HTTPS redirects, absolute URLs in Open Graph / sitemap / JSON-LD, robots.txt + sitemap submission, indexation / Search Console checks, **`metadataBase` (`app/layout.tsx`) — the value that makes OG/canonical absolute in Next.js; set it at deploy.**
- DO fully now: titles, meta descriptions, H1 + heading hierarchy, alt text, internal linking, URL path structure, content / keyword targeting, schema presence + validity, accessibility, code-level frontend performance, site architecture.

## PREP
1. **Build & serve:** `npm run build && npm start`; confirm `http://localhost:3000`. Capture build output (bundle sizes, static vs dynamic routes, warnings).
2. **Route inventory** from `src/app/**/page.tsx`. Detect the language setup: if multilingual, ADD hreflang annotations, per-language canonical, and per-language sitemap entries to scope; if single-language, just verify `<html lang>`. *(Result: single-language.)*
3. **SEO infra in code:** `app/layout.tsx` metadata, `generateMetadata`, `robots.ts`/`sitemap.ts`/`manifest.ts`, `middleware.ts`, JSON-LD, OG/Twitter, `metadataBase`, `<html lang>`.
4. **Tooling:** render production pages and read the real DOM/served HTML (titles, meta, headings, canonical, JSON-LD). `web_fetch` strips `<script>` — use rendered DOM or the served SSR/SSG HTML for schema.

## Phase 1 — Indexation & Crawl Foundations *(code-level)*
- Per-route robots directives; noindex `admin/*` and `order/*` utility pages.
- `robots.txt` + `sitemap.xml` presence & validity (generation is code-level; *submission* deferred).
- Canonical presence & self-reference pattern now (absolute domain values deferred via `metadataBase`).
- URL structure: lowercase, hyphenated, logical `/services/<slug>`; flag versioned `/campaign-missions/1.0|2.0|3.0`.
- Crawl depth ≤3 clicks; orphan check.

## Phase 2 — On-Page & Content
- Titles: unique, 50–60 chars, keyword-forward, brand placement — per route.
- Meta descriptions: unique, 150–160 chars, value prop + CTA — per route.
- Headings: one H1/page, keyword-bearing, logical hierarchy, no skips.
- Content/keywords: intent match per service, thin-content + cannibalization flags.
- Images: `next/image`, alt text, descriptive names, modern formats, lazy-load, responsive.
- Internal linking: descriptive anchors, service cross-linking, no broken links.
- Structured data: presence + schema.org validity — Organization, WebSite, Service/Product, BreadcrumbList, FAQ, **and Review/AggregateRating if the site has real reviews** (rich-result stars). Validate now; absolute URLs inside deferred.

## Phase 3 — Technical, Performance & Architecture *(code-level)*
- Code-level CWV levers: LCP element & priority/preload, render-blocking CSS/JS, `next/font` loading, JS/hydration payload, CLS from unsized media, below-fold lazy-loading.
- Bundle analysis from build output: oversized route bundles, client→server component candidates, unused deps.
- Accessibility: landmarks, alt, contrast, focus states, tap targets, viewport, `lang`.
- Site architecture: nav/IA, breadcrumbs, footer link sanity.
- Mobile/desktop content parity.
- **Real Core Web Vitals and all deferred domain items must be re-audited on the live domain after deployment.**

## Phase 4 — Synthesis & Prioritized Report
- Executive summary + readiness verdict.
- Findings table: Issue / Impact (H-M-L) / Evidence / Fix / Priority, grouped by phase.
- Separate **DEFERRED — re-audit on live domain** checklist.
- Prioritized action plan (critical → high-impact → quick wins → long-term) + proposed fix plan.

## GATE 1
This run is **read-only analysis**. The only writes are this plan and the findings report (markdown in `docs/`). No application source is modified until the user approves the proposed fix plan.
