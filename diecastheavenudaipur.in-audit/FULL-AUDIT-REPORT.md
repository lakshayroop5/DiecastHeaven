# SEO Audit: diecastheavenudaipur.in

Audit date: 2026-10-29 · Method: claude-seo v2.5.0 (seo-audit, seo-ecommerce, seo-schema, seo-technical, seo-local) · Scope: live site (all 239 product URLs crawled) and local source at `Website/` (branch `muse_ui_0`, 25 uncommitted files).

## Executive Summary

| Metric | Value |
|---|---|
| SEO Health Score (live) | **38 / 100** |
| Shopping / product-listing readiness (live) | **32 / 100** (about 50 once local code is deployed) |
| Business type | Hybrid: e-commerce catalog + physical store (Udaipur), WhatsApp checkout |
| Products in sitemap | 239 (59 sold out, 31 pre-order) |
| Product pages with structured data (live) | **0 / 239** |
| Product pages with canonical (live) | **0 / 239** |

The goal is to have products appear in Google's product surfaces (Shopping tab, popular products, "compare prices" panels) next to Amazon and Flipkart. Today the site cannot qualify for those surfaces. Live pages have no Product markup, the sitemap and robots.txt point at `localhost`, there is no Merchant Center feed and products carry no GTIN identifiers. Most of the on-page groundwork already exists in uncommitted local code. Shipping that code, adding product identifiers and connecting Google Merchant Center are the three moves that unlock product listings.

### Top 5 critical issues

1. **Security, outside SEO scope but urgent:** `/api/admin/*` is not protected. The middleware matcher covers `/admin/:path*` but not `/api/admin/:path*`, and the route handlers do no auth check of their own. An unauthenticated `GET /api/admin/products` returned 200 with 402 KB of product data. The same handlers expose PUT, DELETE, POST, upload and settings. That means anyone could change prices, delete products or replace the WhatsApp number. Write endpoints were not tested.
2. Live `robots.txt` declares `Sitemap: http://localhost:3000/sitemap.xml`, and every `<loc>` in the sitemap is `http://localhost:3000/...`. The cause is the deployed code's fallback `|| 'http://localhost:3000'` combined with no `NEXT_PUBLIC_SITE_URL` in Vercel production. Local code already fixes the fallback.
3. No JSON-LD on any live page: no Product, Offer, Organization or LocalBusiness markup. Google's merchant listing experiences need Product + Offer markup or a Merchant Center feed.
4. No product identifiers (GTIN/MPN) in the data model. Without a GTIN, Google cannot cluster the site's offer with Amazon/Flipkart offers for the same product.
5. No Merchant Center presence, and checkout is WhatsApp-only. Google's checkout policy requires that customers can add in-stock products to the cart and finalize the purchase. A WhatsApp-only finish is an approval risk for online free listings.

### Top 5 quick wins

1. Commit and deploy the existing local SEO work: canonicals, Product/Breadcrumb/Organization/ToyStore JSON-LD, production URL fallbacks, image sitemap, `/contact` page (currently 404 live).
2. Set `NEXT_PUBLIC_SITE_URL=https://www.diecastheavenudaipur.in` in Vercel Production.
3. Fix the title template. `app/(public)/layout.tsx` sets `title.absolute` with no template, so product, catalog and about titles lose the "| Diecast Heaven Udaipur" suffix. This was confirmed in Next 14.2.35 `resolve-metadata.js`.
4. Map `availability` correctly: `PRE_ORDER` → `PreOrder` (31 products are currently marked `InStock` in the local JSON-LD).
5. Verify a Search Console domain property and submit `https://www.diecastheavenudaipur.in/sitemap.xml`.

## Scores by Category

