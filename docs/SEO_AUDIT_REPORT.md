# SEO Audit Report — CyberSkill

- **Date:** 2026-06-14
- **Build audited:** Next.js 15.3 **production** build (`npm run build && npm start`), served at `http://localhost:3000`
- **Run type:** Read-only analysis (no application source modified). Baseline for the post-deploy live re-audit.
- **Plan:** `docs/SEO_AUDIT_PLAN.md`
- **Evidence base:** static code review + `next build` output + live HTTP/HTML capture of the production server.

---

## Executive Summary

The site is **well-built as an app but has almost no SEO layer**. Pages render as clean, statically-prerendered HTML (good), but **every one of the 23 public routes ships the identical `<title>` and `<meta description>`**, and there is **no sitemap, no robots.txt, no canonical tags, no Open Graph/Twitter, and no structured data anywhere**. For a competitive niche (WoT boosting), this means Google currently has almost nothing to differentiate or richly present these pages.

**Overall readiness: NOT ready for organic search.** The good news: the gaps are additive (mostly missing metadata/infra), the content itself is solid and unique per service, and there are no crawl-blocking disasters. The single architectural blocker is that **every page is a Client Component (`"use client"`)**, which is why no per-page metadata exists — fixing that unlocks most P0 items at once.

### Top priorities
1. **Unique per-route titles + meta descriptions** (blocked by the client-component pattern — fix via per-route `layout.tsx`). — *Critical*
2. **Add `app/sitemap.ts` + `app/robots.ts`.** — *High*
3. **Canonical tags per route** (relative now; absolute via `metadataBase` at deploy). — *High*
4. **`noindex` the non-public routes** (`admin/*`, `order/*`). — *High*
5. **Structured data**: Organization + WebSite sitewide, Service + BreadcrumbList per service, Review/AggregateRating on services. — *High*

### Quick wins
- Remove the viewport zoom lock (`maximumScale: 1, userScalable: false`) — accessibility + mobile.
- Fix the orphan `/referral` page; link all services in the footer.
- Add a `titleTemplate` (`%s | CyberSkill`) once per-route titles exist.

---

## Environment & method

| Item | Result |
|---|---|
| Framework | Next.js 15.3.3 App Router, React 18, Tailwind v4 |
| Render mode | All public routes `○ (Static)` prerendered (good for crawl/perf) |
| Component model | **Every `page.tsx` is `"use client"`** (incl. home + all services) |
| Language | Single-language; `<html lang="en">` ✓; no `[lang]` segments |
| Shared First-Load JS | 101 kB; Home 188 kB; service pages ~149 kB |
| Caching | Static routes return `Cache-Control: s-maxage=31536000`, `x-nextjs-prerender: 1` ✓ |
| 404 handling | `/<missing>` → HTTP 404 + `<meta robots noindex>` ✓ (Next.js default) |

---

## Phase 1 — Indexation & Crawl Foundations

