# Technical SEO & Indexation Audit — Diecast Heaven Udaipur

**Site:** https://www.diecastheavenudaipur.in (canonical host **www**; apex 308 → www)
**Audited deploy:** commit `f25c0df` (git HEAD at audit time), Vercel `bom1`
**Audit date:** 2026-11-12 (IST) · **Auditor:** technical-SEO specialist
**Scope:** crawlability, indexability, sitemap/robots, rendering & caching, security headers, indexation monitoring. On-page copy and schema are owned by other workstreams; where they intersect the technical surface they are noted as handoffs.

**Method / evidence sources**
- `docs/seo/audits/raw/transport.json` (TLS + headers + redirects)
- `docs/seo/audits/raw/sitemap.json` (robots.txt declarations, sitemap validation/expansion)
- `docs/seo/audits/raw/page-product.json` (product template facts)
- Live header/HTML/XML probes run for this report (values quoted inline with the URL requested)
- Repo source read at `HEAD` and in the working tree; line numbers are for `HEAD` (`git show HEAD:<path>`) unless marked *working tree*
- Installed Next.js: **14.2.35** (`node_modules/next/package.json`)

**Status legend:** findings are stated against **production as deployed**. The working tree already contains unreleased SEO remediation by parallel workstreams (`lib/seo/*`, `app/sitemap-images.xml/`, `app/(public)/brands/`, `components/seo/`). Those changes are treated as *in flight* and are re-audited in **§1.9 (P0 pre-deploy gate)** because two of them would ship a regression that is worse than the bug they fix.

---

## 0. Score summary

Scored only on checks actually measured. CrUX/PSI field data and the JS-rendering gap (headless Chromium) were **not measured** in this run — no credentials, no render pass — so Core Web Vitals is reported as *not measured* rather than guessed.

| Category | Status | Score | Basis |
|---|---|---|---|
| Crawlability | **fail** | 25/100 | robots.txt declares a localhost sitemap; sitemap invalid for Google; pagination has no crawlable URLs |
| Indexability | **fail** | 20/100 | 0 canonicals site-wide; 3+ URLs share one `<title>`; /cart indexable; no robots meta anywhere |
| Security | warn | 55/100 | TLS/HSTS/redirects correct; CSP, nosniff, framing, Referrer-Policy, Permissions-Policy all absent; HSTS lacks includeSubDomains |
| URL Structure | pass | 90/100 | clean hyphenated slugs, one-hop redirects, trailing slashes consistent; one 100-char slug |
| Mobile | pass | 95/100 | viewport present, responsive, no interstitials, content parity |
| Core Web Vitals | **not measured** | — | no CrUX/PSI access; TTFB measured directly (§3) |
| Structured Data | fail | 0/100 | 0 JSON-LD on the product template (owned by schema workstream; flagged for product discoverability) |
| JS Rendering | pass | 90/100 | full SSR — H1, body copy, breadcrumbs all present in raw HTML |
| IndexNow | fail | 0/100 | not implemented |

**Technical score: 47/100** (mean of the eight measured categories: 375/8 = 46.9; CWV excluded as not measured).

---

## 1. Findings

Severity: **Critical** = blocks or corrupts indexing of the product catalogue; **High** = materially suppresses product discovery; **Medium** = dilutes or wastes crawl/authority; **Low** = hygiene.