| Category | Weight | Score | Basis |
|---|---|---|---|
| Technical SEO | 22% | 40 | localhost sitemap/robots, no canonicals, `no-store` on all pages; SSR and HTTPS pass |
| Content Quality | 23% | 35 | 58% of descriptions under 50 words, 15% empty, 60% short description = title |
| On-Page SEO | 20% | 40 | weak home/catalog titles, meta description = title on 61%, no brand/category landing pages |
| Schema / Structured Data | 10% | 5 | none live; local code reaches required fields only |
| Performance (CWV) | 10% | 60 (estimate) | PSI rate-limited without an API key; TTFB median 137 ms, p90 668 ms, max 5.3 s |
| AI Search Readiness | 10% | 40 | content server-rendered (1,152 words without JS); thin entity/product facts |
| Images | 5% | 55 | alt text present, next/image optimization; 92% single-image products, camera filenames |

## Findings

### Technical SEO

| Severity | Finding | Evidence | Fix |
|---|---|---|---|
| Critical | Sitemap and robots point to localhost | `robots.txt` line `Sitemap: http://localhost:3000/sitemap.xml`; 242/242 `<loc>` are localhost | Deploy local `app/robots.ts` + `app/sitemap.ts`; set env var |
| Critical | No canonical tags live | 0/239 product pages | Already in local code (`alternates.canonical`) |
| High | `/contact` returns 404 | Live 404; page exists only as an untracked local file | Deploy |
| High | Every page is `force-dynamic` → `Cache-Control: private, no-cache, no-store`, `x-vercel-cache: MISS` on 239/239 | Crawl headers | Use ISR (`revalidate`) + existing `revalidateTag` calls; also restores bfcache eligibility (preload_check score 50) |
| Medium | Catalog loads products past the first 12 by infinite scroll only | `product-grid.tsx` fetches `/api/catalog` on scroll | Add crawlable `<a href="?page=N">` pagination |
| Medium | Brand/category filters all canonicalize to `/catalog` | `catalog/page.tsx` canonical | Dedicated `/brand/[slug]`, `/category/[slug]` pages |
| Low | robots.ts emits two `User-agent: *` groups | live robots.txt | Merge into one group |
| Low | `lastModified: new Date()` on home/catalog/about | `sitemap.ts` | Use real last-change dates or omit |
| Low | `/api/revalidate` is unauthenticated | route has no check | Gate with admin session or secret |

### Shopping / Merchant Listing Readiness

| Severity | Finding | Evidence | Fix |
|---|---|---|---|
| Critical | No Product/Offer JSON-LD live | 0/239 | Deploy local JSON-LD, then extend it (see Action Plan 1.3) |
| Critical | No GTIN/MPN in the data model | `prisma/schema.prisma` Product model | Add `gtin`, `mpn`; capture the barcode from packaging |
| Critical | No Merchant Center feed or account | none found | Create MC, claim domain, add feed |
| High | Checkout ends in WhatsApp; no online payment | `cart/page.tsx` `handleCheckout` builds a WhatsApp message | Add online payment (UPI/Razorpay) for online free listings; use free local listings meanwhile |
| High | No shipping, returns, terms or privacy pages | none in `app/(public)` | Add policy pages + MerchantReturnPolicy / shippingDetails markup |
| High | Pre-orders would be marked `InStock` | local JSON-LD maps only `SOLD_OUT` | Map `PRE_ORDER` → `PreOrder` (feed: `preorder` + `availability_date`) |
| High | Brand values unsuitable for matching | `HOTWHEELS` (75), `HOTWHEELS PREMIUM` (40), `INNO 64` (18) | Normalize: `Hot Wheels` (line "Premium" goes in title/series), `INNO64` |
| Medium | Sale price not marked up | page shows ₹699 with ₹999 struck through | `priceSpecification` with `priceType: StrikethroughPrice` |
| Medium | Product image carries a text overlay | Porsche 997 main image: "Actual Size & Colour May Vary." | Merchant Center disallows promotional/text overlays on the main image; use a clean main image |
| Medium | Local JSON-LD validator result | `schema_ecommerce_validate.py`: missing `hasMerchantReturnPolicy`, `shippingDetails` | Add both (Action Plan 1.3) |

### Content Quality (239 product pages)

