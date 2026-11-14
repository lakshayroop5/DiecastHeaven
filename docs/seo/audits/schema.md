# Structured Data (Schema.org / JSON-LD) — Design & Audit

**Site:** https://www.diecastheavenudaipur.in (canonical host `www`; apex 308-redirects)
**Stack:** Next.js 14.2.35 App Router, TypeScript, Prisma + libSQL, React 18. No zod. Currency INR.
**Prepared:** 2026-11-12
**Scope:** this document designs and audits JSON-LD only. It does not change product copy, canonicals or the sitemap.

---

## 0. Method and evidence

Everything below is grounded in one of four sources. No product value, price, URL or Google policy sentence in this report was written from memory.

| Evidence | What was done |
|---|---|
| Live HTML | `curl` of `/product/*` pages, `/catalog`, `/about`, `/sitemap.xml`, `/robots.txt` (12 Nov 2026) |
| RSC payload | The product record is serialised into the page's `self.__next_f` flight data; the exact Prisma row (price, offerPrice, status, orderType, depositAmount, brand, categories, images) was read out of it |
| Source | `prisma/schema.prisma`, `lib/types.ts`, `lib/queries.ts`, `lib/seo/*`, `app/**` |
| Google docs | Fetched `developers.google.com/search/docs/appearance/structured-data/{product,product-snippet,merchant-listing,return-policy,shipping-policy}` and the Search changelog. Quoted text is copied verbatim from those fetches |

### 0.1 Two different "current states" — read this first

| | Deployed (origin/main) | Working tree (uncommitted) |
|---|---|---|
| Product JSON-LD | **0 blocks** (verified: `application/ld+json` count = 0 on 3 product pages) | `lib/seo/schema.ts` + `components/seo/json-ld.tsx` exist; `productSchema` + `breadcrumbSchema` rendered on `/product/[slug]` |
| Site graph | none | `siteGraphSchema()` (Organization + Store + WebSite) in `app/layout.tsx:84` |
| Canonical | none (`rel="canonical"` absent) | `alternates.canonical` in product/catalog metadata |
| Sitemap | all 225 URLs are `http://localhost:3000/...` | rewritten to `SITE_URL` |

**Operational consequence:** the audit findings in this report describe the *deployed* site (zero markup, no canonical, localhost sitemap). The payloads in §2 are written against the working-tree builders, and every gap between them is listed in §5 with a patch. Do not re-implement `lib/seo/schema.ts` from scratch — it already exists and only needs the corrections in §5.3.

### 0.2 Verified facts used throughout

- 225 sitemap URLs = 222 products + `/`, `/catalog`, `/about`. Every `<loc>` host is `localhost:3000` (verified).
- SOLD_OUT products are served 200 **and** listed in the sitemap (verified: `kick-sauber-f1-team-5-2025-`).
- All sampled image rows are absolute Vercel Blob URLs; `altText` is `null` on every one (verified, 24 rows).
- Branches: `/brands` and `/contact` return **404 live**. `app/(public)/brands/` and `/categories/` exist only in the working tree.
- Live navigation/footer link to `/brands` and `/contact` → both 404.
- Actual live categories are **5**, not the 13 in the project brief: `AS SINGLE`, `COLLECTABLE`, `FANTASY`, `IMPORTED`, `MAINLINE COMBO`.
- Actual live brands observed: `CCA`, `HOTWHEELS`, `HOTWHEELS PREMIUM`, `INNO 64`, `KINSMART`, `LCD`, `MAJORETTE`, `MATCHBOX`, `POP RACE`.
- `stock` is `0` on every sampled product and is not maintained; `status` + `orderType` are the real selling signals.
- There is no GTIN, MPN, SKU, condition, weight or dimension column in `prisma/schema.prisma`.
- No `Review` / `AggregateRating` model exists → any rating markup would be fabricated.
- No `/returns`, `/shipping` or `/faq` route (all 404 live) → no published return or shipping policy.

---

## 1. Summary table

| # | Type | Route | Purpose | Priority |
|---|---|---|---|---|
| 1 | `Product` + `Offer` | `/product/[slug]` (222 URLs) | Only markup that can win a shopping surface; declares price, availability, brand, identifiers | **Critical** |
| 2 | `BreadcrumbList` | `/product/[slug]` | Replaces the URL in the SERP with `Home › Catalog › Brand › Product`; hardens site hierarchy | **High** |
| 3 | `Organization` (+ `Store`) | site-wide (`app/layout.tsx`) | Entity home: name, logo, phone, address, `@id` for every `seller` reference | **High** |
| 4 | `WebSite` (+ `SearchAction`) | site-wide (`app/layout.tsx`) | Site-name entity; `SearchAction` is informational only (feature retired, §4.4) | **Medium** |
| 5 | `ItemList` | `/catalog`, `/brands/[slug]`, `/categories/[slug]` | Describes the visible product set; no Google rich result, entity value only | **Low** |
| 6 | `ImageObject` | `/product/[slug]` `image` | Caption from `altText`/title; enables per-image metadata in Google Images | **Low** |
| 7 | `MerchantReturnPolicy` / `OfferShippingDetails` | blocked | Would unlock merchant-listing enhancements; **cannot be told truthfully today** (§4.3) | **Blocked** |
| 8 | `Review` / `AggregateRating` | — | Do not add. No review data exists. | **Do not build** |

Priority follows the team's scale: Critical = blocks a feature or ships wrong data; High = significant SERP/entity impact within a week; Medium = within a month; Low = backlog; Blocked = needs a business decision first.

---

## 2. Payloads, populated with real data

Three real products were pulled from the live site and their Prisma rows read out of the RSC flight payload. They were chosen because between them they hit every branch the builder has: discount + PRE_ORDER + no brand + no scale + no description, SOLD_OUT + brand + scale + long description, and `price = null` + two categories.

| Alias | URL | price | offerPrice | status | orderType | deposit | brand | scale | categories | images |
|---|---|---|---|---|---|---|---|---|---|---|
| **A. Porsche** | `/product/porsche-911-gt3-r-2026-gt-world-challenge-asia-mandalika` | 3499 | 2799 | PUBLISHED | PRE_ORDER | 199 | `null` | `null` | COLLECTABLE | 2 |
| **B. Sauber** | `/product/kick-sauber-f1-team-5-2025-` | 999 | 749 | SOLD_OUT | RTD | `null` | HOTWHEELS PREMIUM | 1:64 | COLLECTABLE | 1 |
| **C. Civic** | `/product/-24-honda-civic-type-r-team-transport-hw-legend-tour-` | `null` | 1399 | PUBLISHED | RTD | `null` | HOTWHEELS PREMIUM | `null` | COLLECTABLE, AS SINGLE | 1 |

### 2.1 `Product` + `Offer` — product A (Porsche)

**Real record** (verbatim from the flight payload of that page):

```
title:      "Porsche 911 GT3 R 2026 GT World Challenge Asia Mandalika"
slug:       "porsche-911-gt3-r-2026-gt-world-challenge-asia-mandalika"
description: null
shortDesc:  "Porsche 911 GT3 R 2026 GT World Challenge Asia Mandalika"   ← identical to the title
scale: null, price: 3499, offerPrice: 2799, status: "PUBLISHED",
orderType: "PRE_ORDER", depositAmount: 199, brandId: null, stock: 0
images: ["https://1hcggaciljsuxuel.public.blob.vercel-storage.com/products/1793784550915-img-0749.png",
         "https://1hcggaciljsuxuel.public.blob.vercel-storage.com/products/1793784550782-img-0750.png"]
```