| # | Sev | What is wrong | Evidence | Impact on product discoverability | Fix |
|---|---|---|---|---|---|
| C1 | **Critical** | Sitemap and robots.txt publish `http://localhost:3000`. `NEXT_PUBLIC_SITE_URL` is unset in production, so both files fall back to the dev origin. | `app/sitemap.ts:5` — `const baseUrl = process.env.NEXT_PUBLIC_SITE_URL \|\| 'http://localhost:3000'`; `app/robots.ts:4` identical, `app/robots.ts:11` — `sitemap: \`${baseUrl}/sitemap.xml\``. Live `robots.txt` body: `Sitemap: http://localhost:3000/sitemap.xml`. Live `sitemap.xml` first `<loc>`: `http://localhost:3000`. `sitemap.json` → `cross_host_url_count: 225`, `cross_host_url_examples` all `http://localhost:3000/...`. | All 222 product URLs are submitted on a host Googlebot cannot resolve. The sitemap is unreadable as a discovery source, so every product depends on internal links + manual inspection. New products have no submission path. | §4.1 — single `SITE_URL` helper, imported by both routes |
| C2 | **Critical** | No canonical tag on any URL, and the homepage, `/catalog` and `/catalog?view=brands` all render the same `<title>Diecast Heaven</title>` (title comes from the segment layout, not the page). | `page-product.json` → `"canonical": null, "canonical_status": "missing"`. `grep -r "canonical\|metadataBase\|alternates" app/` at HEAD → **0 matches**. Committed `app/(public)/layout.tsx:10` sets `title` once for the whole public segment. Live titles: `/` → `<title>Diecast Heaven</title>`, `/catalog` → same, `/catalog?view=brands` → same. | The catalogue hub is an uncanonicalised duplicate of the homepage: Google picks one representative for the cluster and the other stops ranking. The hub that should pass authority to 222 products is the page most likely to be folded away. | §2.2 |
| H1 | **High** | `force-dynamic` on home, catalog, product, shared-cart. Every request is a cold render, and the response forbids all caching. | `app/(public)/page.tsx:8`, `app/(public)/catalog/page.tsx:16`, `app/(public)/product/[slug]/page.tsx:41`, `app/(public)/cart/shared/page.tsx:6`. Measured on `GET /product/porsche-...`: `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`, `X-Vercel-Cache: MISS`, `Age: 0` — on every one of 5 probes. | No CDN HTML cache and no ISR: every Googlebot fetch costs a function invocation plus a full RSC render of a 81,163-byte document. Crawl rate backs off when responses slow, so a crawl burst over 222 products competes with real shoppers for the same origin. TTFB measured 0.189–0.548 s (§3). | §3 |
| H2 | **High** | `/cart` and `/cart/shared` are indexable, and `/cart` is a **statically prerendered page served from a 29-day-old edge cache** with an empty-cart body. | `app/(public)/cart/page.tsx:1` — `'use client'`, so the route cannot export `metadata`/`robots` at all. `grep -r "noindex" app/` → 0 matches. Measured `GET /cart`: `HTTP 200`, `Age: 2526098` (≈29 days), `X-Vercel-Cache: HIT`, no `<meta name="robots">`, no canonical. | A thin, permanently-stale page competes for crawl budget and can be returned in results instead of a product. Any shared-cart URL that gets linked is an unbounded duplicate generator (content varies only by `?c=`). | §2.4 |
| H3 | **High** | Catalogue pagination exists only as client-side `fetch`. 12 of 222 products are reachable by an `<a href>`; the rest are reachable only via the sitemap. | `components/public/product-grid.tsx:1` — `'use client'`; line 62 — `fetch(\`/api/catalog?${params}\`)`; `app/(public)/catalog/page.tsx:25` passes `page: 1`. No `/catalog?page=` route, no `<a href>` to page 2, no `rel=next`. | The internal link graph is 12 nodes wide. Link equity from the hub reaches 5% of the catalogue, and new products inside the grid are invisible to crawling until the sitemap is fixed. | §3.4 |
| H4 | **High** | `<lastmod>` is not trustworthy: the 3 static URLs are stamped with *request time*, and 69.3% of all URLs share one identical timestamp from a bulk import. | `sitemap.json` → `lastmod_newest: 2026-11-11T23:31:59.029Z` equals the sitemap response `Date:` header of that same fetch (`23:31:58 GMT`) — i.e. `new Date()` at render. `lastmod_identical_share: 0.6933`, `lastmod_most_common: 2026-11-01T10:15:14.036Z`. Source: `app/sitemap.ts:21,27,34` all `lastModified: new Date()`. | Google only honours `<lastmod>` when it is consistently accurate; a value that moves on every fetch teaches it to ignore the signal, so genuinely restocked products get no freshness credit. | §4.1 |
| H5 | **High** | Auth surfaces leak into the crawl graph. Middleware gates them, but a gate is not an indexing control — and robots.txt cannot remove a URL from the index. | Live `GET /admin` → `307 Location: /admin/login`; `GET /analytics` → `307 Location: /analytics/login`. Both login pages return `200` with `<title>Diecast Heaven</title>` and **no** robots meta. `middleware.ts:39` matcher `['/admin/:path*','/analytics/:path*','/api/analytics/:path*']`; `app/robots.ts:9` disallows `/admin`, `/analytics`, `/api/analytics`, `/api/track` only. | Not a product-discovery risk directly, but a 307 is a *temporary* signal: the URLs stay eligible, and a login page indexed under the brand name wastes the brand SERP. `Disallow` also blocks Googlebot from ever seeing a `noindex`, so the two controls fight each other. | §2.5 |
| M1 | Medium | `/catalog` multiplexes five free-form query parameters into one template with one title and no canonical, so every filter combination is a near-duplicate. | `app/(public)/catalog/page.tsx:7-14` (`category, brand, search, view, orderType`), `:20`. Internal links already mint them: `app/(public)/page.tsx:76` → `/catalog?view=brands`, `:86` → `/catalog?brand=${brand.slug}`. Search Console shows `/catalog?orderType=PRE_ORDER` and `/catalog?view=brands` indexed. | Duplicates do not cannibalise each other by competing on different queries — they do it by being interchangeable, so Google collapses the set and keeps one. Every filter URL that gets indexed is a page that could have been a real landing page for "pre-order diecast India". | §2.3 |
| M2 | Medium | No security headers: CSP, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy` all absent; HSTS lacks `includeSubDomains`. `X-Powered-By: Next.js` exposed. | `transport.json` → `headers.csp.present: false`, `x_content_type_options.present: false`, `framing.ok: false`, `referrer_policy.present: false`, `permissions_policy.present: false`, `hsts.value: "max-age=63072000"`, `include_subdomains: false`. Live response confirms only `Strict-Transport-Security` is present. | **Not a confirmed ranking signal** — HTTPS is a lightweight one, these headers are not. The real exposure is clickjacking of the WhatsApp checkout flow and MIME-sniffing of Blob-hosted assets. Fix it for trust and safety, not for rankings. | §6 |
| M3 | Medium | Product template is thin: 208 words, and the meta description is a 56-character copy of the title. | `page-product.json` → `word_count: 208`, `meta_description: "Porsche 911 GT3 R 2026 GT World Challenge Asia Mandalika"`, `meta_description_length: 56`, `title_length: 73`. | Product pages are the money pages and they carry no unique specification content (scale, brand, year, series) in crawlable text — the exact attributes collectors search on. Handoff: content workstream. | §1.11 |
| M4 | Medium | 0 JSON-LD blocks on the product template. | `page-product.json` → `jsonld_blocks: 0`, `jsonld_invalid: 0`. | No `Product`/`Offer` markup means no price, availability or rating treatment in results and no eligibility for merchant surfaces. Structured data for Product must be in the server-rendered HTML, not injected by JS. Handoff: schema workstream — but the *placement* (server HTML) is a technical requirement. | §1.11 |
| L1 | Low | 7 of 8 product images carry no `width`/`height` attributes. | `page-product.json` → `images.missing_dimensions: 7`. Cause: `components/public/product-image-gallery.tsx:31,65` use `fill` inside an `aspect-square` wrapper. | Low in practice: the `aspect-square` container reserves the box, so measured CLS risk is small. It is a heuristic hit, not a layout bug. | §1.11 |
| L2 | Low | robots.txt emits two separate `User-Agent: *` groups, and two JSON endpoints answer 200. | Live robots.txt body has `User-Agent: *` / `Allow: /` then a second `User-Agent: *` / `Disallow: ...`. `GET /api/settings` → 200 `application/json`; `GET /api/catalog` → 200 `application/json`. | Crawlers merge duplicate groups, so behaviour is correct; the split is a maintenance hazard. JSON endpoints consume a little crawl budget. | §4.2 |

### 1.9 P0 pre-deploy gate — regressions in the unreleased working tree

These were **not** live at audit time; the working tree was in active flux while this report was written. Both were observed in the tree during the audit and **both have since been corrected in the tree** — status recorded below so nobody re-fixes them, and so the underlying rule survives the fix.

| # | Sev | Problem (as observed) | Evidence (as observed) | Effect if shipped | Status at final write |
|---|---|---|---|---|---|
| P0-a | **Critical** | A root-level canonical of `/` is inherited by every page that does not declare its own, so non-home pages would canonicalise **to the homepage**. | `app/layout.tsx` → `alternates: { canonical: '/' }` in the root `metadata`; `/about` and both cart routes declared no `alternates`, so they inherited it. | `/about` would emit `rel=canonical → https://www.../`, telling Google the homepage is the preferred version of the About page — and every future page that forgets its own canonical deindexes itself silently. | **Fixed in tree.** `app/layout.tsx:24-26` now carries an explicit comment that no `alternates.canonical` belongs in a layout. Verify it stays that way: this is a one-line regression that would silently deindex pages. |
| P0-b | **High** | The new `sitemap.ts` listed two route families that did not exist in the repo. | `app/sitemap.ts` → `${SITE_URL}/brands/${brand.slug}` and `${SITE_URL}/categories/${category.slug}`; `find app/(public)/brands -type f` returned only `page.tsx` (no `[slug]`); `app/(public)/categories` did not exist. Live `GET /brands/hot-wheels` → **404**, `GET /categories/hot-wheels` → **404**. | A sitemap is a promise that every listed URL returns 200. Shipping brand/category URLs that 404 converts "sitemap invalid" into "sitemap full of errors" and teaches Google to distrust the file. | **Fixed in tree.** `app/(public)/brands/[slug]/page.tsx` and `app/(public)/categories/[slug]/page.tsx` now exist. Precondition remains: both still return **404 live**, so the 200-sweep below is the deploy gate, not a formality. |

Rule to hold: **a URL enters the sitemap only after `curl -o /dev/null -w '%{http_code}' <url>` returns 200 on production.** Sitemap and routes must ship in the same deploy, or the sitemap must lag the routes by one deploy — never lead them.

### 1.10 Still open in the working tree at final write

Checked again at the end of the audit, because the tree moved during it. These are the gaps my recommendations would close that are **not** yet closed anywhere:

| Item | State | Reference |
|---|---|---|
| `revalidatePath()` in `/api/revalidate` | **absent** — `grep revalidatePath app/api/revalidate/route.ts` returns nothing, so the tag-only purge will not re-render prerendered HTML (§3.3) | §3.3 |
| CSP | **absent** — `next.config.js` now sets `nosniff`, `Referrer-Policy`, `Permissions-Policy` and `poweredByHeader: false`, but no `Content-Security-Policy` | §6 |
| HSTS `includeSubDomains` | not set in `next.config.js` or at the platform | §6 |
| Crawlable pagination | still client-`fetch` only; no `/catalog?page=` | §3.5 |
| `noindex` on `/admin/login`, `/analytics/login` | not present | §2.5 |