| Metric | Value |
|---|---|
| Description empty | 36 (15%) |
| Description under 50 words | 139 (58%) |
| Description 150+ words | 53 (22%) |
| Short description identical to title | 143 (60%) |
| ALL-CAPS product names | 51 (21%) |
| Names of 3 words or fewer (e.g. "TWIN TAGS", "UNCERTAIN-T", "MAD DRIP") | 24 (10%) |
| Stray characters in names (`HW TEST RIDE"`, `COUPE CLIP"`) | present |
| Scale stated | 92 (38%) |
| Categories in internal jargon ("AS SINGLE", "MAINLINE COMBO", "FANTASY", "COLLECTABLE") | all |

Short casting names like "TWIN TAGS" do not say that the product is a Hot Wheels 1:64 diecast car. Shoppers search "hot wheels twin mill" or "hot wheels premium skyline price", so names should carry brand, line, model, colour and scale.

`/about` carries FAQPage markup. Info only: Google retired FAQ rich results on 2026-05-07. Keep it; no SERP benefit is expected.

### On-Page SEO

| Severity | Finding | Fix |
|---|---|---|
| High | Homepage title is "Diecast Heaven" (live) | e.g. "Diecast Heaven Udaipur – Hot Wheels, Matchbox & Model Car Store" |
| High | Meta description = product title on 61% of products | Template: brand + model + scale + price + "Shop in Udaipur or order on WhatsApp, pan-India shipping" |
| High | Title template dropped for child pages (local code) | Return `title: { default, template }` from `(public)/layout.tsx` |
| Medium | No default `og:image` on home/catalog | Add `openGraph.images` in the root layout |
| Medium | 25% of titles over 60 characters | Lead with brand + model; trim filler |

### Performance

PageSpeed Insights could not run: the keyless API returned "rate limit exceeded", so no lab or field CWV data was collected. Treat the 60 score as an estimate. What was observed:
- TTFB over 239 product pages: median 137 ms, p90 668 ms, max 5,261 ms. The pages are uncached and every request hits the Turso DB.
- Homepage HTML is 281 KB, mostly RSC payload for the featured products with full relations.
- The LCP image is preloaded with `fetchpriority=high` (pass).
- `no-store` disqualifies pages from bfcache.

Next step: add a free PSI API key (`/seo google setup`) and re-run `pagespeed_check.py`.

### Images

- 236/239 products have a main image; alt text equals the product name (pass).
- Only 20/239 (8%) have more than one image. Merchant listings and shoppers benefit from 3 or more angles.
- 82% of filenames are camera defaults (`img-2277.jpeg`). Name uploads from the product slug.

### Local SEO

- The local code has a `ToyStore` LocalBusiness block with NAP, geo, hours and `hasMap`. It is not deployed.
- Google lists India as a supported country for free local listings and local inventory. Linking the Business Profile to Merchant Center enables "See what's in store" on the profile and in-store product listings. That path fits the walk-in/WhatsApp model without needing online payment.
- GBP ownership, categories and reviews were not checked; access is needed.

### AI Search Readiness

- Primary content is server-rendered (pass); robots allows all crawlers.
- No `llms.txt` (optional; Google ignores it).
- Product facts (brand, scale, series, year, colour) are mostly absent, so there is little for AI answers to cite.

## Method and Limits

- Scripts run: `sitemap_discovery.py`, `parse_html.py` (home, catalog, product), `agentic_check.py`, `preload_check.py`, `content_quality.py`, `schema_ecommerce_validate.py` (on the JSON-LD the local code would emit), `capture_screenshot.py`, plus a 239-URL product crawl. Raw output is in `raw/`; screenshots are in `screenshots/`.
- Not measured: CWV (PSI quota), Search Console indexing (no access), Merchant Center (none), GBP (no access), backlinks.
- Google policy sources: Merchant listing structured data (developers.google.com/search/docs/appearance/structured-data/merchant-listing), Merchant Center checkout requirements (support.google.com/merchants/answer/9158778), free local listings (support.google.com/merchants/answer/15310605).
- Showing next to Amazon/Flipkart is decided by Google. Nothing here guarantees placement; the plan maximizes eligibility and match quality.