**What the current builder emits** (executed with `npx tsx` against `lib/seo/schema.ts`, real values):

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://www.diecastheavenudaipur.in/product/porsche-911-gt3-r-2026-gt-world-challenge-asia-mandalika#product",
  "name": "Porsche 911 GT3 R 2026 GT World Challenge Asia Mandalika",
  "url": "https://www.diecastheavenudaipur.in/product/porsche-911-gt3-r-2026-gt-world-challenge-asia-mandalika",
  "sku": "porsche-911-gt3-r-2026-gt-world-challenge-asia-mandalika",
  "description": "Porsche 911 GT3 R 2026 GT World Challenge Asia Mandalika",
  "image": [
    "https://1hcggaciljsuxuel.public.blob.vercel-storage.com/products/1793784550915-img-0749.png",
    "https://1hcggaciljsuxuel.public.blob.vercel-storage.com/products/1793784550782-img-0750.png"
  ],
  "category": "COLLECTABLE",
  "itemCondition": "https://schema.org/NewCondition",
  "offers": {
    "@type": "Offer",
    "@id": "https://www.diecastheavenudaipur.in/product/porsche-911-gt3-r-2026-gt-world-challenge-asia-mandalika#offer",
    "url": "https://www.diecastheavenudaipur.in/product/porsche-911-gt3-r-2026-gt-world-challenge-asia-mandalika",
    "price": 2799,
    "priceCurrency": "INR",
    "availability": "https://schema.org/PreOrder",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@id": "https://www.diecastheavenudaipur.in/#organization" },
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": 3499,
      "priceCurrency": "INR",
      "priceType": "https://schema.org/ListPrice"
    }
  }
}
```

Four defects visible in that output:

1. `priceType: "https://schema.org/ListPrice"` — Google supports **only** `StrikethroughPrice`. Verbatim from the merchant-listing doc: *"You must set the priceType to the https://schema.org/StrikethroughPrice value (no other values are supported)."* → fix in §5.3 (F2).
2. `description` equals `name` verbatim — zero information, and the same string is the meta description (the site-wide thin-content fault). Omit it (§5.3, F4).
3. `itemCondition` sits on `Product`. Google documents `itemCondition` under **Offer details** only; at Product level it is ignored. Harmless but noise → keep it on `Offer` only (F5).
4. `sku` is the slug. Six sampled slugs carry leading/trailing hyphens (`-24-honda-civic-...-`). Slug is legal (ASCII, no whitespace) but it is a URL, not an inventory key — a retitle changes it. Use `product.id` (F1).

**Target payload** (what shipped markup should look like for this page):

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://www.diecastheavenudaipur.in/product/porsche-911-gt3-r-2026-gt-world-challenge-asia-mandalika#product",
  "name": "Porsche 911 GT3 R 2026 GT World Challenge Asia Mandalika",
  "url": "https://www.diecastheavenudaipur.in/product/porsche-911-gt3-r-2026-gt-world-challenge-asia-mandalika",
  "sku": "cmw1x0fpz0001z1mq2i5kmor2",
  "image": [
    {
      "@type": "ImageObject",
      "contentUrl": "https://1hcggaciljsuxuel.public.blob.vercel-storage.com/products/1793784550915-img-0749.png",
      "caption": "Porsche 911 GT3 R 2026 GT World Challenge Asia Mandalika"
    },
    {
      "@type": "ImageObject",
      "contentUrl": "https://1hcggaciljsuxuel.public.blob.vercel-storage.com/products/1793784550782-img-0750.png",
      "caption": "Porsche 911 GT3 R 2026 GT World Challenge Asia Mandalika"
    }
  ],
  "category": ["COLLECTABLE"],
  "offers": {
    "@type": "Offer",
    "@id": "https://www.diecastheavenudaipur.in/product/porsche-911-gt3-r-2026-gt-world-challenge-asia-mandalika#offer",
    "url": "https://www.diecastheavenudaipur.in/product/porsche-911-gt3-r-2026-gt-world-challenge-asia-mandalika",
    "price": 2799,
    "priceCurrency": "INR",
    "availability": "https://schema.org/PreOrder",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@id": "https://www.diecastheavenudaipur.in/#organization" },
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": 3499,
      "priceCurrency": "INR",
      "priceType": "https://schema.org/StrikethroughPrice"
    }
  }
}
```

Notes on the deliberate omissions:

- **No `brand`** — `brandId` is `null` on this row. A wrong or guessed brand is worse than none; `brand.name` is a *recommended*, not required, property.
- **No `description`** — the only candidate text is the title. Omitted rather than duplicated (see §3, row 11).
- **No `additionalProperty`** — `scale` is `null`.
- **No `priceValidUntil`** — the price has no end date in the database. Google only drops a listing when `priceValidUntil` is in the *past*, so omitting is safe and truthful; fabricating "now + 1 year" is not (§3, row 12).
- **`price` = 2799, not 3499** — the customer pays the offer price. 3499 is carried as the strikethrough list price, which is exactly what the page renders (`₹2,799` bold, `₹3,499` struck through, `20% off`).
- **`availability: PreOrder`** — real `orderType`. The page renders `Reserve Now` + "Pay ₹199 deposit now" for this row.

### 2.2 `Product` + `Offer` — product B (Sauber, SOLD_OUT)

Real description (verbatim from the page body, HTML-unescaped):

> Experience Formula 1 in premium 1:64 scale with the Hot Wheels Premium Kick Sauber F1® Team #5 (2025). Featuring a full metal body and chassis, authentic team livery, and Real Riders rubber tires, this collectible is a must-have for Formula 1 and diecast enthusiasts. / Driver Information – Car #5 / Driver: Gabriel Bortoleto / Car Number: #5 / Nationality: Brazilian 🇧🇷 / Team: Kick Sauber F1® Team / Known For: … / Features / Premium Hot Wheels release / Metal body & metal chassis / Real Riders rubber tires / Official Kick Sauber F1® Team livery / Collector-grade blister packaging / Approximate Scale: 1:64