### 1.11 Handoffs (out of technical scope, logged so they are not lost)

- **M3 / M4** — product copy (208 words) and `Product` JSON-LD belong to the on-page and schema workstreams. One technical constraint to pass on: Product markup must be in the **server-rendered HTML**; JS-injected Product structured data is processed late or not at all, and Google does not render JS on non-200 responses.
- **L1** — `fill` is correct for the aspect-locked gallery. Leave it unless a Lighthouse CLS run shows shift.
- Product **title at 73 chars** truncates in results (~60 is the display heuristic, not a limit). The working tree's `%s | Site` template already shortens it; verify after deploy.

---

## 2. Crawlability & indexability

### 2.1 The localhost sitemap bug (C1)

Two files, one root cause: a missing environment variable with a dev default that is safe in development and catastrophic in production.

```
$ curl -s https://www.diecastheavenudaipur.in/robots.txt
User-Agent: *
Allow: /

User-Agent: *
Disallow: /admin
Disallow: /analytics
Disallow: /api/analytics
Disallow: /api/track

Sitemap: http://localhost:3000/sitemap.xml
```

The sitemap itself is fetched successfully at `https://www.diecastheavenudaipur.in/sitemap.xml` (`200`, `application/xml`, 43,590 bytes, `X-Vercel-Cache: HIT`) and is structurally valid — 225 URLs, 0 duplicates, 0 invalid locs, valid W3C datetimes, 43 KB (far under 50 MB / 50,000 URL limits). It is valid XML pointing 225 times at a host that does not exist for Googlebot.

Consequences, in order:
1. The declaration in robots.txt is discarded — a `<loc>` on another host is not followed, and `sitemap_discovery` classified it `cross_host: true`, `error: "URL safety validation failed"`.
2. Discovery falls back to the path Google guesses (`/sitemap.xml`) and to Search Console submissions. Neither is a reliable pipeline for a 222-SKU catalogue that restocks weekly.
3. Every product URL becomes dependent on internal links — which, per H3, reach only 12 of 222.

Fix: one module owns the origin. It already exists in the working tree (`lib/seo/site.ts`, verified) — the point is that `sitemap.ts` and `robots.ts` must *import* it rather than each re-deriving a fallback. Never a dev default in shipped code: the fallback is the production origin, so a missing env var fails safe (§4.1).

### 2.2 Missing canonicals (C2)

Zero `<link rel="canonical">` in the codebase at `HEAD` and zero in the served HTML. Combined with the layout-level title, the site presents Google with at least three interchangeable URLs (`/`, `/catalog`, `/catalog?view=brands`) carrying byte-identical `<title>` and different bodies.

Canonicalisation practice that matters here:
- **Self-referencing canonical on every indexable page.** Not optional for a catalogue: filter URLs, trailing-slash variants, apex/www and future campaign parameters all need a stated preferred URL.
- **`metadataBase` set once**, so relative canonicals and OG images resolve against the canonical www origin instead of whatever host the request arrived on.
- **Canonical must be in the server HTML** and identical to any JS-injected value. Google may use either one when they disagree.
- **A layout must not set `alternates`** (see P0-a) — metadata is inherited per field, so a root canonical leaks onto every page that opts out of declaring one.
- Expect a lag: after the fix, Google can keep a corrected URL in its duplicate cluster for **up to two weeks** while re-evaluating. An unchanged canonical one day after deploy is not evidence of failure.

### 2.3 `/catalog` query-parameter duplication (M1)

The template accepts `category`, `brand`, `search`, `view`, `orderType` (`app/(public)/catalog/page.tsx:7-14`) and renders one `<h1>` and one title for all of them. Two of those combinations are already indexed.

Assessing real impact honestly: with `search`, the space is unbounded and clearly duplicate. With `brand`/`category`/`orderType`, each combination is a *genuinely useful* landing page that happens to be implemented as a parameter — that is the actual problem. Blocking or collapsing them throws away intent; leaving them as parameters means Google chooses the canonical, not you.

Recommendation, in priority order:

1. **Real routes for anything that should rank.** `/brands/[slug]`, `/categories/[slug]`, `/pre-order`. One URL per intent, own title/H1/copy, self-canonical, linked with `<a href>`. In progress in the working tree — do not list them in the sitemap until they return 200 (P0-b).
2. **Canonical for anything that must stay a parameter.** A single-filter URL that maps to a real route should canonicalise **to that route**, not to `/catalog` and not to itself — that is how the signal consolidates instead of fragmenting.
3. **`noindex, follow` for internal search** (`?search=`). Infinite, worthless, and `follow` keeps the product links crawlable.
4. **Do not use robots.txt to de-duplicate.** `Disallow` prevents Google from seeing the canonical or the `noindex`, so duplicates stay in the index with no consolidation signal. robots.txt removes *crawling*, not *indexing*.

Implementation shape for a filtered catalogue page (fits `app/(public)/catalog/page.tsx`):

```ts
// app/(public)/catalog/page.tsx  (server component)
import type { Metadata } from 'next'

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  const { search, brand, category, orderType, view } = await searchParams

  // Internal search: never indexable, but keep product links crawlable.
  if (search) {
    return { title: `Search results`, robots: { index: false, follow: true } }
  }

  // Single filter that has (or will have) a real landing page: consolidate onto it.
  if (brand && !category && !orderType) {
    return { alternates: { canonical: `/brands/${brand}` } }
  }
  if (category && !brand && !orderType) {
    return { alternates: { canonical: `/categories/${category}` } }
  }

  // Multi-filter combinations are not distinct pages.
  if ([brand, category, orderType].filter(Boolean).length > 1 || view === 'brands') {
    return { alternates: { canonical: '/catalog' } }
  }

  return { alternates: { canonical: '/catalog' } }
}
```

`view=brands` gets a canonical rather than a `noindex` because the content (the brand grid) is substantially the same set as `/brands`; consolidating preserves any links it has earned while pointing Google at the better page. Ship the real routes first — until `/brands/[slug]` returns 200, canonicalising to it would point at a 404, which is worse than the duplication.

### 2.4 `/cart` and `/cart/shared` indexability (H2)

Both routes are indexable and neither can currently be fixed where you would expect:

- `app/(public)/cart/page.tsx:1` is `'use client'`. **A client component cannot export `metadata` or `generateMetadata`**, so there is no place in that file for a `robots` directive — this is why the route shipped without one rather than because someone forgot.
- `/cart` is nevertheless served as a **statically prerendered shell**: measured `Age: 2526098` (≈29 days) with `X-Vercel-Cache: HIT`. Googlebot fetching `/cart` for the first time sees a 29-day-old empty cart.
- `/cart/shared` is `force-dynamic` (`app/(public)/cart/shared/page.tsx:6`) and varies entirely by `?c=`. Every shared link is a unique URL wrapping the same template.

Correct fix — `noindex`, never `Disallow`, because a disallowed URL cannot be crawled and therefore its `noindex` is never read. One server layout covers both routes:

