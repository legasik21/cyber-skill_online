# SEO Optimization Plan — CyberSkill

- **Date:** 2026-06-16
- **Scope:** Forward-looking optimization & deploy/launch plan that **extends** the existing
  `docs/SEO_AUDIT_REPORT.md` (audit, 2026-06-14) and `docs/SEO_AUDIT_PLAN.md`. It does **not** repeat the
  baseline audit — it builds on the P0–P2 fixes already applied (per-route titles `%s | CyberSkill`,
  meta descriptions, `robots.ts`, `sitemap.ts`, canonicals, OG/Twitter + `opengraph-image`, JSON-LD,
  noindex on `/admin` + `/order`).
- **New lens vs. the audit:** **paid-traffic quality** (Google Ads Quality Score, landing-page relevance,
  page speed) layered on top of organic SEO, plus a concrete **keyword map**, **content plan**, and
  **internal-linking model** the audit deliberately left out.
- **Stack ground truth (verified in repo):** Next.js 15.3 App Router, `output: "standalone"`, React 18,
  Tailwind v4, `framer-motion`, `react-hook-form`+`zod`, Supabase, Ably chat, GA4 (`G-ZTPTXGLVQ4`) +
  Google Ads (`AW-17868439825`) both wired in `src/app/layout.tsx`.

> **Read order for anyone executing this:** `docs/SEO_AUDIT_REPORT.md` → this file → `src/lib/seo.ts`
> (the single source of truth for `SITE_URL`, metadata builders, and all JSON-LD).

---

## 0. Critical reconciliations before anything ships

Three facts in the codebase are mutually inconsistent and **must be resolved by the owner first** —
every URL the site emits (canonical, OG, sitemap, JSON-LD `@id`s) is wrong until they are.