This is the "good" case: a real description, a real brand, a real scale, and `SOLD_OUT` — which the site still serves 200 and still lists in the sitemap.

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://www.diecastheavenudaipur.in/product/kick-sauber-f1-team-5-2025-#product",
  "name": "Kick Sauber F1® Team #5 (2025)",
  "url": "https://www.diecastheavenudaipur.in/product/kick-sauber-f1-team-5-2025-",
  "sku": "cmrd53qwh0001xy0pjkyeo937",
  "description": "Experience Formula 1 in premium 1:64 scale with the Hot Wheels Premium Kick Sauber F1® Team #5 (2025). Featuring a full metal body and chassis, authentic team livery, and Real Riders rubber tires, this collectible is a must-have for Formula 1 and diecast enthusiasts.",
  "image": [
    {
      "@type": "ImageObject",
      "contentUrl": "https://1hcggaciljsuxuel.public.blob.vercel-storage.com/products/1783579355927-img-2185.jpeg",
      "caption": "Kick Sauber F1® Team #5 (2025)"
    }
  ],
  "brand": { "@type": "Brand", "name": "HOTWHEELS PREMIUM" },
  "category": ["COLLECTABLE"],
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "Scale", "value": "1:64" }
  ],
  "offers": {
    "@type": "Offer",
    "@id": "https://www.diecastheavenudaipur.in/product/kick-sauber-f1-team-5-2025-#offer",
    "url": "https://www.diecastheavenudaipur.in/product/kick-sauber-f1-team-5-2025-",
    "price": 749,
    "priceCurrency": "INR",
    "availability": "https://schema.org/SoldOut",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@id": "https://www.diecastheavenudaipur.in/#organization" },
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": 999,
      "priceCurrency": "INR",
      "priceType": "https://schema.org/StrikethroughPrice"
    }
  }
}
```

Deliberate details:

- `availability: SoldOut` — one of the ten values Google lists for `Offer.availability` (verbatim list in §4.2). It is the truthful value; `OutOfStock` would understate (this item is not restocking, it sold).
- The `@id` and `url` end in `-#product` / `-` because the real slug does (`kick-sauber-f1-team-5-2025-`). Do **not** "clean" the slug in markup — the canonical URL contains the hyphen. Fix the slug generator separately, with a redirect plan, not in JSON-LD.
- `brand.name` is `HOTWHEELS PREMIUM` — the merchandising brand as stored, not "Hot Wheels". Markup must match the page's brand badge, which renders the same string.
- Description is truncated at the first sentence for length, but it is a **contiguous prefix** of the page text, not a paraphrase. Google's guidance is that markup must represent the page content; a prefix satisfies that, invented copy does not.

### 2.3 `Product` + `Offer` — product C (Civic, `price = null`)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://www.diecastheavenudaipur.in/product/-24-honda-civic-type-r-team-transport-hw-legend-tour-#product",
  "name": "'24 HONDA CIVIC TYPE R Team Transport ( HW Legend Tour )",
  "url": "https://www.diecastheavenudaipur.in/product/-24-honda-civic-type-r-team-transport-hw-legend-tour-",
  "sku": "cmsflv9sz0001rrnnkwv3mrx8",
  "image": [
    {
      "@type": "ImageObject",
      "contentUrl": "https://1hcggaciljsuxuel.public.blob.vercel-storage.com/products/1785905105403-img-3723.jpeg",
      "caption": "'24 HONDA CIVIC TYPE R Team Transport ( HW Legend Tour )"
    }
  ],
  "brand": { "@type": "Brand", "name": "HOTWHEELS PREMIUM" },
  "category": ["COLLECTABLE", "AS SINGLE"],
  "offers": {
    "@type": "Offer",
    "@id": "https://www.diecastheavenudaipur.in/product/-24-honda-civic-type-r-team-transport-hw-legend-tour-#offer",
    "url": "https://www.diecastheavenudaipur.in/product/-24-honda-civic-type-r-team-transport-hw-legend-tour-",
    "price": 1399,
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@id": "https://www.diecastheavenudaipur.in/#organization" }
  }
}
```

Why this row matters:

- `price` is `null` but `offerPrice` is `1399`. The price a shopper sees is `₹1,399`, so `price` must be **1399**. A naive `price ?? offerPrice` and a `offerPrice < price` discount branch both break here (`null < 1399` is `false` in JS-less-than semantics on `null`, so no strikethrough is correct — there is none on the page).
- `category` is an **array of two**. The current builder joins them into the string `"COLLECTABLE > AS SINGLE"`, which asserts a parent/child taxonomy that does not exist: these are two independent tags. Google accepts `Text` or an array of `Text`; it does not need `>`.
- `description` was omitted even though the DB has text (`"'24 HONDA CIVIC TYPE R Team Transport ( HW Legend Tour )"`) because it is byte-identical to `name`.
- No `additionalProperty` (`scale` null), no `priceSpecification` (no strikethrough on the page).

### 2.4 `BreadcrumbList` — `/product/[slug]`

The visible nav on the live page is `Home / Catalog / {title}`. The working tree added the brand level (`app/(public)/product/[slug]/page.tsx:206-223`) and the trail now mirrors the UI. Real trail for product B:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.diecastheavenudaipur.in/" },
    { "@type": "ListItem", "position": 2, "name": "Catalog", "item": "https://www.diecastheavenudaipur.in/catalog" },
    { "@type": "ListItem", "position": 3, "name": "HOTWHEELS PREMIUM", "item": "https://www.diecastheavenudaipur.in/brands/hotwheels-premium" },
    { "@type": "ListItem", "position": 4, "name": "Kick Sauber F1® Team #5 (2025)", "item": "https://www.diecastheavenudaipur.in/product/kick-sauber-f1-team-5-2025-" }
  ]
}
```

Rules enforced by the builder:

- Position is 1-based and contiguous.
- Every `item` is absolute (relative URLs are a documented validation fault).
- The last item may omit `item`; we include it because the URL is known and it costs nothing.
- **Deploy-order hazard:** `/brands/hotwheels-premium` returns 404 on the deployed site today. A breadcrumb that points at a 404 is worse than a 3-level trail — ship `app/(public)/brands/**` in the same release as this markup, or drop the brand crumb. Verified: `curl -o /dev/null -w '%{http_code}' https://www.diecastheavenudaipur.in/brands` → `404`.

### 2.5 `Organization` (+ `Store`) — site-wide, one `@graph`