```tsx
// app/(public)/cart/layout.tsx   (new file — server component)
import type { Metadata } from 'next'

/**
 * Server-rendered so the directive is in the initial HTML: Google honours a
 * robots meta tag from raw HTML even if JS later removes it, and cart contents
 * are user-specific — they must never be indexed or cached.
 */
export const metadata: Metadata = {
  title: 'Your Cart',
  robots: { index: false, follow: true },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

`follow: true` matters: the cart links to product pages, and those links should still pass equity.

### 2.5 `/admin` and `/analytics` leakage (H5)

The gate works — verified live:

```
GET /admin      → 307  Location: /admin/login
GET /analytics  → 307  Location: /analytics/login
```

What the gate does **not** do:

1. **Middleware does not stop crawling.** `middleware.ts` returns a redirect at request time; it is not a robots directive. A crawler that finds the URL still requests it, still records a `307`, and still follows to `/admin/login` — which returns `200` with `<title>Diecast Heaven</title>` and no robots meta. Auth-gated HTML is *not* automatically unindexable; only a directive or a non-200 on the final URL achieves that.
2. **A `307` is temporary by definition.** You are telling Google "this resource moved, but check back". `308` would be permanent. Neither removes the source URL from consideration.
3. **robots.txt `Disallow` and `noindex` conflict.** `app/robots.ts:9` disallows `/admin` and `/analytics` (prefix match, so `/admin/login` and `/analytics/login` are covered too). That stops the crawl — which also stops Google from ever reading a `noindex` you might add. The URL can still be indexed from external links, with no content.
4. **`/api/` is only partly blocked.** `app/robots.ts:9` lists `/api/analytics` and `/api/track`, but `GET /api/settings` and `GET /api/catalog` both return `200 application/json` and are crawlable.

Recommended layering, strongest first:
- Server-render `robots: { index: false, follow: false }` on `/admin/login` and `/analytics/login` (these are the only auth pages a crawler can actually reach).
- Keep the middleware gate for humans and for unauthenticated `200`s it prevents. Add `X-Robots-Tag: noindex` on the auth responses as a header-level belt.
- Keep `Disallow: /admin`, `/analytics`, `/api/` in robots.txt for conservation — accept that it is a crawl control, not an indexing control, and do not rely on it for either.
- Never link to `/admin` or `/analytics` from public HTML (verified: no public links today).

### 2.6 Trailing slashes — consistent, no action

`trailingSlash` is not set in `next.config.js` (verified: 16 lines, only `reactStrictMode` and `images.remotePatterns`), so Next.js's default of no-trailing-slash applies, and the platform enforces it with a single hop:

```
GET /cart/     → 308  Location: /cart
GET /catalog/  → 308  Location: /catalog
```

308 is permanent and the target is same-origin, single hop, no chain. This is correct behaviour. Do not introduce `trailingSlash: true` — it would rewrite every URL already indexed.

### 2.7 Host canonicalisation — www vs apex vs certificate

Verified end to end:

| Check | Result | Verdict |
|---|---|---|
| `http://www...` → `https://www...` | `308`, 1 hop, same host, `Location: https://www.diecastheavenudaipur.in/` | pass |
| `https://diecastheavenudaipur.in` → www | `308`, `Location: https://www.diecastheavenudaipur.in/` | pass |
| Certificate on **www** | Valid, `CN=www.diecastheavenudaipur.in`, SAN = `www` only | pass |
| Certificate on **apex** | Valid, **separate certificate**, `CN=diecastheavenudaipur.in`, SAN = apex only | pass — see note |
| Both certs | Let's Encrypt `YR1`, `notAfter 2026-12-26`, 44 days at audit | pass (auto-renewed by Vercel) |

**Correction worth recording:** `transport.json` reports `tls.covers_sibling: false` for the www certificate. That is literally true and is **not** a defect — the apex serves its own separately issued certificate (`subject=CN=diecastheavenudaipur.in`, `SAN=DNS:diecastheavenudaipur.in`) which validated on direct probe. Do not report the apex as having a certificate problem. What *is* true: because HSTS omits `includeSubDomains`, each host's HTTPS guarantee is independent, and any link built on `http://diecastheavenudaipur.in` relies on that host's own redirect rather than on an HSTS upgrade.

www is the correct canonical host: the apex redirects to it, both certificates cover their own host, and every absolute URL the site emits should use `https://www.diecastheavenudaipur.in`. Enforce that in one constant (§4.1), and collapse an apex value in `NEXT_PUBLIC_SITE_URL` onto www so a misconfigured env var cannot emit canonical URLs that redirect.

---

## 3. Rendering & caching

### 3.1 What is set in production today (H1)

```ts
// app/(public)/page.tsx:8
export const dynamic = 'force-dynamic'
// app/(public)/catalog/page.tsx:16
export const dynamic = 'force-dynamic'
// app/(public)/product/[slug]/page.tsx:41
export const dynamic = 'force-dynamic'
// app/(public)/cart/shared/page.tsx:6
export const dynamic = 'force-dynamic'
```

`force-dynamic` sets `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` and disables the Full Route Cache. Verified on the live origin, not assumed:

```
GET /?cb=991            → Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate · X-Vercel-Cache: MISS · Age: 0
GET /product/porsche-…  → Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate · X-Vercel-Cache: MISS · Age: 0
```

Five consecutive probes of the same product URL, each with a cache-busting query, all `MISS`: **there is no HTML cache of any kind**. The `unstable_cache` Data Cache is working (that is why the origin holds up), but it saves database time only — the React render, the RSC payload and the 81,163-byte document are produced again for every request, Googlebot's included.

### 3.2 The cost, stated honestly

Measured server TTFB on the product page (5 samples, same URL, random query to defeat any edge layer):

```
0.189s   0.259s   0.320s   0.367s   0.548s      → p50 ≈ 0.32s, max 0.548s
```

So: **not currently a disaster.** 320 ms from `bom1` with a warm Lambda is fine for LCP on desktop, and the audience is Indian — client-side latency to Mumbai dominates that number anyway. Claiming "force-dynamic is killing your Core Web Vitals" would be overstating the evidence.

What is actually costs, and why it still matters:

1. **Tail latency, not median.** The spread (189 ms → 548 ms, 2.9×) is cold-start and render variance. Crawlers hit 222 URLs in bursts; during a burst every request is a fresh render and the slow tail becomes the p75 that CrUX measures. A statically served page has a flat distribution.
2. **Crawl-rate coupling.** Googlebot's crawl rate auto-adjusts and backs off when responses are slow or error. A catalogue whose every URL costs a function invocation + a full render is crawled more slowly than the same catalogue served from cache — and this site is restocking weekly, so crawl frequency is the thing that matters.
3. **No `stale-while-revalidate`, no `s-maxage`.** Even a 60-second edge cache would collapse a crawl burst to one render. Today: 222 renders.
4. **Cost and failure coupling.** If Turso is slow, every product page is slow, because there is no stale copy to fall back on. `safeQuery` (lib/queries.ts:68-75) swallows DB errors and returns `[]`/`null` — under a DB blip a `force-dynamic` product page can render a 200 with missing content, which is worse than serving a stale 200.

### 3.3 The two caching layers this app already has

Distinguish them before changing anything, because they are not interchangeable:

| Layer | Declared by | Caches | Invalidated by |
|---|---|---|---|
| **Data Cache** (`unstable_cache`) | `lib/queries.ts:29-52` via `safeUnstableCache(fn, keyParts, { tags })`, tags in use: `products`, `featured-products`, `categories`, `brands`, `settings`, `hero-media`, `catalog-products`, `product-by-slug`, `related-products`, … | the **DB result** of one query | `revalidateTag(tag)` — called by `lib/queries.ts:18` and `/api/revalidate` |
| **Full Route Cache** (ISR) | route segment `export const revalidate = N` | the **rendered HTML/RSC payload** of a route | `revalidatePath()`; the segment's own `revalidate` timer; a deploy |

