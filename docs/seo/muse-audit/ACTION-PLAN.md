# Action Plan: Get diecastheavenudaipur.in products into Google product listings

Goal: when someone searches a product the store stocks (for example "hot wheels premium skyline r34"), Google shows a Diecast Heaven product listing alongside Amazon and Flipkart. Google needs four things for that:

1. Crawlable product pages with correct Product + Offer markup.
2. A Merchant Center account with approved products.
3. Product identifiers (GTIN) so the offer joins the same product cluster as other sellers.
4. Trust signals: policies, checkout, price/availability consistency.

The plan is ordered by dependency. Each item says how to check it worked and what early signal to watch.

## Phase 0: Blockers (Day 1)

| # | Task | Files | Done when (falsifiable) | Leading indicator |
|---|---|---|---|---|
| 0.1 | **Protect `/api/admin/*`** (security, not SEO). Add `'/api/admin/:path*'` to the middleware `matcher` and gate it with the admin session, exempting `/api/admin/auth`. Also gate `/api/revalidate`. | `middleware.ts` | `curl https://www.diecastheavenudaipur.in/api/admin/products` returns 401 while logged out; admin UI still works when logged in | No 200s on `/api/admin/*` without a cookie in Vercel logs |
| 0.2 | Set `NEXT_PUBLIC_SITE_URL=https://www.diecastheavenudaipur.in` in Vercel → Production. Optionally set `GOOGLE_SITE_VERIFICATION` and `GA_MEASUREMENT_ID` too. | Vercel dashboard | n/a (verified by 0.3) | n/a |
| 0.3 | Commit + deploy the existing local SEO work (25 files: canonicals, JSON-LD, robots/sitemap fallbacks, `/contact`, image sitemap). Run `npm run build` first. | working tree | `robots.txt` shows `Sitemap: https://www.diecastheavenudaipur.in/sitemap.xml`; 0 `localhost` in `sitemap.xml`; `/contact` returns 200; Rich Results Test on a product URL detects "Merchant listings" | GSC → Sitemaps: status "Success", 243 discovered URLs |
| 0.4 | Fix the title template: in `generateMetadata` return `title: { default: <businessName>, template: '%s \| Diecast Heaven Udaipur' }` instead of `absolute`. | `app/(public)/layout.tsx` | Product `<title>` ends with "\| Diecast Heaven Udaipur"; homepage title has no double suffix | n/a |
| 0.5 | Search Console: verify the domain property (DNS), submit the sitemap, request indexing for home, catalog and the top 10 products. | GSC | Property verified; sitemap read | GSC → Shopping → Merchant listings report starts showing valid items |

Dependency: 0.3 needs 0.2. Everything in Phase 1 needs 0.3 live.

## Phase 1: Shopping eligibility (Week 1)

### 1.1 Product data fields

Add nullable columns. The change is additive and reversible; run `prisma db push` against Turso after a backup.

```prisma
model Product {
  // ...existing fields
  gtin             String?   // 8/12/13/14-digit barcode from the packaging (UPC/EAN)
  mpn              String?   // manufacturer part no., e.g. Mattel toy number on the card
  color            String?
  series           String?   // e.g. "Premium Boulevard", "Mainline 2025", "Car Culture"
  releaseYear      Int?      @map("release_year")
  availabilityDate DateTime? @map("availability_date") // expected arrival for PRE_ORDER
}
```

Expose these fields in the admin product form. GTIN is the single most important field. Mattel, Majorette, Kinsmart and INNO64 packaging all carry a barcode, so staff can scan it while listing. Only enter real barcodes: an invalid GTIN causes disapproval.

### 1.2 Brand and category clean-up (data, in admin)

| Current | Change to |
|---|---|
| HOTWHEELS | Hot Wheels |
| HOTWHEELS PREMIUM | brand Hot Wheels, series "Premium …" |
| INNO 64 | INNO64 |
| KINSMART / MATCHBOX / MAJORETTE | Kinsmart / Matchbox / Majorette |
| Category "AS SINGLE" | Hot Wheels Mainline Singles (or "Single Cars") |
| Category "MAINLINE COMBO" | Multi-Packs & Combos |
| Category "FANTASY" | Fantasy Castings |
| Category "COLLECTABLE" | Collector Editions |

If merging brands would break the current brand filter UX, map brand names in code (one constant used by the JSON-LD and the feed) instead.

### 1.3 Complete the Product JSON-LD