Current working-tree output (executed, real values), trimmed to the entity fields:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.diecastheavenudaipur.in/#organization",
      "name": "Diecast Heaven Udaipur",
      "legalName": "Diecast Heaven Udaipur",
      "url": "https://www.diecastheavenudaipur.in",
      "description": "Diecast Heaven Udaipur is an Indian retailer of premium diecast collector cars — Hot Wheels, Hot Wheels Premium, Hot Wheels Silver Series, Majorette, Matchbox, Bburago, Tomica, Tarmac Works and Pop Race — shipping across India.",
      "logo": { "@type": "ImageObject", "url": "https://www.diecastheavenudaipur.in/diecast-heaven-logo.png" },
      "image": "https://www.diecastheavenudaipur.in/diecast-heaven-logo.png",
      "telephone": "+919****4984",
      "address": { "@type": "PostalAddress", "addressLocality": "Udaipur", "addressRegion": "Rajasthan", "addressCountry": "IN" },
      "contactPoint": [
        { "@type": "ContactPoint", "contactType": "sales", "telephone": "+919****4984", "areaServed": "IN", "availableLanguage": ["en", "hi"] }
      ]
    },
    {
      "@type": "Store",
      "@id": "https://www.diecastheavenudaipur.in/#store",
      "name": "Diecast Heaven Udaipur",
      "url": "https://www.diecastheavenudaipur.in",
      "image": "https://www.diecastheavenudaipur.in/diecast-heaven-logo.png",
      "telephone": "+919****4984",
      "address": { "@type": "PostalAddress", "addressLocality": "Udaipur", "addressRegion": "Rajasthan", "addressCountry": "IN" },
      "areaServed": { "@type": "Country", "name": "India" },
      "openingHours": ["Mo-Sa 10:00-20:00", "Su 10:00-18:00"],
      "currenciesAccepted": "INR",
      "parentOrganization": { "@id": "https://www.diecastheavenudaipur.in/#organization" }
    },
    { "@type": "WebSite", "...": "see 2.6" }
  ]
}
```

**Blocker found by execution: `telephone` is literally `+919****4984`.** The masked placeholder from `lib/seo/site.ts:51` is being shipped into production JSON-LD. It is not a phone number; it will fail Rich Results Test as a malformed value and it destroys the one machine-readable NAP signal the business has. The real number is `+919079674984` — verified from the rendered WhatsApp links (`wa.me/919079674984`, 3 occurrences on a product page).

Target shape for the Organization node:

```json
{
  "@type": ["Organization", "Store"],
  "@id": "https://www.diecastheavenudaipur.in/#organization",
  "name": "Diecast Heaven Udaipur",
  "alternateName": "Diecast Heaven",
  "url": "https://www.diecastheavenudaipur.in",
  "logo": { "@type": "ImageObject", "url": "https://www.diecastheavenudaipur.in/diecast-heaven-logo.png", "width": 512, "height": 512 },
  "image": "https://www.diecastheavenudaipur.in/diecast-heaven-logo.png",
  "telephone": "+919079674984",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "<REQUIRED FROM BUSINESS>",
    "addressLocality": "Udaipur",
    "addressRegion": "Rajasthan",
    "postalCode": "<REQUIRED FROM BUSINESS>",
    "addressCountry": "IN"
  },
  "areaServed": { "@type": "Country", "name": "India" },
  "contactPoint": [
    { "@type": "ContactPoint", "contactType": "sales", "telephone": "+919079674984", "areaServed": "IN", "availableLanguage": ["en", "hi"] },
    { "@type": "ContactPoint", "contactType": "customer support", "url": "https://wa.me/919079674984", "areaServed": "IN", "availableLanguage": ["en", "hi"] }
  ],
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "10:00", "closes": "20:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "10:00", "closes": "18:00" }
  ],
  "currenciesAccepted": "INR"
}
```

`paymentAccepted` is deliberately absent: the site exposes no payment methods (no checkout), so any value would be invented. Add it only from a confirmed business answer. Same for `geo` (needs surveyed coordinates, not a geocode guess) and `sameAs`.

#### Argument: `Organization` alone, or `Organization` + `Store`?

Recommendation: **one node, co-typed `["Organization", "Store"]`**, and only once a real street address exists. Reasoning, in order:

1. **Two nodes for one business splits the entity.** Today the graph ships `Organization` and `Store` with the same name, same phone, same partial address, different `@id`s, linked by `parentOrganization`. Google has to decide whether these are one business or a parent company with a subsidiary store. One node with two types removes the ambiguity and matches schema.org's design (`Store` *is a* `LocalBusiness` *is an* `Organization`).
2. **`Store` is a claim about the physical world.** `Store` means a place people can walk into. `BUSINESS.address.streetAddress` and `postalCode` are `null` (`lib/seo/site.ts:55,58`) and there is no `geo`. An address of "Udaipur, Rajasthan, IN" is a city, not a location. If the business is a warehouse/WhatsApp operation with no walk-in counter, `LocalBusiness` is a false claim and Google's local entity pipeline will not verify it anyway.
3. **What it buys you.** A complete `LocalBusiness`/`Store` node is a precondition for local-pack and knowledge-panel associations, and it is where Google wants `hasMerchantReturnPolicy` and `hasShippingService` attached (both docs explicitly say *"We recommend you provide a global return policy for your business under Organization markup instead"*). Those policies are exactly what this site cannot state (§4.3) — so the local node has no policy payload to carry either.
4. **Decision rule.** If the business confirms a walk-in shop: co-typed node with `streetAddress`, `postalCode`, and `geo` (both verified from the business, not guessed). If it is online-only: `Organization` only, and delete the `Store` node — keeping it is unverifiable markup.

Missing today and worth adding once known: `sameAs` (empty array in `lib/seo/site.ts:66` — no social profiles exist yet), `email` (null), `foundingDate`, `vatID`/`GSTIN` (India; useful for the organisation identity if they register with Google).

### 2.6 `WebSite` + `SearchAction`

```json
{
  "@type": "WebSite",
  "@id": "https://www.diecastheavenudaipur.in/#website",
  "url": "https://www.diecastheavenudaipur.in",
  "name": "Diecast Heaven Udaipur",
  "inLanguage": "en-IN",
  "publisher": { "@id": "https://www.diecastheavenudaipur.in/#organization" },
  "potentialAction": {
    "@type": "SearchAction",
    "target": { "@type": "EntryPoint", "urlTemplate": "https://www.diecastheavenudaipur.in/catalog?search={search_term_string}" },
    "query-input": "required name=search_term_string"
  }
}
```

Two honest caveats:

- The `SearchAction` no longer produces anything. Google's changelog, **November 29 2024**: *"Removing sitelinks search box documentation … The sitelinks search box feature is no longer available in Google Search results."* The `target` does work (`/catalog?search=` is a real, honoured parameter — `app/(public)/catalog/page.tsx:35`), and the markup is valid, so it is harmless. Keep it for entity completeness; do not schedule work for it and do not promise a SERP feature.
- The `WebSite` node itself still matters: `name` is how Google associates a site-name string with the domain, and `publisher` ties the site to the brand entity. That is the reason to ship it, not the search box.

### 2.7 `ItemList` — `/catalog` (+ `/brands/[slug]`, `/categories/[slug]`)

Real, from the live catalogue's first server-rendered batch (`PAGE_SIZE = 12`, `lib/queries.ts:186`):

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": "https://www.diecastheavenudaipur.in/catalog#itemlist",
  "name": "Diecast cars catalog",
  "numberOfItems": 12,
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "url": "https://www.diecastheavenudaipur.in/product/majorette-motorsport-dtm-deluxe-cars-set-of-6-no-single-free-shipping-", "name": "Majorette Motorsport DTM Deluxe Cars Set of 6 ( no single ) - FREE SHIPPING" },
    { "@type": "ListItem", "position": 2, "url": "https://www.diecastheavenudaipur.in/product/porsche-911-gt3-r-2026-gt-world-challenge-asia-mandalika", "name": "Porsche 911 GT3 R 2026 GT World Challenge Asia Mandalika" }
  ]
}
```

Rules:

- `numberOfItems` **must equal the number of `ListItem`s actually emitted** (12), never the catalogue total (222). The page loads more by infinite scroll; Google's guidance is that markup must describe what is in the HTML.
- Emit `url` + `name`; do not inline full `Product` nodes into the list — that reintroduces offers and availability for items the crawler may never scroll to, and invites a price mismatch.
- No Google rich result exists for `ItemList` on a category page, so this is **Low** priority: it is entity context, not a SERP feature.
- `/catalog?search=` is `noindex` (`catalog/page.tsx:35`), so its `ItemList` is never consumed — fine, but do not spend effort there.

### 2.8 `ImageObject`

Every live image row has `altText: null`, so the only truthful caption is the product title. Use `ImageObject` (not bare URL strings) only because it lets you attach `caption`; do not invent `width`/`height`/`encodingFormat` (unknown for blob-hosted files).

```json
{ "@type": "ImageObject", "contentUrl": "<absolute blob URL>", "caption": "<product title>" }
```

Bare-string `image` is equally valid to Google and shorter. Either is fine; the array must be absolute and crawlable (see §3, row 6).

---

## 3. Edge-case decision table

Every row is a branch that exists in this data, with the decision the builder must implement.