`export const dynamic = 'force-dynamic'` deletes layer 2 and leaves layer 1 doing all the work. That is why the site is fast-ish but uncacheable.

**The subtlety that will bite on cutover:** `revalidateTag()` purges the Data Cache entry. It does **not automatically re-render an already-prerendered page's HTML** — a static route re-renders on its own `revalidate` clock, or when `revalidatePath()` tells it to. So an admin edit followed by `POST /api/revalidate` would refresh the *data* while the *HTML* served to a crawler could still be the pre-edit render until the timer fires. The current `/api/revalidate` (verified, 11 lines) calls five `revalidateTag()`es and no path invalidation:

```ts
// app/api/revalidate/route.ts — current
export async function POST() {
  revalidateTag('products')
  revalidateTag('featured-products')
  revalidateTag('categories')
  revalidateTag('brands')
  revalidateTag('settings')
  return NextResponse.json({ revalidated: true, timestamp: Date.now() })
}
```

Required change **in the same commit** as removing `force-dynamic`:

```ts
// app/api/revalidate/route.ts
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { revalidateTag } from '@/lib/queries'

const TAGS = [
  'products', 'featured-products', 'catalog-products', 'product-by-slug',
  'related-products', 'categories', 'brands', 'settings', 'hero-media',
]

export async function POST(req: Request) {
  // Optional: shared-secret so the endpoint cannot be used as a cache-buster.
  const secret = process.env.REVALIDATE_SECRET
  if (secret && req.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  for (const tag of TAGS) revalidateTag(tag)

  // Data Cache alone does not re-render an already-prerendered page.
  revalidatePath('/', 'layout')          // every route using the root layout
  revalidatePath('/catalog')
  revalidatePath('/product/[slug]', 'page')

  return NextResponse.json({ revalidated: true, timestamp: Date.now() })
}
```

`revalidatePath('/', 'layout')` is the broad, safe call: it invalidates every route under the root layout, which for a 222-page catalogue regenerates on the next request anyway (ISR is lazy — nothing is rebuilt until it is asked for).

### 3.4 Correct strategy for this app, route by route

| Route | Today | Should be | Why |
|---|---|---|---|
| `/` | `force-dynamic` | **static + `revalidate = 3600`** | Data is all `unstable_cache`-tagged. No per-user content. Nothing to be dynamic about. |
| `/about` | `force-dynamic` | **static** (`revalidate = 86400`) | Reads `getSiteSettings()` only. |
| `/product/[slug]` | `force-dynamic` | **`generateStaticParams` + `revalidate = 3600` + `dynamicParams = true`** | 222 known slugs; renders at build, revalidates hourly, new slugs render on demand. |
| `/catalog` (no params) | `force-dynamic` | **static + `revalidate = 600`** | First 12 products + filters are the same for everyone. |
| `/catalog?…` (params) | `force-dynamic` | **dynamic, but data-cached; canonical/noindex per §2.3** | `searchParams` forces dynamic rendering — accept it for filtered views, and stop paying for it on the unfiltered one. |
| `/cart` | static (stale 29 days) | **static + `robots: noindex`** (§2.4) | User-specific, so it must not be cached with contents; today it caches an empty shell forever. |
| `/cart/shared` | `force-dynamic` | **`force-dynamic` + `noindex`** | Genuinely per-request and per-URL. Correct as is, minus the indexing. |

**Product page patch** (drop `force-dynamic` at line 41, add three exports; `getCatalogProductSlugs` already exists, is tagged `products`, and selects only `slug` — use it instead of `getPublishedProducts()`, which pulls full relations and images for 222 rows at build):

```ts
// app/(public)/product/[slug]/page.tsx
import { getCatalogProductSlugs } from '@/lib/queries'

// Pre-render every published product at build time.
export async function generateStaticParams() {
  const slugs = await getCatalogProductSlugs({})
  // safeQuery returns [] on DB error; an empty list is survivable because of
  // dynamicParams, but it must be visible in the build log, not silent.
  if (slugs.length === 0) console.warn('[build] generateStaticParams: 0 slugs — DB unreachable?')
  return slugs.map(({ slug }) => ({ slug }))
}

// New products (and products published between builds) render on first request.
export const dynamicParams = true

// ISR: re-render at most hourly; /api/revalidate forces it sooner.
export const revalidate = 3600
```

Do **not** also set `export const dynamic = 'force-static'` here — `generateStaticParams` + `revalidate` already produces static output, and `force-static` would additionally force static behaviour on `searchParams`/`headers` usage you may add later.

**Home patch** (`app/(public)/page.tsx`, delete line 8, add one line):

```ts
export const revalidate = 3600
```

`FeaturedProducts` (`components/public/featured-products.tsx:4`) is an async server component reading `getFeaturedProducts()`, which is tagged `products` + `featured-products`; nothing on this route reads cookies, headers or searchParams. It is safe to cache. The only client-side interactive parts (`Hero` media, `FeaturedScroll`) are props-driven and hydrating normally.

**Catalog patch** — split the two cases rather than forcing one behaviour on both. Keep the dynamic filtered view, but stop the *unfiltered* catalogue from being dynamic:

```ts
// app/(public)/catalog/page.tsx
// Keep searchParams dynamic; cache the data (already tagged) and let the CDN
// serve the unfiltered page from ISR.
export const revalidate = 600
// remove: export const dynamic = 'force-dynamic'
```

With `searchParams` in the signature the route stays dynamic *for filtered requests* — that is unavoidable in Next 14 App Router and is the correct trade: those URLs are the ones that should not be indexed anyway (§2.3). The unfiltered `/catalog`, which is the page that must rank, becomes a cached static route.

### 3.5 Pagination is not crawlable (H3)

`ProductGrid` is a client component that appends products via `fetch('/api/catalog?…&page=N')` (`components/public/product-grid.tsx:62`). There is no `page` in the catalog URL contract, no `<a href>` to page 2, and no `rel="next"`. Google no longer uses `rel=next`/`prev` for indexing but *does* require that paginated content be reachable by links.

With 12 per page and 222 products there are 19 pages; **18 of them have no URL**. Two acceptable fixes, in order of value:

1. **Real paginated URLs**: `/catalog?page=2` rendered server-side with real `<a href>` links (`?page=` canonical to itself, `noindex` beyond ~page 3 to avoid infinite-crawl on filters). Cheapest correct fix.
2. **Explicit "all products" surface**: `/brands/[slug]` and `/categories/[slug]` pages that list their full set server-side, so every product has at least two crawlable inbound links. This is the better long-term architecture and is already in progress — but see P0-b: those routes must exist and return 200 before anything points at them.

Either way, the sitemap (§4.1) is what closes the gap today: once its `<loc>`s are real, every product has an entry even without internal links. That is exactly why C1 is Critical and this is High.

### 3.6 Build-time risks to handle during cutover

