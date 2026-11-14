# SEO roadmap — Diecast Heaven Udaipur

Prioritised next steps after the work in `implementation.md`.

Ordering principle: **fix what blocks indexing first, then what blocks Shopping
eligibility, then what wins rankings.** Nothing below is speculative — every
Merchant Center claim is cited to a Google page that was fetched while writing
this.

---

## P0 — Do this week (no engineering, minutes of work)

These are the highest-leverage actions available and cost nothing.

### 1. Set `NEXT_PUBLIC_SITE_URL` in Vercel

```
NEXT_PUBLIC_SITE_URL=https://www.diecastheavenudaipur.in
```

`lib/seo/site.ts` now falls back to that value, so the site is no longer broken
without it — but relying on a hard-coded fallback in the repo is how the original
localhost bug happened. Set it explicitly.

Use the **www** host. The apex 308-redirects to www and the TLS certificate only
covers www.

### 2. Resubmit the sitemap in Search Console

Search Console → Sitemaps → submit `sitemap.xml` **and** `sitemap-images.xml`.
Then use URL Inspection on 3–5 product pages to request indexing.

The previous sitemap contained 225 `localhost` URLs. Google has been crawling a
sitemap it cannot use. Expect re-crawl of the catalogue to take days to weeks.

### 3. Submit the same sitemap to Bing Webmaster Tools

Bing is the other half of the IndexNow benefit and feeds Copilot/ChatGPT search.

### 4. Create a Google Business Profile for Udaipur

The business name literally contains the city. A verified GBP:
- puts the shop in the local pack for "diecast cars Udaipur" and "hot wheels shop Udaipur"
- is a prerequisite for Local Inventory Ads
- gives the `Organization`/`Store` JSON-LD something authoritative to agree with

Keep the name, phone (`+91 90796 74984`) and hours **byte-identical** to the
site's `BUSINESS` constant in `lib/seo/site.ts`.

### 5. Add social profile URLs to `sameAs`

`lib/seo/site.ts` has `BUSINESS.sameAs = []`. Once Instagram/Facebook/YouTube
exist, add them. `sameAs` is how Google resolves "is this the same entity as that
Instagram account", which matters for brand trust.

---

## P1 — The Google Shopping blocker (a business decision, not a code problem)

**This is the most important section in this document.** It is the honest answer
to "why can't our products appear in Google Shopping yet".

The goal splits into **three separate systems with three different gates**.
Treating them as one problem is the main strategic error to avoid:

| Surface | Gate | Available today? |
|---|---|---|
| Organic product snippets / merchant listings in Search | `Product` structured data + page quality | ✅ after this branch (pending crawl) |
| Free listings in the Shopping tab, nationally | Merchant Center + checkout + shipping + return policy | ❌ blocked on checkout |
| **Free local listings (Udaipur, in-store)** | Google Business Profile + local inventory feed | ❌ but **exempt from the checkout and shipping rules** |

### P1a — The path that works without changing checkout: free local listings

Google's local inventory policy explicitly exempts this surface:

> "The following Shopping ads policies **don't apply** to local inventory ads and
> free local product listings: … **Shipping.** Given that local inventory ads and
> free local product listings require an in-store purchase and pickup, **no
> shipping information is required**."
> — <https://support.google.com/merchants/answer/3271956>