| # | Case | Reality on this site | Decision | Reason (one line) |
|---|---|---|---|---|
| 1 | **SOLD_OUT product** | Served 200 and listed in the sitemap (verified `kick-sauber-f1-team-5-2025-`); `AddToCart` hidden, `Inquire` shown | Keep full `Product` + `Offer` with `availability: SoldOut`; keep it indexable and keep it in the sitemap | It is the truthful state, `SoldOut` is a documented `availability` value, and the page still converts via WhatsApp enquiry |
| 2 | **PRE_ORDER + depositAmount** | Porsche: price 3499, offer 2799, deposit 199. Majorette: price 3894, deposit **3894** (deposit = full price) | `availability: PreOrder`; `price` = the full selling price (2799 / 3894). **Never** emit the deposit as `price` | `price` is what the product costs; a deposit is a payment term, and shrinking it to ₹199 misstates the price Google shows |
| 3 | **`price == null`** | 1 of 3 sampled rows (Civic: `price` null, `offerPrice` 1399). The brief's "Price TBD" does not exist in the UI — the price block renders nothing when both are null (`product/[slug]/page.tsx:272-295`) | Still emit an `Offer`, using `offerPrice` as `price`. If **both** are null → emit no `offers` at all | No `offers` = not merchant-eligible but still valid `Product`; a fake or zero price is a policy violation |
| 4 | **`offerPrice < price`** | Porsche 2799 < 3499; Sauber 749 < 999 | `price` = offerPrice, list price in `priceSpecification` with `priceType: StrikethroughPrice` (not `ListPrice`) | `StrikethroughPrice` is the only `priceType` Google supports, and it mirrors the strikethrough the page actually renders |
| 5 | **Zero images** | Not present in the 3 sampled rows, but reachable (images are a separate table) | Emit `Product` **without** `image`; do **not** substitute the site logo; skip the product in the merchant feed | `image` is required for merchant listing and for product rich results, so the honest outcome is "not eligible", not "eligible with a wrong photo" |
| 6 | **Relative `/products/*.jpeg`** | Not in the sampled rows (all 24 image rows were Blob URLs), but the code path exists: `absoluteUrl('/products/x.jpeg')` → `https://www.diecastheavenudaipur.in/products/x.jpeg`, which returns **404** today (verified) | Emit only `http(s)` absolute URLs; drop any root-relative image from `image` and from the feed | Google requires crawlable, indexable image URLs; a 404 in `image` is a hard validation error |
| 7 | **Missing GTIN/MPN** | No such columns in `prisma/schema.prisma`; titles carry manufacturer codes (`LCD64039-WB`) that are not modelled | `sku` = `product.id` (cuid). No `gtin`, no `mpn`. Feed keeps `identifier_exists=no` | Inventing a GTIN/MPN is a misrepresentation Google actively verifies; a merchant-assigned `sku` is honest |
| 8 | **Missing brand** | Porsche row has `brandId: null`; brand badge is absent from the page | Omit `brand` entirely | `brand.name` is recommended, optional, and a guessed brand contradicts the page |
| 9 | **Missing categories** | Possible (join table is empty-able) | Omit `category` | Optional property; an empty array is invalid, so omit rather than emit `[]` |
| 10 | **Multiple categories** | Civic: `COLLECTABLE` + `AS SINGLE` (independent tags, not a hierarchy) | Emit an **array** of strings | `"COLLECTABLE > AS SINGLE"` asserts a taxonomy that does not exist |
| 11 | **Description == title** | Porsche and Civic `shortDesc`/`description` are byte-identical to `title` | Omit `description`; if a real description exists, use it unaltered | A description equal to the name adds no signal and Google already has the name; duplicated text is a thin-content tell |
| 12 | **No sale end date** | No `priceValidUntil`-style column exists | Omit `priceValidUntil` today; add an `offerEndsAt` column, then emit it | A missing `priceValidUntil` means "no end date" (true); a fabricated future date is a false claim, and a stale past date silently drops the listing |
| 13 | **`stock` field** | `stock` is `0` on every sampled row and is not maintained | Never map `stock` → `availability`; derive from `status` + `orderType` | `InStock` from `stock > 0` would mark the entire catalogue out of stock, which is the opposite of the truth |
| 14 | **`offerPrice`/`price` = 0** | Not observed, but a price of `0` is accepted by the `Float?` column | Treat `<= 0` as "no price" → no `offers` | Merchant listings require a price greater than zero (verbatim, §4.2) |
| 15 | **Used / damaged stock** | No condition column exists; the site sells new sealed models | Hardcode `NewCondition` for now, and add a `condition` column before any pre-owned listing | If used stock is ever listed, `NewCondition` becomes a false claim with no way to express the truth |

---

## 4. Merchant listing vs plain organic

This is the part that decides what the markup can actually win. It was written from five fetched Google documents, quoted below with their URLs. Nothing here is from memory.

### 4.1 The two product features are not the same thing

Source: <https://developers.google.com/search/docs/appearance/structured-data/product> (fetched; page footer reads "Last updated 2025-12-10 UTC").

> "**Product snippets**: For product pages where people can't directly purchase the product."
> "**Merchant listings**: For pages where customers can purchase products from you. This markup has more options for specifying detailed product information, like apparel sizing, shipping details, and return policy information."
> "In general, adding the required product information properties for merchant listings means that your product pages can also be eligible for product snippets."

So: merchant listing is the superset. Every property added for merchant listing also feeds snippets. The reverse is not true.

### 4.2 Required vs recommended — the exact lists

**`Product`** — source: <https://developers.google.com/search/docs/appearance/structured-data/merchant-listing>

| Status | Property | This site |
|---|---|---|
| **Required** | `name` | ✅ `product.title` |
| **Required** | `image` (repeated `ImageObject` or `URL`) | ✅ 1–2 Blob URLs per row |
| **Required** | `offers` (`Offer`; merchant listings **require** `Offer`, not `AggregateOffer`) | ✅ / ⚠️ omitted when price is null |
| Recommended | `brand.name` | ⚠️ null on some rows |
| Recommended | `category` (`Text`/`CategoryCode`, arrays allowed) | ✅ |
| Recommended | `description` | ⚠️ frequently identical to `name` |
| Recommended | `sku` | ✅ (slug today, `id` after F1) |
| Recommended | `gtin`/`gtin8…14`, `mpn` | ❌ no data |
| Recommended | `review`, `aggregateRating` | ❌ no review system |
| Recommended | `color`, `material`, `pattern`, `size`, `audience`, `hasCertification`, `hasAdultConsideration`, `inProductGroupWithID`, `isVariantOf`, `subjectOf` | ❌ not modelled |

**`Offer`** — same source:

| Status | Property | Verbatim requirement | This site |
|---|---|---|---|
| **Required** | `price` or `priceSpecification.price` | *"Unlike product snippets, merchant listing experiences require a price greater than zero."* | ✅ where a price exists |
| **Required** | `priceCurrency` | *"in three-letter ISO 4217 format"* | ✅ `INR` |
| Recommended | `availability` | *"Don't specify more than one value."* | ✅ derived from `status` + `orderType` |
| Recommended | `itemCondition` | *"Don't specify more than one value."* | ✅ `NewCondition` |
| Recommended | `priceValidUntil` | *"Your listing may not display if the priceValidUntil property indicates a past date."* | ❌ omitted (deliberate) |
| Recommended | `shippingDetails` (`OfferShippingDetails`) | *"We recommend you provide a global shipping policy for your business under Organization markup instead"* | ❌ impossible today |
| Recommended | `hasMerchantReturnPolicy` (`MerchantReturnPolicy`) | *"We recommend you provide a global return policy for your business under Organization markup instead"* | ❌ impossible today |
| Recommended | `url` | *"A URL of the product web page from which a shopper can purchase the product… The URL can be omitted. Don't provide multiple URLs."* | ✅ |
| Recommended | `validFrom` / `validThrough` | ISO 8601 | ❌ no data |
| Recommended | `priceSpecification` (`UnitPriceSpecification`) | `priceType` must be `StrikethroughPrice` | ⚠️ currently `ListPrice` — **bug** |