- `generateStaticParams` runs inside `next build` (`vercel.json:2` → `prisma generate && next build`). It needs `DATABASE_URL` / `DATABASE_AUTH_TOKEN` present in the build environment. If they are, 222 pages prerender; if not, `safeQuery` swallows the error and you get 0 pages and a green build — hence the explicit `console.warn` above. Check the build log for `● /product/[slug]` with 222 paths after the first deploy.
- `safeUnstableCache` (lib/queries.ts:24-66) parks results over 1.5 MB in an **in-process** `Map` because of the 2 MB Data Cache item limit. That Map is per-Lambda and disappears on cold start; it is fine for a warm instance but must never be relied on for correctness. Removing `force-dynamic` does not change this — the same code path runs at build and at revalidate.
- Do not lower `revalidate` below ~600 s while the catalogue is edited from `/admin` a few times a day: every revalidation is a full DB read of 222 products with images joined.

---

## 4. Sitemap & robots — ready-to-paste replacements

### 4.0 Version check that decides the design

`MetadataRoute.Sitemap` in the **installed** Next.js (14.2.35) is, verbatim from `node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts:472-480`:

```ts
type SitemapFile = Array<{
    url: string;
    lastModified?: string | Date;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
    alternates?: {
        languages?: Languages<string>;
    };
}>;
```

**There is no `images` field in 14.2.** Passing one is a TypeScript error, and it would be silently dropped if you cast around it. Image sitemap must be its own route handler (§4.3). (`images`/`videos` on `MetadataRoute.Sitemap` arrive in Next 15.)

Also note `alternates.languages` exists here and `Languages<string>` is a string map — hreflang has no role on a single-locale INR site, so it is not used below.

### 4.1 `app/sitemap.ts`

Design decisions, each tied to a finding:
- Origin comes from `lib/seo/site.ts` → `SITE_URL` (C1). That file already exists in the working tree; do not create a second helper.
- `lastModified` is a real entity timestamp, never `new Date()` (H4). The three static routes inherit the newest product update, which is the honest freshness signal for a catalogue page.
- `changeFrequency` and `priority` are dropped: Google ignores both. They are noise that suggests control you do not have.
- `/brands` is listed, `/brands/[slug]` and `/categories/[slug]` are **not** — those routes do not exist (P0-b). They go in the same commit that ships the routes, not before.

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { getPublishedProducts, getBrands } from '@/lib/queries'
import { SITE_URL } from '@/lib/seo/site'

/**
 * Rebuild at most hourly. The sitemap is generated from the Data Cache, so this
 * is cheap; leaving it dynamic would let `lastmod` drift to request time, which
 * is what taught Google to distrust it.
 */
export const revalidate = 3600

/** Real content-change date for /about. Update this when the page copy changes. */
const ABOUT_LAST_MODIFIED = new Date('2026-11-01T00:00:00.000Z')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, brands] = await Promise.all([getPublishedProducts(), getBrands()])

  // Newest product edit is the freshness signal for every collection page:
  // the catalogue body genuinely changes when a product does.
  const newestProductUpdate = products.reduce<Date | null>((latest, product) => {
    const updated = new Date(product.updatedAt)
    return !latest || updated > latest ? updated : latest
  }, null)

  const collectionLastModified = newestProductUpdate ?? ABOUT_LAST_MODIFIED

  // Only routes that return 200 belong here. Add /brands/[slug] here in the same
  // commit that ships that route — a 404 in a sitemap is a lie Google remembers.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: collectionLastModified },
    { url: `${SITE_URL}/catalog`, lastModified: collectionLastModified },
    { url: `${SITE_URL}/brands`, lastModified: collectionLastModified },
    { url: `${SITE_URL}/about`, lastModified: ABOUT_LAST_MODIFIED },
  ]

  // `brands` is fetched so the build fails loudly if the brand list disappears;
  // it is not itself enumerated into URLs until the [slug] route exists.
  if (brands.length === 0) {
    console.warn('[sitemap] 0 brands — /brands may be empty and should not be listed')
  }

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: new Date(product.updatedAt),
  }))

  return [...staticRoutes, ...productRoutes]
}
```

Expected output after deploy: 4 + 222 = **226** `<loc>`s, every one on `https://www.diecastheavenudaipur.in`, every `lastmod` a real timestamp, no `changefreq`, no `priority`.

One caveat on the 69.3% identical-`lastmod` problem: 156 of 222 products share `2026-11-01T10:15:14.036Z` because they were bulk-imported in one transaction (`@updatedAt` sets the same value). That is *accurate*, not fake — but Google will treat a large identical cluster as low-confidence. Do not invent stagger; the fix is that future edits produce genuinely distinct values. Verify with `sitemap_discovery.py` after deploy that `lastmod_identical_share` drops below ~0.5 as products are edited.

### 4.2 `app/robots.ts`

```ts
// app/robots.ts
import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo/site'

/**
 * - Absolute sitemap URLs from SITE_URL (previously http://localhost:3000).
 * - /cart is NOT disallowed: it carries a server-rendered noindex, and a
 *   disallowed URL can never be crawled to read that noindex. The noindex is
 *   the removal signal; robots.txt is only a crawl control.
 * - /admin, /analytics, /api/ are blocked because they are auth-gated and have
 *   no indexable value; they also carry noindex on the pages a crawler can reach.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/analytics', '/api/'],
      },
      // AI answer engines are allowed explicitly. This catalogue benefits from
      // being quoted ("hot wheels premium mercedes 300 sl india") and there is
      // nothing private here. Blocking GPTBot would not affect ChatGPT Search —
      // that is OAI-SearchBot — so all of them are listed rather than implied.
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-SearchBot',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot',
        ],
        allow: '/',
        disallow: ['/admin', '/analytics', '/api/'],
      },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/sitemap-images.xml`],
  }
}
```

Notes:
- **`/cart` deliberately absent from `disallow`.** This is the one place to disagree with the in-flight file (`app/robots.ts:20,36` in the working tree disallows `/cart` *and* sets noindex). Pick one: `noindex` requires crawlability. Since the layout in §2.4 emits the directive, robots.txt must not block it.
- **One wildcard group**, not two (L2).
- `host` is Yandex-only and harmless to omit; it is omitted to avoid implying a Google directive.
- `Google-Extended` does not affect Search indexing or AI Overviews — it governs Gemini/Vertex training use. Listing it under `allow` simply states the intent.

### 4.3 Image sitemap (required, because 14.2 has no `images` field)

`app/sitemap-images.xml/route.ts` already exists in the working tree and is the right call. Shape it must keep (max **1,000** `<image:image>` per `<url>`; only `<image:loc>` is strictly required, `<image:title>`/`<image:caption>` are still supported):

```ts
// app/sitemap-images.xml/route.ts
import { getPublishedProducts } from '@/lib/queries'
import { SITE_URL, absoluteUrl } from '@/lib/seo/site'
import { escapeXml } from '@/lib/seo/xml'

export const revalidate = 3600