India is a supported country for the Shopping tab and for local listings
(<https://support.google.com/merchants/answer/160637>).

**What it requires:**
1. A **verified Google Business Profile** with a real, customer-accessible address.
2. The existing product feed (already built) as the primary feed.
3. A **local inventory feed** whose required attributes are `store_code`, `id`,
   `quantity`, `price`, `availability`, where `store_code` matches the Business
   Profile and `id` matches the primary feed.

**What it buys:** "this Hot Wheels Premium set is in stock in Udaipur" in the
Shopping tab's local results, Maps, and the Business Profile products module. It
does **not** put the shop in the national Shopping grid next to Amazon — those are
different surfaces.

**Caveat:** `stock` is not reliably maintained, and `PRE_ORDER` items with a
deposit must be excluded from the local inventory feed — an availability mismatch
is itself a disapproval reason.

### P1b — National Shopping, if the business wants it

Google's binding text on checkout:

> "your website must provide a way for customers to purchase the products you
> advertise through an approved online payment service. This can either be
> directly from your website or through an alternative payment method, such as
> **cash on delivery, invoicing, or payment upon collection**."
> "**Websites that only allow a customer to request a quote are not supported.**
> The customer must be able to purchase the product online."
> "A confirmation page should be available when a customer completes their
> transaction."
> — <https://support.google.com/merchants/answer/10249082>

A WhatsApp handoff is, in Google's terms, **a request for a quote**. That is the
precise reason this site is ineligible.

Shipping cost is also **mandatory in India**:

> "You're required to set up 'Shipping' settings or add shipping costs using the
> shipping `[shipping]` attribute in the following countries: … **India** …"
> — <https://support.google.com/merchants/answer/13889434>

And the return policy must be reachable without login:
<https://support.google.com/merchants/answer/14011730>

| Requirement | Status |
|---|---|
| Products purchasable through the online store | ❌ Cart hands off to WhatsApp; the transaction completes off-site |
| Conventional payment method at checkout | ❌ None — no gateway, no COD option, no UPI at checkout |
| Order confirmation page | ❌ Does not exist |
| Published shipping cost + delivery time | ❌ "Calculated on WhatsApp" — and mandatory in India |
| Published return/refund policy page | ❌ Does not exist |
| Product feed | ✅ Built (`/feed/google-merchant.xml`) |
| Product structured data | ✅ Built |

Submitting the feed to a Merchant Center account now would generate policy
warnings and risks an account suspension that is painful to appeal. Do not do it
until the checkout story is defensible.

### The cheapest realistic path to national eligibility

Note the payment list explicitly includes **cash on delivery** and **invoicing**.
The bar is lower than "integrate Razorpay":

1. **Add a real checkout step on the site** (`/checkout`) that:
   - collects name, phone, address, pincode
   - shows a shipping cost (even a flat "₹99, free over ₹1,499")
   - offers **Cash on Delivery** and/or **UPI / bank transfer** as a payment method
   - records the order in a new `Order` table
   - renders a **confirmation page** with an estimated delivery date
   - *then* opens WhatsApp with the order reference (keep WhatsApp as a
     confirmation nicety, not as the checkout itself)
2. **Publish a `/shipping` page** with rates, delivery times and serviceable pincodes.
3. **Publish a `/returns` page** with the refund window, method and fees — reachable
   from the footer without login.
4. **Publish a `/contact` page** with a phone number and a full postal address.
5. Add `shippingDetails` and `hasMerchantReturnPolicy` to the Product JSON-LD
   (the builder in `lib/seo/schema.ts` has the hook points — deliberately omitted today).
6. Add `g:shipping` and `g:return_policy` to the merchant feed.

Steps 2–4 are content work and can ship in a day. Step 1 is the real project.

**Alternative if a checkout is out of scope:** accept that national Shopping is
unavailable, take the local-listings path in P1a, and compete on organic product
pages — which is exactly what this branch is built for. That is a legitimate
strategy; it just needs to be a decision rather than an accident.

**Third option, often the pragmatic one for a small Indian retailer:** list on a
marketplace that already has Merchant Center integration (Amazon India, Flipkart)
and use this site for brand + long-tail organic.

---

## P2 — Product data quality (biggest organic lever)

This is where the real ranking upside is, and it is entirely within the site's
control.

### The measurement that matters

In the local dataset, **16 of 24 products have no description, no short
description, no brand, no category and no image**. The production catalogue is
~222 products; the sample product page audited had **208 words**.

Thin product pages are why this site cannot outrank Amazon on broad queries. They
are also why merchant listings get disapproved for "missing description".

### Actions

1. **Make the admin form enforce quality.** In `app/admin/products/product-form.tsx`:
   - brand: required
   - at least one category: required
   - description: required, minimum ~120 characters
   - short description: required, 40–160 characters, and must differ from the title
   - at least one image: required
   - image alt text: default to a generated `"<brand> <title> <scale> diecast car"` rather than blank

   This is the highest-ROI code change left. It fixes the root cause instead of
   patching pages one by one.

2. **Backfill the existing catalogue.** Even 60–80 words of genuinely useful
   copy per product — casting, series, year, what makes it collectible, whether
   it is imported — is enough to stop these pages being thin.

3. **Image quality for Merchant Center.** Google requires a crawlable image URL,
   no watermarks, no promotional text overlaid, no placeholders. Aim for
   ≥ 800×800 on a plain background. Current product photos are
   `<store>.public.blob.vercel-storage.com/products/*.png` at unknown resolution —
   audit and re-shoot the worst ones.

4. **Serve WebP/AVIF.** `next/image` already converts on demand, but the
   originals are large PNG/JPEG. Check the actual `LCP` image weight per product
   page with PageSpeed Insights.

---

## P3 — Content and landing pages

### Already done in this branch
`/brands`, `/brands/[slug]` (11 pages), `/categories/[slug]` (13 pages), all
prerendered with `ItemList` and `BreadcrumbList` markup.

### Next
1. **Add editorial copy to brand and category pages.** Each currently renders a
   one-line intro plus a product grid. 150–250 words of genuinely useful text
   ("what Hot Wheels Premium is, why the Silver Series matters to collectors,
   which scales we stock") turns them from thin listing pages into pages that can
   rank. Do not template this — 24 near-identical paragraphs is worse than none.

   **This is also the single highest-leverage AI-search fix.** Three 2026 studies
   found category/listing pages take 32–46% of AI Overview citations on
   commercial product queries, against 5–8% for individual product pages. Similar
   AI puts the threshold at ~200 words of useful content above the grid. See
   `audits/onpage-geo.md` §0 and §3.

2. **Build a guide hub.** These are the queries a small shop can actually win:
   - "Hot Wheels Premium vs Silver Series — what's the difference"
   - "How to spot a genuine Hot Wheels in India"
   - "Hot Wheels case codes explained (A–Q)"
   - "Best diecast cars under ₹1000 in India"
   - "Tomica vs Majorette vs Matchbox — 1:64 scale compared"

   Each guide should link to the relevant `/brands/*` and `/categories/*` pages
   and to specific products. This is how you build topical authority around
   "diecast India" instead of competing head-on for "hot wheels".

3. **Paginate the catalogue with real URLs.** `/catalog` uses infinite scroll
   over `/api/catalog?page=N`, so pages 2+ have no crawlable URL. Either expose
   `?page=N` links in the HTML, or accept that only the first 12 products are
   linked from the catalogue and lean on the sitemap (which already lists every
   product).

4. **Add a `/catalog?sort=newest` implementation or remove the link.** The header
   links to it but `getCatalogProducts` ignores `sort`, so it renders the default
   order — a dead parameter.

---

## P4 — Technical follow-ups

1. **Fix the cache-poisons-on-failure bug in `lib/queries.ts`.**
   `safeQuery()` swallows DB errors and returns `[]`, and the result is then
   wrapped in `unstable_cache`. A transient failure gets cached as "the catalogue
   is empty" for the whole revalidate window. This was observed during this work:
   a build with `DATABASE_URL=""` cached empty lists, and the next build served
   them into `sitemap.xml`. Fix by rethrowing inside the cached function so
   nothing is persisted, and keeping the try/catch outside the cache.

2. **`.env.production.local` sets `DATABASE_URL=""`.** It is gitignored so it does
   not reach Vercel, but it silently overrides `.env` for every local production
   build and caused exactly the bug above. Delete the empty keys or stop using
   that file.

3. **Add a Content-Security-Policy.** Headers added in this branch cover
   `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` and
   `Permissions-Policy`, but there is still no CSP. Start in report-only mode.

4. **HSTS `includeSubDomains`.** Currently `max-age=63072000` only.

5. **Configure ESLint.** `npm run lint` prompts for setup instead of running, so
   there is no lint gate at all. Add `eslint-config-next` and wire it into CI.

6. **Reviews and ratings.** Product rich results with star ratings get materially
   higher CTR. There is no review system today, and marking up reviews that do not
   exist is a policy violation. If customer feedback exists on WhatsApp, ask
   permission to publish it, store it, and mark it up honestly.

7. **Core Web Vitals.** Measure with the CrUX/PSI APIs against the live product
   page. Watch LCP (hero product image) and INP (the image carousel and the
   add-to-cart interaction).

8. **Consider a `llms.txt`.** Low value for Google ranking — Google has not
   adopted it. Mild value for AI answer engines. Treat as optional, not a
   priority.

---

## P5 — Measurement

Without this you cannot tell whether any of the above worked.

1. **Search Console**
   - Performance → filter by page type (`/product/`) and by query.
   - Indexing → Pages: watch "Crawled – currently not indexed" for product URLs.
   - Enhancements → **Product snippets** and **Merchant listings** reports appear
     once the JSON-LD is crawled. These are the direct feedback loop for the
     structured data work.
   - Check that `/cart`, `/admin` and `/analytics` are excluded.

2. **Leading indicators to watch over 4–8 weeks**
   - Number of product URLs indexed (Search Console → Pages).
   - Impressions for queries containing a model name + "india".
   - CTR on product pages (rich results should lift this).
   - Rich result eligibility errors → should be zero.

3. **Falsifiability** — how to know this failed:
   - If, 4 weeks after the sitemap fix, Search Console still shows
     "Couldn't fetch" or the sitemap URL count is 0 → the deployment did not pick
     up `NEXT_PUBLIC_SITE_URL`; check the built `sitemap.xml` directly.
   - If product URLs stay "Discovered – currently not indexed" in bulk → the
     pages are still too thin; go back to P2 before adding anything else.
   - If the Merchant listings report shows errors on `image_link` → the product
     photos do not meet the minimum size/quality bar.

---

## What is deliberately NOT recommended

- **`FAQPage` markup for rich results.** Google retired FAQ rich results for all
  sites (May 2026). Use `QAPage` only for genuine user-generated Q&A.
- **`HowTo` markup.** Deprecated in 2023.
- **An `llms.txt` strategy.** Google Search ignores the file officially ("neither
  harm nor help"), no AI lab documents reading it, and Ahrefs found 97% of
  published files received zero requests in a month. Ship a 10-line file as a
  free hedge if you like, but do not budget work against it. See
  `audits/onpage-geo.md` §1.1.
- **Bulk-generated filler copy across 222 product pages.** Longer thin content is
  still thin, and mass-generated text is a quality risk.
- **Google's Indexing API for products.** It only accepts `JobPosting` and
  `BroadcastEvent`. Any guide claiming otherwise is wrong.
- **Buying backlinks.** For a small collector shop the realistic links come from
  diecast forums, Reddit (`r/HotWheels`, `r/Diecast`), Instagram and YouTube
  collector channels.
- **Location pages at scale.** Not applicable — one physical location.