**`Product snippet`** — source: <https://developers.google.com/search/docs/appearance/structured-data/product-snippet>

> "Product snippets require either `review` or `aggregateRating` or `offers` … You only need to provide one of `review`, `aggregateRating`, and `offers`, but the product snippets section of the Rich Results Test may report a warning if you provide `offers` without `review` or `aggregateRating` properties."

Consequence: with `offers` present, product snippets are reachable **without any reviews** — a warning, not an error. That is the realistic target for this site.

### 4.3 What this site cannot satisfy today, and why

**Blocker 1 — "pages where a shopper can purchase a product".** Verbatim, merchant-listing technical guidelines:

> "Only pages where a shopper can purchase a product are eligible for merchant listing experiences, not pages with links to other sites that sell the product. Google may attempt to verify merchant listing product data before showing the information in search results."

This site orders via cart → WhatsApp handoff. There is no checkout, no payment gateway, no order object. Read strictly, the clause targets pages that *link out to other sellers* (affiliate/aggregator). A WhatsApp handoff is a genuine purchase channel run by the merchant, so this site is arguably inside the clause rather than outside it — but it is an **untested interpretation**, and the second sentence ("Google may attempt to verify") means the verification is not something we can do for them. Practical position: this is a **risk to merchant-listings eligibility, not to product-snippet eligibility**. Ship the markup, expect snippets, treat merchant listings as opportunistic.