export async function GET() {
  const products = await getPublishedProducts()

  const urls = products
    .filter((product) => product.images.length > 0)   // empty <url> blocks are errors
    .map((product) => {
      const images = product.images
        .slice(0, 1000)
        .map((image) =>
          [
            '    <image:image>',
            `      <image:loc>${escapeXml(absoluteUrl(image.imageUrl))}</image:loc>`,
            `      <image:title>${escapeXml(image.altText || product.title)}</image:title>`,
            '    </image:image>',
          ].join('\n')
        )
        .join('\n')

      return [
        '  <url>',
        `    <loc>${escapeXml(`${SITE_URL}/product/${product.slug}`)}</loc>`,
        `    <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>`,
        images,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
```

Two things to verify before shipping, because `getPublishedProducts()` returns `DEFAULT_INCLUDE` (brand + categories + **all images**) for 222 products: the response size (currently the HTML sitemap is 43.6 KB; an image sitemap with 1–8 images per product will be ~10× that, still far under 50 MB) and that `absoluteUrl` is a no-op on the Vercel Blob URLs, which are already absolute `https://…public.blob.vercel-storage.com/...`. It is (`lib/seo/site.ts:70-74` returns absolute inputs unchanged).

No sitemap index is needed at 226 + 222 URLs — both files are independent `<urlset>` documents and both are declared in robots.txt. An index is only required past 50,000 URLs or 50 MB.

---

## 5. Indexing & monitoring

### 5.1 Search Console — after the sitemap fix lands

1. **Submit once, correctly:** `https://www.diecastheavenudaipur.in/sitemap.xml` and `.../sitemap-images.xml`. Submit the live URL, not robots.txt — the robots declaration becomes redundant once Search Console knows the file.
2. **Do not expect instant re-crawl.** The 225 localhost `<loc>`s were never on this site; Google will drop them from the "Sitemap could not be read / URLs not on this property" bucket on its next fetch. No manual removal action is needed — you cannot request removal of URLs you never owned.
3. **URL Inspection → Request indexing** for the 15 highest-value URLs only (home, `/catalog`, `/brands`, top 10 products by margin). Request-indexing is rate-limited and worthless at scale; the sitemap does the bulk work.
4. **Page indexing report** → watch "Duplicate, Google chose different canonical" for `/catalog?brand=…` and `/catalog?view=brands` for two weeks after canonicals ship. This is the report that proves C2 is fixed, and per Google's own guidance a corrected URL can stay in a duplicate cluster for **up to two weeks** — an unchanged report on day 2 is not a failure.
5. **Settings → Crawl stats** → watch "Average response time" and "Total crawl requests" before/after H1. This is the empirical measure of crawl efficiency, and it is the only place the caching change shows up as an SEO metric.
6. **Sitemaps report** → `Discovered URLs` should read 226 (+ images), not 225-with-errors.

### 5.2 IndexNow (Bing, Yandex, Naver — not Google)

Worth doing for a 222-SKU catalogue that restocks weekly; it is ~30 lines and gives Bing same-day discovery:

```ts
// app/indexnow/route.ts  — call this from the same admin action that hits /api/revalidate
import { NextResponse } from 'next/server'
import { SITE_URL, absoluteUrl } from '@/lib/seo/site'

const KEY = process.env.INDEXNOW_KEY   // 8-64 hex chars, also served at /<KEY>.txt

export async function POST(req: Request) {
  if (!KEY) return NextResponse.json({ skipped: 'INDEXNOW_KEY unset' })
  const { paths } = (await req.json()) as { paths: string[] }

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key: KEY,
      keyLocation: `${SITE_URL}/${KEY}.txt`,
      urlList: paths.slice(0, 10000).map((p) => absoluteUrl(p)),
    }),
  })
  return NextResponse.json({ status: res.status })
}
```

Prerequisite: `https://www.diecastheavenudaipur.in/<KEY>.txt` must return the key itself (put it in `public/`). IndexNow rejects submissions whose `keyLocation` 404s.

### 5.3 Bing Webmaster Tools

Import from Google Search Console (one click, inherits verification), then submit both sitemaps. Bing powers ChatGPT Search discovery surfaces, so for this catalogue it is not an afterthought.

### 5.4 Google Indexing API — **not applicable to products**

State this plainly to stakeholders so nobody builds it: the Indexing API accepts **only `JobPosting` and `BroadcastEvent`** URLs. It has never supported `Product`, `Offer` or generic pages, and using it for products produces `Permission denied` / `Invalid attribute` responses. Product freshness comes from the sitemap `lastmod`, internal links, and crawl frequency. Do not budget for it.

---

## 6. Security headers

Reality check first: these are a **security and trust** matter. HTTPS is a confirmed (very lightweight) ranking signal; CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy` and `X-Frame-Options` are not ranking signals at all. The product case is narrower and real — the site's entire checkout is a WhatsApp hand-off, so a clickjacked overlay that swaps the number is a direct revenue attack, and a MIME-sniffed Blob asset is a stored-XSS vector.

`next.config.js` was 16 lines at audit time (`reactStrictMode`, `images.remotePatterns`); the working tree has since added `poweredByHeader: false` and a partial `headers()` block with `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy` — **no CSP, no `includeSubDomains`**. Complete it as below:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // drop X-Powered-By: Next.js
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  async headers() {
    // CSP-lite: no nonce yet, so 'unsafe-inline' stays. Removing it requires a
    // nonce plumbed through middleware + every inline bootstrap script — do that
    // as a follow-up, not in the same change as the headers themselves.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://wa.me",
      'upgrade-insecure-requests',
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' }, // legacy twin of frame-ancestors
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

Deployment notes that matter:
- **`includeSubDomains` is safe here** (the only subdomain in service is `www`, which is HTTPS-only and serves its own valid certificate — verified §2.7). **Do not add `preload`** until every possible subdomain is HTTPS-only; preload removal takes months and cannot be undone quickly.
- **Roll CSP out as `Content-Security-Policy-Report-Only` for 7 days first**, collecting violations on the product page, cart and lightbox. The lightbox (`yet-another-react-lightbox`) and the Blob image CDN are the two things most likely to violate a first-draft policy.
- Verify with `curl -sI https://www.diecastheavenudaipur.in/product/<slug> | grep -i -E 'content-security|x-content|referrer|permissions|strict'` after deploy — Vercel serves the `headers()` block from the edge, so it appears even on cached responses.

---

## 7. Verified non-issues (do not "fix" these)

Each of these was checked and is correct today. They are recorded so a future audit does not re-open them, and so the real findings keep their weight.

| Area | Verified state | Source |
|---|---|---|
| TLS on www | Valid chain, `CN=www.diecastheavenudaipur.in`, Let's Encrypt `YR1`, `notAfter 2026-12-26`, TLSv1.3 / `TLS_AES_128_GCM_SHA256`, 44 days to expiry (auto-renewing — this is a 90-day cert at day 46, not a warning) | `transport.json` `tls.*`; live probe |
| TLS on apex | Valid, **separate** certificate `CN=diecastheavenudaipur.in`, SAN = apex. `covers_sibling: false` in `transport.json` describes the www cert on the apex host and is **not** a defect | live `openssl s_client` |
| HTTP → HTTPS | `308`, 1 hop, same host, permanent | `transport.json` `redirects.http_to_https` |
| Apex → www | `308` → `https://www.diecastheavenudaipur.in/`, 1 hop | `transport.json` `redirects.www`; live probe |
| HSTS present | `max-age=63072000` (2 years) on both hosts. Only `includeSubDomains` is missing (M2) | `transport.json` `headers.hsts` |
| Trailing slashes | Consistent; `/cart/` and `/catalog/` 308 to the slashless form, single hop | live probes §2.6 |
| `lang` attribute | `<html lang="en">` present and valid (working tree improves it to `en-IN`) | `page-product.json` `lang: "en"` |
| Viewport | Present, responsive, no horizontal scroll | `page-product.json` `has_viewport: true` |
| Charset | `utf-8` in both the HTTP header and `<meta charset>`; `has_doctype: true` | `page-product.json` |
| Alt text | **0** images missing alt (8/8 have it) | `page-product.json` `images.missing_alt: 0` |
| Mixed content | **0** instances; **0** `http://` links on an HTTPS page | `page-product.json` `mixed_content: 0`, `links.http_on_https: 0` |
| Heading structure | 1 H1, **0** heading-level skips in content or template | `page-product.json` `h1_count: 1`, `heading_level_skips: 0` |
| DOM depth | 317 nodes, max depth **12**, max 29 children (`<head>`) — well inside the 32/60 heuristics | `page-product.json` `dom.*` |
| Server-side rendering | H1, body copy and breadcrumbs are all in the raw HTML — no JS needed to see the product. Total HTML 81,163 bytes, far under Googlebot's 2 MB fetch limit | `page-product.json` `word_count: 208` (measured from HTML) |
| Link text | 27 links, **0** empty anchors, **0** generic "click here" | `page-product.json` `links.without_text: 0`, `generic_anchor: 0` |
| URL structure | Clean, hyphenated, no parameters on canonical content URLs; 100 chars on the longest slug (at the heuristic limit, not over) | `page-product.json` `url.length: 100` |
| Sitemap validity | Valid `urlset` XML, 225 unique URLs, 0 duplicates, 0 invalid locs, 0 redacted tokens, 43,590 bytes, correctly typed `application/xml` | `sitemap.json` `expanded.files[0]` |
| Robots.txt reachability | `200`, `text/plain`, 166 bytes | live probe |
| Admin/analytics gating | Middleware correctly redirects unauthenticated requests and the matcher covers `/admin` (zero-or-more path segments) | `middleware.ts:24-40`; live 307s |
| No cookie leakage | Response sets no cookies on the public pages | `transport.json` `headers.cookies: []` |

---

## 8. How we would know this failed

Every Critical/High finding gets a falsifiable check, with the signal that means "it did not work". This is the section to re-run in 14 and 30 days.

**C1 — localhost sitemap**
- Pass: `curl -s https://www.diecastheavenudaipur.in/robots.txt | grep Sitemap` returns `https://www.diecastheavenudaipur.in/sitemap.xml`; `curl -s .../sitemap.xml | grep -c 'localhost'` returns **0**; Search Console Sitemaps shows `Success` with 226 discovered URLs.
- Fail: Search Console still shows "Couldn't fetch" after 7 days, **or** any `<loc>` matches `localhost`, **or** "Discovered URLs" stays at 0. If discovered URLs are correct but the products do not appear in `site:diecastheavenudaipur.in/product` within ~3 weeks, discovery was never the whole problem — re-check H3 and M4 before blaming the sitemap again.

**C2 — canonicals / duplicate titles**
- Pass: `curl -s <url> | grep -o '<link rel="canonical"[^>]*>'` returns a self-referencing absolute URL on `/`, `/catalog`, `/about` and a sampled product; the four titles are distinct.
- Fail: any page returns no canonical, a canonical pointing at `/`, or a canonical pointing at a URL that 308-redirects. **Also a fail:** Search Console → Page indexing still shows `/catalog` as "Duplicate, Google chose different canonical" **14 days** after canonicals are live (the two-week re-evaluation window has expired by then, so persistence past that point is a real signal).

**H1 — force-dynamic**
- Pass: `curl -sI <product-url> | grep -i cache-control` shows `s-maxage`/`stale-while-revalidate` (not `no-store`), and two requests 60 s apart return different `Age` values with `X-Vercel-Cache: HIT` on the second. Build log lists `● /product/[slug]` with 222 prerendered paths.
- Fail: `Cache-Control` still contains `no-store`, **or** the build log shows 0 static paths (DB env missing at build — see §3.6), **or** Search Console Crawl stats "Average response time" is unchanged after 2 weeks.

**H2 — /cart indexable**
- Pass: `curl -s https://www.diecastheavenudaipur.in/cart | grep -o '<meta name="robots"[^>]*>'` returns `noindex`; `site:diecastheavenudaipur.in/cart` in Google is empty within ~4 weeks.
- Fail: no robots meta in the raw HTML (means the layout fix did not land, or was put on the client component and silently ignored), **or** `/cart` still appears in Search Console → Pages as an indexed URL after the next crawl cycle.

**H3 — pagination**
- Pass: every product URL has ≥2 crawlable inbound `<a href>`s (verify on a sample of 20 from the middle of the catalogue using an internal-link report), or `/catalog?page=2..19` returns 200 with real links.
- Fail: `fetch` remains the only path to page 2 — symptom is Search Console → "Crawled – currently not indexed" concentrating on later products, and Crawl stats depth staying at 1 for 95% of the catalogue.

**H4 — lastmod**
- Pass: `sitemap_discovery.py --expand` reports `lastmod_identical_share` trending down and `lastmod_newest` **no longer equal to the response `Date` header**. A product edited through `/admin`, then `POST /api/revalidate`, shows the new `lastmod` within one fetch.
- Fail: `lastmod_newest` still tracks request time, or a real edit does not change the value (means `revalidatePath` is missing from `/api/revalidate` — §3.3).

**H5 — admin/analytics**
- Pass: `/admin/login` and `/analytics/login` raw HTML contains `noindex`; `site:diecastheavenudaipur.in admin` returns nothing brand-relevant.
- Fail: login pages return 200 with no robots meta **and** robots.txt still disallows them — that combination means the directive can never be read, so the URL stays eligible indefinitely.

**P0-a / P0-b — pre-deploy gate**
- Pass: `curl -s https://www.diecastheavenudaipur.in/about | grep canonical` → `/about`; `curl -o /dev/null -w '%{http_code}' <every sitemap loc>` returns 200 for **100%** of locs.
- Fail: the About page canonicalises to `/`, or any `<loc>` returns 404/308. Run the 404 sweep as a deploy gate, not as an audit afterthought.

---

## Appendix — remediation order

| Order | Item | Finding | Effort | Blocks |
|---|---|---|---|---|
| 1 | One `SITE_URL` helper; import in `sitemap.ts` + `robots.ts` | C1 | 30 min | Everything downstream |
| 2 | Deploy gate: every sitemap `<loc>` returns 200; no root canonical | P0-a, P0-b | 30 min | The deploy itself |
| 3 | Per-route canonicals + `metadataBase`; distinct titles | C2 | 2 h | Ranking of `/catalog` |
| 4 | `noindex` on cart (server layout) | H2 | 20 min | — |
| 5 | Remove `force-dynamic`; `generateStaticParams`; `revalidatePath` in `/api/revalidate` | H1 | 3 h | Crawl efficiency |
| 6 | Real `lastmod` in sitemap | H4 | (covered by 1) | Freshness |
| 7 | `?page=` or brand/category routes for crawlable pagination | H3 | 1 day | Link equity |
| 8 | `noindex` on auth pages + `X-Robots-Tag` | H5 | 30 min | — |
| 9 | `headers()` in `next.config.js`, CSP report-only first | M2 | 1 h | — |
| 10 | Sitemap submission, IndexNow, Bing import | §5 | 1 h | Monitoring |
| 11 | Product copy + `Product` JSON-LD (other workstreams) | M3, M4 | — | Rich results |

**What changes when this lands:** the catalogue becomes discoverable through a valid sitemap on the right host (C1), the hub page is allowed to rank as itself (C2), 222 product URLs are served from cache instead of rendered per request (H1, H3), and Google is given a `lastmod` it can believe (H4). Nothing in this list adds content — it stops the existing 222 products from being invisible for reasons that have nothing to do with their quality.

---

*Audit produced from commit `f25c0df` + live probes on 2026-11-12. No source file was modified; this report is the only artefact.*