File: `app/(public)/product/[slug]/page.tsx`, extending `productJsonLd`. Target output:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Kinsmart Porsche 911 GT3 RS (997) 1:36 Die-Cast Model Car – White/Red",
  "description": "<unique description>",
  "url": "https://www.diecastheavenudaipur.in/product/<slug>",
  "image": ["<main>", "<angle 2>", "<angle 3>"],
  "sku": "<product.id>",
  "gtin13": "<only if real>",
  "mpn": "<only if real>",
  "brand": { "@type": "Brand", "name": "Kinsmart" },
  "color": "White/Red",
  "offers": {
    "@type": "Offer",
    "url": "https://www.diecastheavenudaipur.in/product/<slug>",
    "price": 699,
    "priceCurrency": "INR",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "priceType": "https://schema.org/StrikethroughPrice",
      "price": 999,
      "priceCurrency": "INR"
    },
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "shippingDetails": { "@type": "OfferShippingDetails", "...": "from one shared constant" },
    "seller": { "@id": "https://www.diecastheavenudaipur.in/#organization" }
  }
}
```

Rules:
- `availability`: `SOLD_OUT` → `OutOfStock`; `PRE_ORDER` → `PreOrder` (+ `availabilityStarts` from `availabilityDate`); otherwise `InStock`. Use `stock <= 0` only if stock counts are actually maintained.
- Emit `priceSpecification` only when `offerPrice < price`.
- Emit `gtin`/`mpn` only when present. Never use placeholders.
- `shippingDetails`: one constant (destination IN, rate, handling + transit days) shared with the feed and policy page.
- `components/seo/site-schemas.tsx`: add `"@id": baseUrl + "/#organization"` and `hasMerchantReturnPolicy` (MerchantReturnPolicy: `applicableCountry: "IN"`, return window, method, fees) to the Organization block.

Done when: `schema_ecommerce_validate.py` reports 0 Medium findings for shipping and returns, and Rich Results Test shows no merchant-listing warnings for shipping, returns or identifiers.

### 1.4 Policy pages

Add `/shipping-policy`, `/returns-policy`, `/terms` and `/privacy`, linked from the footer. Content must state the real policy (rates, delivery days, return window, condition rules for collectibles, pre-order deposit and refund terms). Merchant Center reviews these pages, and missing ones are a common "Misrepresentation" suspension cause.

### 1.5 Merchant Center product feed

Add `app/feeds/google.xml/route.ts`: an RSS 2.0 feed with the `g:` namespace, generated from `getPublishedProducts()` and cached with the `products` tag. Fields per item:

`g:id` (product id) · `title` · `description` · `link` · `g:image_link` · `g:additional_image_link` · `g:availability` (`in_stock` / `out_of_stock` / `preorder` + `g:availability_date`) · `g:price` ("999.00 INR") · `g:sale_price` ("699.00 INR") · `g:brand` · `g:gtin` · `g:mpn` · `g:identifier_exists` ("no" when neither exists) · `g:condition` ("new") · `g:google_product_category` (Toys & Games > Toys > Play Vehicles; pick the exact node from Google's taxonomy) · `g:product_type` (your category) · `g:shipping`.

Done when: Merchant Center → Products shows 239 items with fewer than 5% disapproved.

### 1.6 Merchant Center setup (manual, owner account)

1. Create a Merchant Center account. Add the business info, phone and address. Verify and claim `www.diecastheavenudaipur.in` (fastest via the Search Console link).
2. Shipping settings: India, rates, handling and transit times. Must match 1.3 and 1.4.
3. Return policy settings: must match 1.4.
4. Products → Add data source → scheduled fetch of `https://www.diecastheavenudaipur.in/feeds/google.xml` (daily). Turn on "automatic item updates" so price and availability sync from the structured data.
5. Enable free listings (Google & YouTube surfaces).

Leading indicator: Merchant Center → Performance shows impressions on free listings within 1–3 weeks of approval.

### 1.7 Checkout decision (owner)

Google's checkout requirement says customers must be able to add in-stock products to the cart and finalize their purchase on the site. The current flow finishes in WhatsApp with no payment. Options:
- **A, recommended:** add online payment at cart checkout (Razorpay or UPI payment link) while keeping WhatsApp as an alternative. This gives full eligibility for online free listings and Shopping ads.
- **B:** stay WhatsApp-only and accept the risk of "landing page / checkout" disapprovals for online listings. Rely on free local listings (Phase 3.1), which target in-store availability.

## Phase 2: Match quality and content (Weeks 2–4)