**Blocker 2 — shipping.** No shipping rates exist anywhere in the product model, and no `/shipping` page exists (verified 404). The shipping-policy doc (<https://developers.google.com/search/docs/appearance/structured-data/shipping-policy>) requires `ShippingService.shippingConditions`, and each `ShippingConditions` needs a `shippingDestination` (`DefinedRegion` with `addressCountry`) plus a `shippingRate` (`MonetaryAmount`) or `doesNotShip`. There is nothing truthful to put in `shippingRate`: shipping is quoted per order on WhatsApp. One product title even asserts "FREE SHIPPING", which is a per-item exception, not a policy.

**Blocker 3 — returns.** No `/returns` page (verified 404) and no return-window field. The return-policy doc (<https://developers.google.com/search/docs/appearance/structured-data/return-policy>) offers two shapes, and one of them is cheap:

> "Option B: `merchantReturnLink` — URL. Specify the URL of a web page that describes the return policy to your customers."

So a single published `/returns` page would satisfy the property. Until that page exists, `hasMerchantReturnPolicy` cannot be emitted truthfully — and `MerchantReturnNotPermitted` ("Returns aren't permitted") would be a *policy claim*, not a technical one. It must come from the business, not from the SEO team.

**Blocker 4 — reviews.** No `Review` model, no order history exposed, no review UI. `aggregateRating`/`review` must stay absent.

**Net:** of the merchant-listing feature set, this site can truthfully satisfy `name`, `image`, `offers`, `price > 0`, `priceCurrency`, `availability`, `itemCondition`, `url`, `sku`, `brand.name`, `category`, `description`. It cannot satisfy `shippingDetails`, `hasMerchantReturnPolicy`, `gtin`, `mpn`, or any review property. Therefore: **product snippets = in scope; the "popular products" / shopping-knowledge-panel surfaces = out of scope until the business publishes shipping + returns and, ideally, gains a real checkout.**

### 4.4 Two adjacent facts worth knowing before promising anything

- **Sitelinks search box is gone.** Google Search changelog, November 29 2024 (<https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox> now redirects to the changelog): *"Removing sitelinks search box documentation … The sitelinks search box feature is no longer available in Google Search results."*
- **`FAQPage` rich results are retired.** Changelog, May 8 2026: *"Deprecating the FAQ rich result feature … This feature will no longer appear in Google Search starting May 7, 2026."* The About page already carries an FAQ block — leave it as content, add no `FAQPage` markup for SERP benefit.

### 4.5 Merchant Center feed is the other half

There is no online checkout, so a Merchant Center feed cannot fully substitute for on-site markup either — but the feed in `lib/seo/merchant-feed.ts` already omits `g:shipping` and `g:return_policy` and sets `identifier_exists=no` deliberately. That means **the feed and the JSON-LD must agree**: same `sku`, same price, same availability, same image. A mismatch between feed price and on-page `Offer.price` is one of the fastest ways to lose a shopping surface.

---

## 5. `lib/seo/schema.ts` — module design (and the patch list)

The module **already exists** in the working tree (`lib/seo/schema.ts`, 246 lines) with `availabilityFor`, `sellingPrice`, `productUrl`, `productSchema`, `breadcrumbSchema`, `itemListSchema`, `organizationSchema`, `localBusinessSchema`, `websiteSchema`, `siteGraphSchema`, plus `components/seo/json-ld.tsx`. It runs (`npx tsx` verified). What follows is the design contract, then the six corrections it still needs — presented as replacement functions so they can be pasted over the existing ones.

### 5.1 Contract

- Plain TypeScript, named exports, no zod, no new dependencies.
- 2-space indent, single quotes, semicolons omitted — matches `lib/utils.ts`, `lib/queries.ts`.
- Every builder returns `JsonLdNode = Record<string, unknown>`; the page passes it (or an array of them) to `JsonLd`.
- Every URL goes through `absoluteUrl()` / `SITE_URL` from `lib/seo/site.ts` — never string-concatenate a host.
- Optional properties are spread in conditionally (`...(x ? { k: x } : {})`) so an absent fact produces an absent key, not `null`, `''` or `[]`.
- Mutable builder output is typed loosely on purpose: `JsonLdNode` keeps the builders cheap to compose into an `@graph` without a discriminated union per schema type.

### 5.2 `JsonLd` component (exists, unchanged — shown for completeness)

`components/seo/json-ld.tsx`:

```tsx
import type { JsonLdNode } from '@/lib/seo/schema'

interface JsonLdProps {
  data: JsonLdNode | JsonLdNode[]
}

export default function JsonLd({ data }: JsonLdProps) {
  const payload = JSON.stringify(data).replace(/</g, '\\u003c')

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  )
}
```

Why it is right: `JSON.stringify` on the server produces a static string, so the markup is in the **initial HTML** — which is what Google asks for on Product pages ("If you're a merchant optimizing for all types of shopping results, we recommend putting Product structured data in the initial HTML for best results"). Escaping `<` prevents a product title containing `</script>` from terminating the element. No `@context` is added by the component; each builder owns it, and `siteGraphSchema()` strips it from children so one document declares it once.

### 5.3 Corrections required (eight, in priority order)

**F1 — `sku` must be the stable id, not the slug.**

```ts
// lib/seo/schema.ts
sku: product.id,
```

Same file, `productSchema`. Slugs like `-24-honda-civic-type-r-team-transport-hw-legend-tour-` are legal `sku` values but change on retitle; `Product.id` is a cuid, ASCII, whitespace-free, globally unique.

**F2 — `priceType` must be `StrikethroughPrice`.** Replaces the `ListPrice` value at `lib/seo/schema.ts:106`:

```ts
...(product.offerPrice != null &&
product.price != null &&
product.offerPrice < product.price
  ? {
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: product.price,
        priceCurrency: CURRENCY,
        priceType: `${SCHEMA_ORG}/StrikethroughPrice`,
      },
    }
  : {}),
```

**F3 — `category` is an array, never a joined string.** Replaces line 71 (`category: categoryNames.join(' > ')`) and the `categoryNames.length` guard:

```ts
...(categoryNames.length ? { category: categoryNames } : {}),
```

**F4 — never emit a `description` that is the `name`.** Replaces lines 66-68:

```ts
function productDescription(product: ProductWithRelations): string | null {
  const candidates = [product.description, product.shortDesc]
    .map((value) => value?.replace(/\\s+/g, ' ').trim() ?? '')
    .filter((value) => value.length >= 40 && value.toLowerCase() !== product.title.trim().toLowerCase())

  return candidates[0] ?? null
}

// inside productSchema:
const description = productDescription(product)
...
...(description ? { description } : {}),
```

**F5 — drop `itemCondition` from the `Product` node** (keep it on `Offer`). Delete line 72 (`itemCondition: ...` inside `node`). Google documents `itemCondition` under *Offer details*; at Product level it is ignored.

**F6 — `image`: absolute, and `ImageObject` with a caption.** Replaces lines 51-53 and line 69:

```ts
const images = product.images
  .map((image) => image.imageUrl)
  .filter((url) => /^https?:\\/\\//i.test(url))
  .map((url) => ({
    '@type': 'ImageObject',
    contentUrl: url,
    caption: product.title,
  }))
...
...(images.length ? { image: images } : {}),
```

The regex filter is deliberate: `absoluteUrl('/products/x.jpeg')` yields a URL that 404s today (verified), so root-relative rows are dropped rather than absolutised into a broken claim. The real fix is upstream — store Blob URLs at upload time.

**F7 — `Organization.telephone` must be a real number.** In `lib/seo/site.ts:51` the value is the masked placeholder `'+919****4984'`; replace with `'+919079674984'` (verified from `wa.me/919079674984`). Then co-type the node and delete the separate `Store`:

```ts
export function organizationSchema(): JsonLdNode {
  const { streetAddress, postalCode } = BUSINESS.address
  const hasStreetAddress = Boolean(streetAddress && postalCode)

  return {
    '@context': SCHEMA_ORG,
    // Co-typed so one business is one entity. Drop 'Store' if there is no
    // walk-in location: Store is a claim about a physical place.
    '@type': hasStreetAddress ? ['Organization', 'Store'] : 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    alternateName: SITE_SHORT_NAME,
    url: SITE_URL,
    description: BUSINESS.description,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(BUSINESS.logoPath),
      width: 512,
      height: 512,
    },
    image: absoluteUrl(BUSINESS.logoPath),
    telephone: BUSINESS.telephone,
    address: {
      '@type': 'PostalAddress',
      ...(streetAddress ? { streetAddress } : {}),
      addressLocality: BUSINESS.address.addressLocality,
      addressRegion: BUSINESS.address.addressRegion,
      ...(postalCode ? { postalCode } : {}),
      addressCountry: BUSINESS.address.addressCountry,
    },
    areaServed: { '@type': 'Country', name: BUSINESS.areaServed },
    currenciesAccepted: CURRENCY,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: BUSINESS.telephone,
        areaServed: 'IN',
        availableLanguage: ['en', 'hi'],
      },
    ],
    ...(BUSINESS.sameAs.length ? { sameAs: BUSINESS.sameAs } : {}),
  }
}
```

Then `siteGraphSchema()` becomes two nodes (`Organization`, `WebSite`) instead of three — remove `localBusinessSchema()` from the graph (keep the export only if another page needs it; nothing does today).

**F8 — optional `priceValidUntil`, only once the column exists.**

```ts
...(product.offerEndsAt
  ? { priceValidUntil: new Date(product.offerEndsAt).toISOString().slice(0, 10) }
  : {}),
```

Requires a Prisma migration (`offerEndsAt DateTime?`). Until then, omit — see §3 row 12.

### 5.4 Where each builder is mounted (verified in tree)

| Builder | Mounted at | Note |
|---|---|---|
| `productSchema` + `breadcrumbSchema` | `app/(public)/product/[slug]/page.tsx:192` | One `<JsonLd data={[...]}/>` per page |
| `siteGraphSchema` | `app/layout.tsx:84` | Root layout, so every route inherits the entity graph |
| `itemListSchema` + `breadcrumbSchema` | `app/(public)/catalog/page.tsx:99`, `brands/[slug]:75`, `categories/[slug]:75` | `numberOfItems` = items actually emitted |
| `breadcrumbSchema` only | `app/(public)/brands/page.tsx:38` | Brand index has no product list |
| — (missing) | `/cart`, `/cart/shared`, `/about` | Correct to omit a `Product` there; About could take `AboutPage`, low value |

---

## 6. Validation plan

### 6.1 Pre-merge (must pass before deploying markup)

| Check | How | Pass condition |
|---|---|---|
| Builders produce valid JSON | `npx tsx` script that imports `lib/seo/schema.ts`, feeds 3 real rows (A/B/C above) | `JSON.parse` succeeds; snapshots match §2 |
| No relative URLs | grep the emitted payload for `"http` count vs `://` occurrences; assert every `url`/`contentUrl`/`item` starts `https://` | 0 relative values |
| No placeholder text | grep emitted payload for `****`, `TODO`, `example.com`, `localhost` | 0 matches (today `****` **fails** — F7) |
| Currency + dates | `priceCurrency === 'INR'`; any date matches `^\d{4}-\d{2}-\d{2}$` | exact |
| Price matches the page | Compare `offers.price` with the `₹` string rendered for the same slug | equal, integer INR (no paise) |
| Availability matches the badge | `SoldOut` ⇔ "Sold Out" badge; `PreOrder` ⇔ "Pre-Order" badge | equal |
| `numberOfItems` = `itemListElement.length` | unit assertion in the builder test | equal |

### 6.2 Post-deploy

1. **Rich Results Test** — <https://search.google.com/test/rich-results> — run one URL per branch: A (discount + PRE_ORDER, no brand), B (SOLD_OUT), C (`price` null, two categories). Check both the **Product snippets** tab and the **Merchant listings** tab. Expected: snippets valid with `offers`; possible warning about missing `review`/`aggregateRating` (documented, acceptable). Merchant listings: expect it to report the missing shipping/return properties, or to be absent — both are known states (§4.3), not regressions.
2. **Schema Markup Validator** — <https://validator.schema.org> — this is the one that catches schema.org-level mistakes the Google tool ignores: `itemCondition` on `Product`, `priceType` values, unresolved `@id` references, duplicated entities. Paste the product URL and confirm the `@graph` resolves as one site entity + one product + one breadcrumb.
3. **Search Console → Shopping → "Product snippets" and "Merchant listings"** enhancement reports. Watch `Valid items` climb toward 222 and `Invalid items` stay at 0. Any "Missing field offers" cluster = the `price == null` cohort (§3 row 3), which is expected and must be *counted*, not fixed by inventing prices.
4. **Search Console → URL Inspection → Test live URL** on 3 product URLs. Confirm the rendered HTML contains the `<script type="application/ld+json">` **server-side** (View crawled page → HTML), not only after JS.
5. **Sitemap precondition.** Structured data is worthless if the crawl path is broken: the deployed `sitemap.xml` and the `Sitemap:` line in `robots.txt` both still say `http://localhost:3000`. Re-verify after the working-tree fix ships:
   ```
   curl -s https://www.diecastheavenudaipur.in/sitemap.xml | grep -c localhost   # must be 0
   curl -s https://www.diecastheavenudaipur.in/robots.txt | grep Sitemap        # must be https://www...
   ```
6. **Feed/markup parity.** `curl -s https://www.diecastheavenudaipur.in/feed/products.xml` (or whichever path `app/feed/` exposes) and diff `g:id` / `g:price` / `g:availability` against the JSON-LD for 10 overlapping products.

### 6.3 Deprecated or retired — do not add

| Type | Status | Date / source |
|---|---|---|
| `HowTo` | Rich results removed | September 2023 |
| `FAQPage` | Rich result retired for all sites | May 7 2026 (changelog: "This feature will no longer appear in Google Search starting May 7, 2026") |
| `SpecialAnnouncement` | Deprecated | July 31 2025 |
| `CourseInfo`, `EstimatedSalary`, `LearningVideo` | Retired | June 2025 |
| `VehicleListing` | Retired from rich results | June 2025 |
| `ClaimReview` | No Search rich result since June 2025 (Fact Check Explorer only) | June 2025 |
| Practice Problem | Docs removed | 2026-01-06 |
| Sitelinks search box (`SearchAction`) | Feature removed | Nov 29 2024 |
| `Dataset` | Dataset Search only, no Search surface | still supported there |

The About page has an FAQ block — it stays as **content**. Do not wrap it in `FAQPage` expecting a SERP feature; use `QAPage` only if a page becomes genuine user Q&A.

Also do not add: `aggregateRating`/`review` (no data), `gtin`/`mpn` (no data), `shippingDetails`/`hasMerchantReturnPolicy` (no policy), `priceValidUntil` (no end date), `Car` co-type (these are scale models, not vehicles — `Product` alone is correct).

---

## 7. How we would know this failed

Falsifiable checks, ordered by how early they fire.

| # | Signal | Where to look | Means |
|---|---|---|---|
| 1 | `grep -c 'application/ld+json'` on a production product page returns 0 | `curl -s <product url> \| grep -c 'application/ld+json'` | Markup never shipped, or was stripped by the RSC boundary — the single most likely failure |
| 2 | Rich Results Test finds the page but shows no `Product` item | RRT, item list | JSON-LD is in the DOM but malformed (trailing comma, unescaped `<`, `@context` missing) |
| 3 | Rich Results Test errors on `telephone` / `priceType` | RRT "Product snippets" tab | F2/F7 not applied |
| 4 | Search Console "Product snippets" `Valid items` stays 0 for 4 weeks after a verified deploy | GSC → Shopping | Google is not seeing the markup at all → check `robots.txt`, `noindex`, and whether the crawler gets the static HTML |
| 5 | `Valid items` counts only ~200 while the sitemap has 222 | GSC | The `price == null` cohort is being dropped — expected; if the gap is bigger, a branch is emitting invalid `offers` |
| 6 | GSC reports "Price mismatch" or "Availability mismatch" | GSC → Shopping → item details | Markup and page disagree — usually the `offerPrice`/`price` branch (§3 row 4) |
| 7 | Server-rendered HTML shows a relative `image` URL | `curl -s <url> \| grep -o '"contentUrl":"[^"]*"'` | F6 filter missing; every such URL 404s today |
| 8 | The brand crumb 404s | `curl -o /dev/null -w '%{http_code}' /brands/hotwheels-premium` | Deployed without `app/(public)/brands/**` (§2.4) |
| 9 | `sitemap.xml` still contains `localhost` | `curl -s .../sitemap.xml \| grep -c localhost` | Nothing gets discovered; every downstream metric is noise |
| 10 | Two different `@id`s resolve to the same business name | Schema Markup Validator | F7 co-typing not applied — duplicate entity |
| 11 | Rich Results Test flags `Merchant listings` as ineligible | RRT → Merchant listings tab | Expected while there is no checkout/shipping/returns (§4.3). It is only a failure if the business claims those now exist |
| 12 | Organic impressions for `/product/*` flat after 8 weeks | GSC → Performance → filter `/product/` | Markup is valid but not the lever — thin content (~208 words) and duplicate meta descriptions are the real ceiling, not schema |

---

## Appendix — evidence log

| Claim | Evidence |
|---|---|
| Zero JSON-LD on deployed product/catalog/cart pages | `curl` of 3 product URLs → `application/ld+json` count = 0; also 0 on `/catalog` |
| No canonical on deployed pages | No `<link rel="canonical">` in the fetched HTML of any sampled page |
| Sitemap is 225 URLs, all `http://localhost:3000` | `curl -s .../sitemap.xml`; host set = `{'localhost:3000'}` |
| `robots.txt` advertises `Sitemap: http://localhost:3000/sitemap.xml` | `curl -s .../robots.txt` |
| SOLD_OUT is served 200 and is in the sitemap | `/product/kick-sauber-f1-team-5-2025-` → 200, slug present in sitemap |
| `altText` null on every image | 24 image rows across 3 product payloads, `"altText":null` in all |
| Real product fields for A/B/C | RSC flight payload (`self.__next_f.push`) of each page |
| `/brands`, `/contact`, `/returns`, `/shipping`, `/faq` = 404 | `curl -o /dev/null -w '%{http_code}'` each |
| Relative `/products/*.jpeg` 404s | `https://www.diecastheavenudaipur.in/products/1793784550782-img-0750.png` → 404 |
| Real phone `+919079674984` | `wa.me/919079674984` in rendered product HTML |
| `lib/seo/site.ts` ships `'+919****4984'` | file line 51, and the executed `organizationSchema()` output |
| `PAGE_SIZE = 12` | `lib/queries.ts:186` |
| No GTIN/MPN/condition/weight columns | `prisma/schema.prisma` `model Product` lines 35-58 |
| No review model | `prisma/schema.prisma` (no `Review`/`Rating` model) |
| Google's required/recommended lists and the "purchase a product" guideline | `developers.google.com/search/docs/appearance/structured-data/merchant-listing` (fetched 2026-11-12) |
| "price greater than zero" | same doc, `Offer` required properties |
| `priceType` must be `StrikethroughPrice` | same doc, `UnitPriceSpecification` |
| Product snippet needs `review`/`aggregateRating`/`offers` | `.../structured-data/product-snippet` |
| Return policy Option B (`merchantReturnLink`) | `.../structured-data/return-policy` |
| `ShippingService`/`ShippingConditions` shape | `.../structured-data/shipping-policy` |
| Sitelinks search box removed | Search changelog, 2024-11-29 entry, fetched from the (now redirected) sitelinks-searchbox URL |
| FAQ rich result retired 2026-05-07 | Search changelog, 2026-05-08 entry |