| # | Issue | Impact | Evidence | Fix |
|---|---|---|---|---|
| 1 | **No XML sitemap** | High | No `app/sitemap.ts`/`public/sitemap.xml`; `find` returned none | Add `app/sitemap.ts` enumerating all public routes (exclude `admin/*`,`api/*`,`order/*`). Absolute URLs resolve via `metadataBase` (deploy). |
| 2 | **No robots.txt** | High | No `app/robots.ts`/`public/robots.txt` | Add `app/robots.ts`: allow public, disallow `/admin`,`/api`,`/order`; reference sitemap (absolute URL deferred). |
| 3 | **No canonical tags** (any page) | High | Live HTML head of `/`, `/services/*`, `/events`, `/terms`: no `rel="canonical"` | Per-route `alternates.canonical` via metadata; absolute resolution via `metadataBase` (deploy). |
| 4 | **`admin/*` indexable** | Medium | `GET /admin/login` → 200, generic title, no `robots` meta | `noindex` admin routes (route metadata and/or middleware header). |
| 5 | **`order/success` & `order/error` indexable** | Low-Med | Both → 200, `robots: <none>` | `noindex` these utility pages. |
| 6 | Versioned URL paths contain dots | Low | `/services/campaign-missions/1.0\|2.0\|3.0` | Functional & crawlable; consider descriptive slugs (e.g. `/campaign-missions/obj-260`). Optional. |
| 7 | **No breadcrumbs** anywhere | Medium | No breadcrumb UI in `Header`/service pages | Add breadcrumb nav on service pages + `BreadcrumbList` JSON-LD (pairs with #15). |
| 8 | **Orphan page `/referral`** | Medium | `grep href="/referral"` → no internal links; page exists at `src/app/referral/page.tsx` | Link it from nav/footer or `noindex`+redirect. Also distinct from `/services/referral-program` → resolve overlap (see #14). |
| 9 | Middleware sets `Set-Cookie` on every HTML response | Low-Med (deploy) | `middleware.ts` sets `visitor_id` cookie; matcher covers all routes | At deploy/CDN, `Set-Cookie` can suppress shared full-page caching. Revisit edge cache config on the live domain. |

**Positives:** Header exposes a full Services dropdown (all 10 services as real `<Link>`s) on every page → services reachable in ≤2 clicks, no service orphans. Clean hub-and-spoke architecture.

---

## Phase 2 — On-Page & Content

| # | Issue | Impact | Evidence | Fix |
|---|---|---|---|---|
| 10 | **Duplicate `<title>` across all 23 routes** | **Critical** | Live HTML: `/`, `/services/wn8-boost`, `/services/credit-farm`, `/events`, `/terms`, `/admin/login` all return `CyberSkill - Professional World of Tanks Boosting Services` | Unique, keyword-forward title per route. |
| 11 | **Duplicate `<meta description>` across all routes** | High | Same routes return the identical description | Unique description per route (150–160 chars, value prop + CTA). |
| 12 | **Client-component metadata blocker (root cause of #10/#11)** | High | Every `page.tsx` is `"use client"`; metadata only in `app/layout.tsx`; `generateMetadata`/`export const metadata` found *only* in layout | Add a server `layout.tsx` per route (or `/services/[slug]` group) exporting `metadata`, wrapping the existing client page. Keeps interactivity intact. |
| 13 | Title is brand-first; no title template | Medium | `app/layout.tsx`: `"CyberSkill - …"` | After #12, set `title.template = "%s \| CyberSkill"` and lead with the keyword. |
| 14 | Potential cannibalization: `/referral` vs `/services/referral-program` | Medium | Two distinct referral pages exist | Consolidate or clearly differentiate intent; canonical the weaker one. |
| 15 | **No structured data anywhere** | High | `grep application/ld+json` → none in code or served HTML | Add JSON-LD: `Organization` (+ `sameAs` from Footer socials) + `WebSite` sitewide; `Service`/`Product` + `BreadcrumbList` per service; `FAQPage` where FAQ content exists; `Review`/`AggregateRating` on services (see #16). |
| 16 | Reviews exist but are not marked up | High | `ReviewsSlider.tsx` = 15 real reviews (names, dates, 4.0–5.0 stars); homepage shows "4.9/5", "5,000+ Orders" | Add `Review`/`AggregateRating`. **Eligibility caveat:** Google does **not** show star rich-results for *self-serving* `Organization`/`LocalBusiness` ratings — attach `AggregateRating` to a `Product`/`Service` entity, keep reviews genuine and visible on-page. |
| 17 | Homepage H1 is brand-led, not keyword-led | Low-Med | `page.tsx` H1: "Dominate the Battlefield with CyberSkill"; primary keyword only in the `<p>` subtitle | Keep brand flavor but ensure "World of Tanks boosting" appears in the H1 or an early H2. |

**Positives:**
- **Headings:** one `<h1>` per page (verified across all routes); generally logical `H1→H2→H3`. No major skips.
- **Content depth:** service pages are genuinely unique (e.g. `wn8-boost` has a price calculator, features, "How It Works"). Legal pages are substantial (`/cookies` ~18 KB, `/privacy` ~16 KB, `/terms` ~10 KB visible text) — **not** thin.
- **Images/alt:** only the logo SVG is used as an image, with `alt="CyberSkill Logo"` in `Header` + `Footer` ✓. No raw `<img>`; no broad alt-text debt. (No `og:image` asset yet — needed for social cards.)

---

## Phase 3 — Technical, Performance & Architecture *(code-level; real CWV deferred)*

| # | Issue | Impact | Evidence | Fix |
|---|---|---|---|---|
| 18 | **Viewport disables zoom** | Med-High | `app/layout.tsx`: `viewport: { maximumScale: 1, userScalable: false }` | Remove `maximumScale`/`userScalable` (WCAG 1.4.4; also a negative mobile-UX signal). |
| 19 | Moderate JS payload | Medium | Build: Home 188 kB First-Load, services ~149 kB, shared 101 kB; `framer-motion` + `react-hook-form` + `zod` on many pages | Lazy-load/trim `framer-motion`, prefer CSS for simple fades, ensure icon tree-shaking. (Real TBT/INP impact measured on live.) |
| 20 | Everything is a Client Component | Medium | All `page.tsx` `"use client"` | Convert static sections (legal pages, service info/"How It Works") to Server Components to cut hydration JS. Ties to the #12 refactor. |
| 21 | No `manifest.webmanifest` | Low | `find` → none | Optional: add `app/manifest.ts` for icons/PWA metadata. |
| 22 | **`metadataBase` not set** | (Deferred) | `app/layout.tsx` has no `metadataBase` | Set at deploy — required to make OG/canonical/sitemap URLs absolute in Next.js. |
| 23 | Accessibility (code-level heuristics) | Medium | Form labels (`htmlFor`+`id`) ✓, icon-button `aria-label`s ✓, but zoom disabled (#18); muted-foreground contrast unverified | Fix #18; run a full axe/Lighthouse a11y pass (valid on localhost) to confirm contrast/focus order. |

**Positives:**
- Fonts via `next/font` (Geist / Geist_Mono), self-hosted + preloaded (woff2 `rel=preload` seen in headers) → no font-driven CLS ✓.
- No heavy hero images → LCP is likely H1 text; low image-driven CLS risk.
- Static prerendering + long `s-maxage` caching ✓.
- `<html lang="en">` correct; single-language so no hreflang work required.

---

## DEFERRED — re-audit on the LIVE domain after deploy

These cannot be validated on localhost. Do **not** hardcode to localhost values.

- [ ] **Real Core Web Vitals** (LCP / INP / TTFB / CLS) with field + lab data on the live domain/CDN.
- [ ] **`metadataBase`** set to the production origin (drives absolute OG/canonical/sitemap URLs).
- [ ] **Canonical URLs** resolve to the correct absolute production URLs.
- [ ] **HTTPS / valid SSL / HSTS**; no mixed content.
- [ ] **www vs non-www** canonical choice; **HTTP→HTTPS** redirects.
- [ ] **Absolute URLs** in Open Graph, Twitter, sitemap, and JSON-LD.
- [ ] **`og:image`** asset served from the domain.
- [ ] **robots.txt + sitemap submission** to Search Console; indexation/coverage check (`site:` + Coverage report).
- [ ] **CDN/edge caching** interaction with the middleware `Set-Cookie` (issue #9).

---

## Prioritized action plan (proposed fix plan — awaiting GATE 1)

### P0 — Critical (blocks ranking; do first)
1. **Unblock per-page metadata** (#12): add a server `layout.tsx` per route / `/services` group exporting `metadata`, wrapping the existing client pages.
2. **Unique titles + descriptions** for all 23 routes (#10, #11) + `title.template` (#13).
3. **`app/robots.ts` + `app/sitemap.ts`** (#1, #2) — exclude `admin/*`,`api/*`,`order/*`.
4. **Canonical tags** per route (#3) — relative now, absolute via `metadataBase` at deploy.
5. **`noindex`** `admin/*` and `order/*` (#4, #5).

### P1 — High impact
6. **Structured data** (#15, #16): Organization + WebSite (sitewide) → Service + BreadcrumbList + AggregateRating per service.
7. **Breadcrumbs** UI + schema (#7).
8. **Remove viewport zoom lock** (#18).
9. **Keyword-forward H1/titles** (#17).

### P2 — Quick wins / medium
10. Fix orphan `/referral` + resolve `/referral` vs `/services/referral-program` overlap (#8, #14).
11. Footer: link all 10 services (currently 4).
12. Add OG/Twitter tags + `og:image` (structure now; absolute URL at deploy).
13. Reduce JS: lazy `framer-motion`, convert static sections to Server Components (#19, #20).

### P3 — Deploy-time / long-term
14. Set `metadataBase`; complete the **DEFERRED** checklist; submit sitemap to Search Console; measure real CWV; review CDN cache vs cookie (#9, #22).

---

## Implementation Log — P0–P2 applied (2026-06-14)

The findings tables above describe the **pre-fix** state (the baseline to diff against on the live domain). After GATE 1 approval, the P0–P2 code-level fixes were implemented and verified against a fresh production build (`npm run build && npm start`, HTTP-checked, server then shut down).

**New files**
- `src/lib/seo.ts` — central SEO config + `pageMetadata()` and JSON-LD builders (Organization, WebSite, Service, BreadcrumbList, Product+AggregateRating+Review). `SITE_URL` reads `NEXT_PUBLIC_SITE_URL` (localhost fallback — **set at deploy**).
- `src/lib/reviews.ts` — single source of truth for reviews (shared by `ReviewsSlider` + homepage schema).
- `src/components/JsonLd.tsx` — JSON-LD `<script>` renderer.
- `src/app/robots.ts`, `src/app/sitemap.ts` — robots.txt (disallow `/admin`,`/api`,`/order`) + 20-URL sitemap.
- `src/app/opengraph-image.tsx` — generated 1200×630 branded OG/Twitter image (no static asset / domain needed).
- 21 per-route `layout.tsx` files: 13 services (metadata + Service + BreadcrumbList), 6 content pages (`events`, `referral`, `guarantee`, `cookies`, `privacy`, `terms`), and `admin/` + `order/` (noindex).

**Changed files**
- `src/app/layout.tsx` — `metadataBase`, `title.template` (`%s | CyberSkill`), default OG/Twitter, sitewide Organization + WebSite JSON-LD; **removed the viewport zoom lock**.
- `src/app/page.tsx` — homepage Product/AggregateRating/Review JSON-LD; H1 now keyword-led ("WoT Boosting Service by CyberSkill"), so the page targets "WoT boosting" in the H1 while the `<title>`/subtitle keep the full "World of Tanks boosting" variant.
- `src/components/ReviewsSlider.tsx` — uses shared `reviews` data.
- `src/components/Footer.tsx` — all 10 services linked + `/referral` (orphan fixed).

**Status by item**

| Item | Status |
|---|---|
| #1/#2 robots.txt + sitemap.xml | ✅ Done |
| #3 canonical per route (self-referencing) | ✅ Done (absolute via `metadataBase` at deploy) |
| #4/#5 noindex admin/order | ✅ Done (`noindex, nofollow` verified) |
| #8 orphan `/referral` + #14 cannibalization | ✅ Done (footer link + differentiated metadata) |
| #10/#11/#12/#13 unique titles+descriptions, client-metadata blocker, template | ✅ Done (per-route layouts; all 23 unique, verified) |
| #15/#16 structured data + Review/AggregateRating | ✅ Done (Org, WebSite, Service, Breadcrumb sitewide/per-service; Product+AggregateRating 4.7/15 + 15 Reviews on home) |
| #17 keyword-forward H1/titles | ✅ Done |
| #18 viewport zoom lock | ✅ Done (removed) |
| #7 breadcrumbs | ⚠️ **Schema done; visible breadcrumb UI not added** (optional UX follow-up — keep visible trail in sync with schema) |
| #19/#20 JS payload reduction (lazy framer-motion, client→server) | ❌ **Not done** — larger architectural refactor; deferred (recommend a dedicated pass) |
| #22 `metadataBase` + DEFERRED checklist | ⏳ Deploy-time (see below) |

**Bugs found during verification & fixed:** campaign-missions child routes (`1.0/2.0/3.0`) lost the `| CyberSkill` title suffix and rendered duplicate Service/BreadcrumbList schema (parent layout cascading). Fixed by giving the parent an absolute title + explicit child template and moving the parent's JSON-LD into its `page.tsx`. Re-verified: each campaign route now has 1 Service + 1 BreadcrumbList and the correct title.

**Before merge / at deploy (required):**
- Set `NEXT_PUBLIC_SITE_URL` to the production origin so canonical/OG/sitemap/JSON-LD URLs become absolute (currently resolve to `http://localhost:3000`).
- Then work the **DEFERRED — re-audit on the live domain** checklist above (real CWV, HTTPS/HSTS, www, redirects, sitemap submission, indexation).

**Not addressed this pass (optional follow-ups):** visible breadcrumb UI (#7); JS/bundle reduction (#19/#20). Pre-existing `npm run lint` failure (ESLint 9 cannot resolve `eslint-config-next/core-web-vitals`) is unrelated to these changes and is already bypassed by `eslint.ignoreDuringBuilds` in `next.config.ts`.

*Baseline tables reflect the pre-fix state. Re-run this audit on the live domain post-deploy and diff to validate the deferred items.*