| # | Conflict | Evidence in repo | Resolution needed |
|---|---|---|---|
| R1 | **`metadataBase` defaults to localhost** | `src/lib/seo.ts` L13–15: `SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"` | Set `NEXT_PUBLIC_SITE_URL` in the production env to the real origin. Until then **every** canonical/OG/sitemap/JSON-LD URL resolves to `http://localhost:3000` and is useless to Google. |
| R2 | **Domain mismatch: `.pro` vs `.online`** | Repo references `cyberskill.pro` (seo.ts docstring L9, `SOCIAL_LINKS` L19–24, `Footer.tsx` socials) and `your-domain.com` (`telegram.ts` L39). Orchestrator states the **live domain is `cyberskill.online`**. | **Pick ONE canonical domain and align everything.** If live = `cyberskill.online`: set `NEXT_PUBLIC_SITE_URL=https://cyberskill.online`, and either (a) migrate socials to match, or (b) keep `.pro` social handles but ensure they still resolve (a 404'd `sameAs` weakens the Organization entity). Do not leave the SEO origin and the social/brand origin on different TLDs. |
| R3 | **Service count: docs say 10, repo has 11** | `src/app/services/` contains `arcade-cabinet` in addition to the 10 named in Phase-0 recon; `sitemap.ts` L22 lists `/services/arcade-cabinet`. | Confirm `arcade-cabinet` is a live, intended service. If yes, it needs a title/description/keyword target like the others (it is currently un-mapped in the recon). If no, remove it from `sitemap.ts` and `noindex` it. |

**Decision gate:** R1–R3 block the entire launch. Nothing else in this document is verifiable until the
canonical origin is set and consistent.

---

## 1. Technical SEO

### 1.1 Domain, origin & `metadataBase` (P0)
- Set `NEXT_PUBLIC_SITE_URL=https://<canonical-domain>` as a **build-time** env var (it is read at module
  load in `src/lib/seo.ts` and inlined into `robots.ts`, `sitemap.ts`, `layout.tsx`, and every JSON-LD
  builder). For `output: "standalone"` it must be present in the build environment / Docker build args,
  not only at runtime, because `NEXT_PUBLIC_*` is baked into the client bundle.
- After deploy, **verify** the resolved absolute URLs:
  - `curl -s https://<domain>/robots.txt` → `Sitemap:` and `Host:` lines show the real domain.
  - `curl -s https://<domain>/sitemap.xml` → 21 `<loc>` entries, all `https://<domain>/…`, no localhost.
  - View-source any service page → `<link rel="canonical">`, `og:url`, and JSON-LD `url`/`@id` are absolute
    and on the canonical host.

### 1.2 Deploy, SSL/HSTS, redirects (P0)
- **Production currently 404s (deploy down) — restoring it is the top blocker.** An unreachable origin
  means zero indexing and zero paid-traffic landing (ads to a dead URL waste spend and get disapproved).
- Once up, verify:
  - **HTTPS + valid cert**, no mixed content (the hero video and OG image must load over HTTPS).
  - **HSTS** header (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`).
  - **One canonical host:** pick `www` **or** non-`www` and 301 the other. Pick `https` and 301 all `http`.
    `metadataBase` must match the chosen host exactly — a canonical that points at the non-preferred host
    creates a redirect-then-canonical loop.
  - Next.js standalone server sits behind the platform/CDN; configure these redirects at the edge/proxy,
    not in app code, so they apply before the request hits Node.

### 1.3 robots & sitemap submission (P0/P1)
- `src/app/robots.ts` already disallows `/admin`, `/api`, `/order` and references the sitemap — good. After
  R1 is fixed it will emit correct absolute URLs.
- **Submit `sitemap.xml` to Google Search Console** (and Bing Webmaster Tools) once live. Verify domain
  ownership via DNS TXT (preferred — covers `www`/non-`www`/`http`/`https` at once).
- Post-submission: watch **Coverage/Pages** for "Discovered – not indexed" and **`site:<domain>`** to
  confirm the 21 routes index. Re-request indexing for the home + top service pages.

### 1.4 Core Web Vitals & JS payload (P1 — directly drives Ads Quality Score)
Real CWV are still unverified (audit measured a localhost build only). Known code-level facts:
- **Home first-load JS ≈ 188 kB**, service pages ≈ 149 kB, shared ≈ 101 kB (audit build output).
- **Every `page.tsx` is `"use client"`** — the whole tree hydrates, inflating TBT/INP.
- `framer-motion` is imported broadly for simple fade/slide effects.

Actions, highest-leverage first:
1. **Convert static sections to Server Components.** Legal pages (`/privacy`, `/cookies`, `/terms`),
   `/guarantee`, and the static "How It Works"/feature blocks on service pages do not need client JS.
   Keep `"use client"` only on genuinely interactive islands (WN8 calculator, order form, chat, sliders).
2. **Lazy-load / trim `framer-motion`.** Replace simple opacity/translate intros with CSS
   transitions/`@keyframes`; `next/dynamic(..., { ssr: false })` the few components that truly need motion.
   This is the single biggest bundle win across all routes.
3. **Hero video LCP** (see 1.5) — the most likely LCP element on Home; treat it as the #1 CWV lever there.
4. After deploy, measure **field** data (CrUX in Search Console / PageSpeed Insights) — lab numbers alone
   are insufficient for the Ads Quality Score "landing page experience" signal.

### 1.5 Image / video optimization — hero (`hero-bg.mp4` / `.webm` / `hero-poster.webp`) (P1)
Current state (verified): `public/hero-bg.mp4` ≈ **4.37 MB**, `public/hero-bg.webm` ≈ **4.83 MB**,
`public/hero-poster.webp` ≈ 107 kB. `HeroVideoBackground.tsx` already does the right things
(`preload="none"`, `poster`, `playsInline`, `muted`, webm-before-mp4 source order). Remaining work:
- **The poster IS the LCP candidate** while the video buffers. Render it via `next/image` with
  `priority`/`fetchPriority="high"` (it is currently a plain `<img src="/hero-poster.webp">`, L96) so it
  preloads and is not lazily deferred. This is the cheapest LCP win on Home.
- **Shrink the video files.** ~4.4–4.8 MB for a background loop is heavy on mobile/metered connections and
  hurts the page-experience signal even with `preload="none"` (it still downloads once playback starts):
  - Cap dimensions (a background loop rarely needs >1280×720), drop the bitrate, strip the audio track
    (`-an`), and keep it short/seamless. Target **< 1.5 MB** per file.
  - Consider `preload="none"` **plus** a `prefers-reduced-motion` / `connection.saveData` guard that skips
    the video entirely on save-data or reduced-motion, showing only the poster.
- **No raw `<img>` elsewhere** beyond the logo SVG (audit-confirmed), so general image debt is low — the
  hero video is the one real media-weight problem.
- `next.config.ts` has **no `images` config**; if any future raster art is added, route it through
  `next/image` and enable AVIF/WebP (`images.formats`).

### 1.6 Caching & middleware (P2)
- Static routes already return long `s-maxage`. The `middleware.ts` `Set-Cookie` (`visitor_id`) on HTML
  responses can suppress shared full-page CDN caching — confirm the edge still caches HTML on the live CDN,
  or scope the cookie matcher to exclude prerendered marketing pages.

---

## 2. On-page (titles / meta / heading structure)

Per-route titles & descriptions are already unique (applied via per-route `layout.tsx` + `pageMetadata()`).
This section defines the **standards to hold to** and the gaps to close, by page type.

### 2.1 Standards
- **Title:** 50–60 chars, primary keyword **first**, brand last via the `%s | CyberSkill` template.
  Avoid stuffing — one primary + one modifier (e.g. `WN8 Boost — Raise Your WN8 Fast | CyberSkill`).
- **Description:** 150–160 chars, lead with the value prop + a differentiator (top-0.1% players,
  guarantee, secure/manual) and end with a soft CTA. These drive **CTR**, which compounds with paid CTR.
- **One H1 per page**, keyword-bearing; logical `H1 → H2 → H3`, no skips (audit confirmed this holds).

### 2.2 By page type
| Page type | H1 pattern | Title focus | Notes |
|---|---|---|---|
| **Home** (`/`) | `WoT Boosting Service by CyberSkill` (current) | "World of Tanks Boosting Services" | H1 targets the short "WoT boosting"; ensure an early H2 carries the full "World of Tanks boosting" variant (it does, in the services section). |
| **Service** (`/services/*`) | `<Service name> for World of Tanks` | `<Service> Boost/Farm — <benefit>` | Each must answer search intent **above the fold**: what it is, price-from, turnaround, safety. This is also the Ads landing-page relevance requirement (§5). |
| **Campaign children** (`/1.0`,`/2.0`,`/3.0`) | `Campaign <N.0> Missions Boost` | distinct per version | Audit already fixed the lost `| CyberSkill` suffix + duplicate schema here — **do not regress** when editing. |
| **Conversion/utility** (`/events`,`/guarantee`,`/referral`,`/referral-program`) | topical H1 | intent + brand | Resolve the `/referral` vs `/services/referral-program` overlap (§4). |
| **Legal** (`/privacy`,`/cookies`,`/terms`) | plain H1 | descriptive | Substantial, not thin; fine as-is. Candidates to convert to Server Components (§1.4). |

### 2.3 Gaps to close (P1)
- **`arcade-cabinet`** has no defined title/description/keyword target in the recon — fill it in (or remove,
  per R3).
- Confirm every service description in `src/lib/seo.ts` / per-route layout includes a **price-from** and a
  **turnaround/safety** phrase — these are the terms paid users scan for and the relevance hooks for Ads.

---

## 3. Structured data — what exists & the gaps

### 3.1 Already implemented (in `src/lib/seo.ts`, verified)
- **`Organization`** + **`WebSite`** sitewide (`organizationJsonLd`, `websiteJsonLd`) with `sameAs` socials.
- **`Service`** (+ optional `Offer`/`priceFrom`) and **`BreadcrumbList`** per service.
- **`Product` + `AggregateRating` (≈4.7 / 15) + 15 `Review`s** on Home (`boostingReviewsJsonLd`) — correctly
  modeled as a `Product` (self-serving `Organization` ratings are **not** eligible for star rich results).

### 3.2 Gaps / improvements (P1–P2)
1. **`FAQPage`** on service pages that have Q&A content — captures FAQ rich results and long-tail intent.
   Add genuine on-page FAQ blocks (turnaround, account safety, payment) and mark them up.
2. **`AggregateRating` / `Offer` per service**, not only on Home. Each `Service`/`Product` page that has its
   own price and (honest) reviews can carry its own offer + rating, improving per-page snippet richness.
   Keep ratings genuine and visible on-page (Google penalizes invented/self-serving ratings).
3. **`BreadcrumbList` needs a matching visible UI.** The schema exists but the audit notes no visible
   breadcrumb trail — schema without a visible trail risks being ignored and is a UX miss. Add the visible
   nav (P2 follow-up flagged in the audit).
4. **`WebSite` `potentialAction` (Sitelinks Searchbox)** only if/when on-site search exists — skip
   otherwise (don't fake it).
5. **Validate post-deploy** with the Rich Results Test + Schema Markup Validator on absolute URLs (the
   localhost `@id`s in 3.1 are invalid until R1 is fixed).

---

## 4. Content strategy & keyword map (English, intent-based)

WoT boosting is a **commercial/transactional** niche — buyers search "buy / service / cheap / fast /
account safe", not informational queries. Map each landing page to one **primary** commercial keyword + a
small modifier cluster; reserve informational queries for a future blog that links **into** the money pages.

### 4.1 Per-page target keyword map
| Page | Primary keyword | Secondary / modifiers | Search intent |
|---|---|---|---|
| `/` | `world of tanks boosting` | `wot boosting service`, `buy wot boost`, `wot boosting site` | Brand + category landing |
| `/services/wn8-boost` | `wn8 boost` | `raise wn8 wot`, `wn8 boosting service`, `improve wn8 fast`, `wot wn8 recovery` | Transactional (calculator = high intent) |
| `/services/credit-farm` | `wot credit farming` | `buy wot credits boost`, `world of tanks credit grind service`, `farm silver wot` | Transactional |
| `/services/campaign-missions` | `wot campaign missions boost` | `personal missions wot`, `obj 260 missions`, `wot mission boosting` | Transactional |
| `…/campaign-missions/1.0` | `wot campaign 1.0 missions` | `stug iv missions`, `t28 htc missions` | Long-tail transactional |
| `…/campaign-missions/2.0` | `wot campaign 2.0 missions` | `obj 260 boost`, `2.0 personal missions` | Long-tail transactional |
| `…/campaign-missions/3.0` | `wot campaign 3.0 missions` | `obj 279e missions`, `3.0 missions boost` | Long-tail transactional |
| `/services/mark-of-excellence` | `mark of excellence boost` | `3 marks of excellence service`, `moe boosting wot`, `95% marks wot` | Transactional |
| `/services/onslaught` | `wot onslaught boosting` | `onslaught rank service`, `onslaught carry wot` | Seasonal transactional |
| `/services/tier-leveling` | `wot tier leveling service` | `tank line grinding wot`, `research tanks fast`, `wot grind service` | Transactional |
| `/services/exp-farm` | `wot xp farm service` | `free xp farming wot`, `crew xp boost`, `wot experience boosting` | Transactional |
| `/services/ace-tanker` | `ace tanker boost` | `mastery badge wot`, `get ace tanker service` | Transactional |
| `/services/battle-pass` | `wot battle pass boost` | `battle pass completion wot`, `buy battle pass levels` | Seasonal transactional |
| `/services/referral-program` | `wot referral program` | `referral rewards wot`, `wot referral tanks` | Mixed (info + transactional) |
| `/services/arcade-cabinet` *(confirm R3)* | `wot arcade cabinet` | `arcade cabinet tokens wot`, `arcade cabinet boost` | Seasonal/event |
| `/events` | `wot boosting deals` | `wot service discounts`, current event terms | Promotional |
| `/guarantee` | `wot boosting safety` | `is wot boosting safe`, `account safe boosting` | **Trust/objection — informational, supports conversion** |

### 4.2 Content depth requirements per service page (P1)
For both organic ranking **and** Ads landing-page relevance, each service page should contain, above or
near the fold: (1) what the service delivers, (2) **price-from + turnaround**, (3) **account-safety /
manual-play** assurance, (4) "How It Works" steps, (5) genuine reviews, (6) a short FAQ. The audit confirms
the content is unique and non-thin — the gap is **consistency** of these six blocks across all 11 services.

### 4.3 Informational content / blog (P2 — feeds the money pages)
Build a small `/blog` or `/guides` cluster targeting informational intent and **internally link down** to the
relevant service:
- "How WN8 is calculated & how to raise it" → links to `/services/wn8-boost`.
- "Fastest way to farm credits in WoT" → links to `/services/credit-farm`.
- "Obj. 279(e) campaign mission guide" → links to `/services/campaign-missions/3.0`.
- "Is WoT boosting safe? Account security explained" → links to `/guarantee`.
These capture top-of-funnel search, build topical authority, and pass equity to transactional pages.

---

## 5. Paid-traffic quality lens (Google Ads — Quality Score)

Ads are already wired (`AW-17868439825` in `layout.tsx`). For EU+US paid traffic, **Quality Score** =
expected CTR × **ad relevance** × **landing-page experience**. SEO and Ads share the same levers here:

1. **Landing-page relevance (1:1 keyword→page).** Point each ad group at the matching service page from
   §4.1, **never** the home page. The H1, first paragraph, and a CTA must echo the ad's keyword
   ("WN8 boost" ad → `/services/wn8-boost` with "WN8 Boost" in the H1). Mismatched landing = low QS = higher CPC.
2. **Page speed = landing-page experience.** The CWV/JS work in §1.4–1.5 (especially the 4+ MB hero video and
   client-component hydration) directly lifts QS and lowers CPC. This is where SEO speed work pays off twice.
3. **Trust & transparency.** Visible price-from, guarantee, reviews, and clear contact/legal pages
   (`/guarantee`, `/privacy`, `/terms`) improve the landing-page-experience signal and conversion rate.
4. **Don't index thin PPC variants.** If dedicated ad landing pages are ever added, `noindex` them to avoid
   cannibalizing the organic service pages (reuse the `noindex` pattern already on `/admin`,`/order`).
5. **Conversion tracking integrity.** GA4 + Ads tags load via `next/script afterInteractive` — confirm the
   order-success event fires on the real domain so QS's CTR/conversion inputs are accurate.

---

## 6. Internal linking

Current architecture is a clean hub-and-spoke: the Header Services dropdown links all services on every
page, and the Footer was updated to link all services + `/referral`. Improvements:

1. **Resolve `/referral` vs `/services/referral-program` cannibalization (P1).** Two pages can compete for
   `wot referral`. Pick the canonical target (likely `/services/referral-program`), differentiate the
   other's intent, or `rel=canonical` the weaker page to the stronger.
2. **Contextual cross-links between related services (P1).** Add in-body links, e.g. WN8 boost ↔ tier
   leveling ↔ ace tanker (skill/progression cluster); credit-farm ↔ exp-farm ↔ battle-pass (grind cluster);
   campaign parent ↔ its 1.0/2.0/3.0 children (and siblings to each other). Use **descriptive anchors**
   ("raise your WN8", not "click here").
3. **Blog → service links (P2).** Each guide (§4.3) links down to its money page with keyword-rich anchors.
4. **Visible breadcrumbs (P2).** Add the visible trail to match the existing `BreadcrumbList` schema (§3.2).
5. **No orphans / no broken links.** Audit confirmed no service orphans; re-verify after any nav change.

---

## 7. Prioritized checklist

### P0 — Launch blockers (do first; nothing ranks or converts until these are done)
- [ ] **R1** Set `NEXT_PUBLIC_SITE_URL=https://<canonical-domain>` as a **build-time** env var; rebuild.
- [ ] **R2** Reconcile `.pro` vs `.online` — one canonical domain across `SITE_URL`, socials, Footer, telegram.
- [ ] **Restore production** (currently 404) — origin reachable, returns 200 on `/` and all 21 routes.
- [ ] **HTTPS + valid SSL + HSTS**; no mixed content (hero video + OG image over HTTPS).
- [ ] **Single host:** 301 `www`↔non-`www` and `http`→`https`; `metadataBase` matches the chosen host.
- [ ] Verify `robots.txt`, `sitemap.xml`, canonicals, OG, and JSON-LD all emit **absolute, on-domain** URLs.

### P1 — High impact (week 1–2)
- [ ] **R3** Confirm/treat `arcade-cabinet` (map keywords or remove + noindex).
- [ ] **Submit sitemap** to Google Search Console + Bing; verify ownership via DNS TXT; monitor Coverage.
- [ ] **Cut hero video to < 1.5 MB** per file; render poster via `next/image priority` (LCP fix).
- [ ] **Lazy/trim `framer-motion`**; convert static sections (legal, How-It-Works, features) to Server Components.
- [ ] **Measure real CWV** (CrUX/PSI field data) post-deploy; fix the worst LCP/INP offenders.
- [ ] **Per-page price-from + turnaround + safety** copy on every service page (relevance + Ads QS).
- [ ] **1:1 ad-group → service-page** mapping; ensure H1/first-paragraph echo the ad keyword.
- [ ] **Resolve `/referral` vs `/services/referral-program`** cannibalization.
- [ ] **Add `FAQPage`** schema + on-page FAQ to service pages; **per-service `Offer`/`AggregateRating`** where honest.

### P2 — Compounding / medium term
- [ ] **Contextual internal links** between related services (descriptive anchors).
- [ ] **Visible breadcrumbs** matching the existing `BreadcrumbList` schema.
- [ ] **`/blog` informational cluster** linking down to money pages (§4.3).
- [ ] Confirm **CDN caches HTML** despite the `visitor_id` `Set-Cookie` (scope middleware matcher if not).
- [ ] `noindex` any future dedicated **PPC landing variants**; verify GA4/Ads conversion events on live domain.
- [ ] Optional: `app/manifest.ts`; AVIF/WebP via `next.config images.formats` if raster art is added.

---

## 8. Verification (run after deploy)
- `curl -sI https://<domain>/` → 200, HSTS present, redirects from `http`/`www` are 301.
- `curl -s https://<domain>/sitemap.xml` → 21 absolute on-domain `<loc>`s, no localhost.
- View-source Home + one service page → absolute canonical, OG, and JSON-LD `@id`/`url`.
- **Rich Results Test** on Home (Product/Review) + a service (Service/Breadcrumb/FAQ) → no errors.
- **PageSpeed Insights (field data)** on Home + top service → LCP/INP/CLS in "Good"; note hero-video impact.
- **Search Console:** sitemap "Success", Coverage clean, `site:<domain>` returns the 21 routes within days.

---

*This plan extends `docs/SEO_AUDIT_REPORT.md`; it does not supersede the applied P0–P2 fixes. Where this
document and the audit overlap, the audit records what is **done** and this document records what to do
**next** — especially the domain/origin reconciliation (§0), CWV/video work (§1.4–1.5), the keyword map
(§4), and the paid-traffic quality layer (§5).*