| # | Task | Files | Done when | Leading indicator |
|---|---|---|---|---|
| 2.1 | Rewrite product names with the formula **Brand + Line/Series + Model + (Colour) + Scale + "Die-Cast Car"**. Example: "TWIN TAGS" → "Hot Wheels Twin Tags – 2025 Mainline 1:64 Die-Cast Car". Fix ALL CAPS and stray quotes. Keep slugs stable (or 301 old → new). | admin data | 0 ALL-CAPS names; 0 names under 4 words | GSC queries containing model names gain impressions |
| 2.2 | Descriptions: 60–150 unique words per product, plus an auto-rendered specs list (brand, series, year, scale, colour, packaging/card condition, GTIN). Start with the top 50 products by views, using the `analytics_events` table you already have. | `product/[slug]/page.tsx` (specs list), admin | Products with descriptions under 50 words drops from 58% to under 20% | Product-page clicks in GSC |
| 2.3 | Meta description template: model + scale + price + "In stock at Udaipur store · pan-India shipping". | `product/[slug]/page.tsx` `generateMetadata` | 0 pages where meta description = title | CTR in GSC |
| 2.4 | Images: 3+ per product; main image clean, with no text overlay; upload filenames from the slug. | `app/api/admin/upload/route.ts` (filename), admin | 8% → 60%+ multi-image | Merchant Center image warnings = 0 |
| 2.5 | Brand and category landing pages: `/brand/[slug]` and `/category/[slug]`, each with an H1 ("Hot Wheels Cars – Udaipur & Pan-India"), 100–200 words of intro, crawlable product grid + `<a>` pagination, BreadcrumbList, and inclusion in the sitemap. Point the header/home brand links here. | new routes, `sitemap.ts`, `header.tsx`, `page.tsx` | Pages indexed in GSC | Rankings for "hot wheels udaipur", "majorette cars india" |
| 2.6 | Crawlable catalog pagination: render `?page=N` on the server and add `<a rel="next">`-style links under the infinite scroll. | `catalog/page.tsx`, `product-grid.tsx` | Every product reachable via HTML links within 3 clicks | GSC "Discovered – not indexed" count falls |
| 2.7 | Homepage title/description + default `og:image`. | `app/layout.tsx`, `(public)/layout.tsx` | Title contains "Udaipur" + "Hot Wheels"/"diecast" | Brand + local query impressions |

## Phase 3: Local, speed, monitoring (Month 2)

| # | Task | Done when | Leading indicator |
|---|---|---|---|
| 3.1 | Link the Google Business Profile to Merchant Center and enable free local listings (India supported). Use "See what's in store". Mark in-store availability. | The GBP shows a "See what's in store" products module | Local listing impressions in Merchant Center |
| 3.2 | Replace `force-dynamic` with ISR (`export const revalidate = 3600`) on home, product, about and contact pages. The existing `revalidateTag('products')` calls refresh pages after admin edits. Keep catalog search dynamic. | Product pages return `x-vercel-cache: HIT` and no `no-store` | TTFB p90 under 300 ms (was 668 ms) |
| 3.3 | Run CWV with a PSI API key (`pagespeed_check.py --strategy both`); fix LCP/INP if over thresholds (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1). | Mobile Lighthouse ≥ 90 | CrUX "good" share |
| 3.4 | Reviews: collect genuine reviews (GBP first). Add `aggregateRating` markup only for real, on-site reviews. | n/a | Review count |
| 3.5 | Baseline for drift monitoring after Phase 1: `drift_baseline.py https://www.diecastheavenudaipur.in`; re-compare monthly. | Baseline stored | Drift report shows no regressions |

## Owner inputs needed

1. Search Console, Business Profile and Merchant Center access (or confirmation that they don't exist yet).
2. Real shipping policy: rates, free-shipping threshold, handling and transit days. Return/refund policy, including pre-order deposits.
3. Checkout choice: Option A (online payment) or B (WhatsApp only).
4. Whether `stock` counts are kept accurate (decides whether availability can use them).
5. Staff time to scan GTINs into admin (about 239 products).

## Expected timeline (not guaranteed; Google decides eligibility and ranking)

- Week 1–2 after Phase 0 + 1.3: product rich results (price, availability) can start appearing on organic results.
- 1–3 weeks after Merchant Center approval: free listings in the Shopping tab and product panels; offers with matching GTINs can be grouped with other sellers.
- Month 2+: brand/category pages and description work compound into broader query coverage.
