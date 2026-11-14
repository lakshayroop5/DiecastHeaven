# SEO implementation record

What changed in this branch, why, and how to verify each item.

Companion documents:
- `docs/seo/audits/` — the specialist audit reports this work was based on
- `docs/seo/roadmap.md` — prioritised next steps, including the blockers

---

## The headline problem

The live site's `sitemap.xml` listed **225 URLs, every one of them
`http://localhost:3000/...`**, and `robots.txt` declared
`Sitemap: http://localhost:3000/sitemap.xml`.

Cause: `app/sitemap.ts` and `app/robots.ts` both did

```ts
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
```

and `NEXT_PUBLIC_SITE_URL` was never set in the Vercel environment. The
localhost fallback was therefore the production value.

Everything else in this document is worth less than that one line, because
Google had no valid sitemap to work from.

---

## 1. Canonical URL handling — `lib/seo/site.ts` (new)

Single source of truth for the site origin, business entity and URL helpers.
Every canonical, Open Graph URL, JSON-LD `@id`, sitemap `<loc>` and feed `<link>`
is now derived from it.

- Falls back to `https://www.diecastheavenudaipur.in`, never to localhost.
- Collapses the apex domain onto `www`, because the apex **308-redirects** to www
  and the Let's Encrypt certificate's SAN covers `www` only. A canonical that
  redirects is a wasted signal.
- `absoluteUrl()`, `truncate()` helpers so no module re-implements them.

**Action still required:** set `NEXT_PUBLIC_SITE_URL=https://www.diecastheavenudaipur.in`
in the Vercel environment. The code fallback makes this non-urgent, not optional.

## 2. Structured data — `lib/seo/schema.ts`, `components/seo/json-ld.tsx` (new)

The site previously emitted **zero JSON-LD** on every page. That is the single
biggest gap for both product rich results and Google Shopping eligibility.

Now emitted:

| Type | Where | Notes |
|---|---|---|
| `Organization` | every page (root layout) | `@id` `#organization`, contact point, area served IN |
| `Store` (LocalBusiness) | every page | Udaipur / Rajasthan / IN, opening hours, `currenciesAccepted: INR` |
| `WebSite` + `SearchAction` | every page | sitelinks search box |
| `Product` + `Offer` | `/product/[slug]` | sku, brand, category, images, price, availability, condition, scale as `additionalProperty` |
| `BreadcrumbList` | product, catalog, brands, categories | mirrors the visible nav |
| `ItemList` | catalog, brand pages, category pages | server-rendered, matches the visible grid |

Deliberate omissions, because inventing these is a Google policy violation:

- **No `aggregateRating` / `review`** — there is no review system, so there are no
  reviews to markup.
- **No `shippingDetails` / `hasMerchantReturnPolicy`** — shipping is quoted on
  WhatsApp and there is no published return policy. These are *required* for
  merchant listing features; see `roadmap.md`.
- **No `gtin` / `mpn`** — the catalogue has no brand-issued identifiers. The slug
  is used as `sku`, which is a legitimate merchant-defined identifier.

Availability is derived from `status` + `orderType`, **not** `stock`. `stock`
defaults to 0 and is not maintained per unit, so using it would have marked most
of the catalogue `OutOfStock` — actively harmful.

## 3. Product pages — `app/(public)/product/[slug]/page.tsx`

- **Canonical** added (`alternates.canonical`), previously absent.
- **Title** now prepends the brand only when the product title does not already
  contain it, and appends the scale. No more `Hotwheels Premium Hot Wheels
  Premium ...` duplication.
- **Description fallback ladder**: `shortDesc` → `description` → a generated
  sentence. Candidates shorter than 40 characters, or identical to the title, are
  rejected — that is what produced 56-character descriptions identical to the H1.
- **Open Graph**: `og:type`, `og:url`, `og:site_name`, plus
  `product:price:amount`, `product:price:currency`, `product:availability`.
- **Twitter card** added.
- **Visible specifications block** (brand, scale, category, availability) built
  from real data. This lifts product pages out of thin content — the sample page
  was 208 words.
- **Breadcrumb nav** now links to the brand landing page.
- **`force-dynamic` removed**, replaced with `revalidate = 300` +
  `generateStaticParams()`. Product pages are now prerendered at build, cached at
  the edge, and invalidated by tag on edit. Previously every product page
  re-rendered on every request, which cost TTFB and crawl budget.

## 4. Sitemaps

### `app/sitemap.ts` (rewritten)

- Absolute www URLs from `SITE_URL`.
- Now includes `/brands` plus every `/brands/[slug]` and `/categories/[slug]`.
- Real `lastModified`: product `updatedAt`; collection pages take the newest
  product `updatedAt` instead of `new Date()` on every build.
- `priority`/`changeFrequency` reflect actual change rates.

### `app/sitemap-images.xml/route.ts` (new)

Next.js 14.2's `MetadataRoute.Sitemap` has **no `images` field** (verified against
`node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts`), so product
imagery gets a dedicated image sitemap with `<image:loc>`, `<image:title>` and
`<image:caption>`. This is the cheapest route into Google Images.

## 5. `app/robots.ts` (rewritten)

- Absolute sitemap URLs on the www host, both sitemaps declared, `Host` set.
- `/cart`, `/cart/shared`, `/api/`, `/admin`, `/analytics` disallowed.
- **AI crawlers explicitly allowed** (`GPTBot`, `OAI-SearchBot`, `ClaudeBot`,
  `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`) in their own
  group, so the intent is visible and a future wildcard edit cannot silently
  revoke it.

## 6. Catalog — `app/(public)/catalog/page.tsx`

Previously every filter state rendered the identical `<title>Diecast Heaven` with
no canonical, and Google had indexed `/catalog?orderType=PRE_ORDER` and
`/catalog?view=brands`.

Now:
- Unique `<title>` per state (`<brand> diecast cars`, `Search: "..."`, etc.).
- **Canonical policy** (`canonicalFor()`):
  - `?search=` → `noindex, follow` (infinite duplicate space)
  - `?brand=x` → canonicalises to `/brands/x`
  - `?category=x` → canonicalises to `/categories/x`
  - `?view=brands` → canonicalises to `/brands`
  - otherwise self-canonical and indexable
- `BreadcrumbList` + `ItemList` JSON-LD.

## 7. New crawlable landing pages

Brand and category facets were query parameters, so there was no page that could
rank for "Hot Wheels Premium India" or "diecast rally cars". Added:

- `app/(public)/brands/page.tsx` — brand index with live product counts
- `app/(public)/brands/[slug]/page.tsx` — 11 brand pages, prerendered
- `app/(public)/categories/[slug]/page.tsx` — 13 category pages, prerendered

Each has its own title, description, canonical, breadcrumb, `ItemList` JSON-LD
and server-rendered product links (capped at 36 so the HTML stays light, with a
link into the paginated catalogue for the rest).

`components/public/product-collection.tsx` renders these grids server-side —
deliberately *not* `ProductGrid`, which is a client-side infinite scroller and
would leave the product links out of the initial HTML.

Internal links updated so these pages are actually reachable:
`footer.tsx`, `header.tsx` (category dropdown) and the homepage brand grid now
point at `/brands/...` and `/categories/...` instead of query strings.

## 8. Google Merchant Center product feed — `app/feed/google-merchant.xml/route.ts` (new)

RSS 2.0 with the `g:` namespace at:

```
https://www.diecastheavenudaipur.in/feed/google-merchant.xml
```

Built by `lib/seo/merchant-feed.ts`. Per item: `g:id`, `title`, `description`,
`link`, `g:image_link` + up to 10 `g:additional_image_link`, `g:availability`
(`in_stock` / `out_of_stock` / `preorder`), `g:price`, `g:sale_price` when
discounted, `g:condition`, `g:brand`, `g:identifier_exists=no`,
`g:google_product_category`, `g:product_type`, `g:size`, `g:mpn`.

Products with no price or no image are **skipped** rather than emitted invalid —
Merchant Center rejects them and a feed full of rejections hides the real errors.
`X-Feed-Items` / `X-Feed-Skipped` response headers report the counts.

**This feed alone does not get products into the Shopping tab.** See the blocker
section in `roadmap.md`: Merchant Center also requires a checkout on the merchant
site, shipping rates and a return policy.

## 9. IndexNow — `lib/seo/indexnow.ts` (new)

`/api/revalidate` now pings IndexNow after revalidating cache tags, so Bing and
participating engines recrawl changed catalogue pages within minutes. Key file
lives at `public/<key>.txt`.

Note: **Google does not participate in IndexNow.** Google's Indexing API is
restricted to `JobPosting` and `BroadcastEvent` and cannot be used for products —
any guide claiming otherwise is wrong.

## 10. Root metadata — `app/layout.tsx`

- `metadataBase` set (required for every relative URL Next resolves).
- Title template `%s | Diecast Heaven Udaipur`, with per-page absolute titles
  where the template would push past ~70 characters.
- Full Open Graph (type/url/site_name/locale/images with width+height) and
  Twitter card defaults.
- `robots.googleBot` with `max-image-preview: large` (needed for large image
  previews in results).
- `verification.google` from `GOOGLE_SITE_VERIFICATION` — the token was in `.env`
  but was never rendered into a meta tag, so Search Console verification was
  silently relying on the DNS/HTML-file method or had lapsed.
- `lang="en"` → `lang="en-IN"`.
- Site-wide `@graph` JSON-LD (Organization + Store + WebSite).

## 11. Removed duplicate-title source — `app/(public)/layout.tsx`

The public layout defined `generateMetadata()` returning
`title: settings.businessName`. Because the root layout now owns a title
*template*, that child `title` would have been templated into
`Diecast Heaven | Diecast Heaven Udaipur` on **every** public page. The public
layout no longer declares metadata; each page owns its own.

## 12. Indexability of cart — `app/(public)/cart/layout.tsx` (new)

`/cart` was indexable. It is a client-rendered page with no standalone search
value, so it is now `noindex, follow`. (Metadata cannot be exported from a
`'use client'` page, hence the layout.)

## 13. Security headers — `next.config.js`

`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
`Permissions-Policy`, `poweredByHeader: false`, plus explicit `Cache-Control` for
sitemap and feed routes. Not a ranking factor directly, but a shopping
destination that can be framed or MIME-sniffed fails trust review.

## 14. `.env.example`

Documents the site URL requirement, the www-vs-apex rule, `INDEXNOW_KEY`,
`GOOGLE_SITE_VERIFICATION` and `GOOGLE_PRODUCT_CATEGORY`.

---

## Verification performed

| Check | Result |
|---|---|
| `npm run build` | passes, type-checks clean |
| `npm run lint` | **not configured** in this repo — `next lint` prompts for ESLint setup. No lint gate exists. |
| Sitemap contains no `localhost` | confirmed, 0 occurrences |
| Sitemap declares www host | confirmed |
| robots.txt sitemap URLs | confirmed absolute www |
| Product pages prerendered | confirmed (`●` SSG) |
| Brand/category pages prerendered | confirmed (`●` SSG) |
| JSON-LD present on product page | see `docs/seo/audits/` + manual check below |

### Manual checks to run after deploy

```bash
# 1. Sitemap is valid and on the right host
curl -s https://www.diecastheavenudaipur.in/sitemap.xml | grep -c localhost   # must be 0
curl -s https://www.diecastheavenudaipur.in/sitemap.xml | grep -c "<url>"     # ~250

# 2. robots.txt points at the real sitemap
curl -s https://www.diecastheavenudaipur.in/robots.txt

# 3. Product page carries Product + BreadcrumbList
curl -s https://www.diecastheavenudaipur.in/product/<slug> | grep -c "application/ld+json"

# 4. Feed returns items
curl -sI https://www.diecastheavenudaipur.in/feed/google-merchant.xml | grep X-Feed

# 5. Then paste one product URL into
#    https://search.google.com/test/rich-results
#    and validate the feed at https://merchants.google.com
```

## A bug found but deliberately not fixed

`lib/queries.ts` wraps every query in `safeQuery()`, which catches DB errors and
returns an empty fallback, and *then* wraps the result in `unstable_cache`. A
transient database failure therefore gets cached as "the catalogue is empty" for
the whole revalidate window.

This was observed during this work: a build with `DATABASE_URL=""` (from
`.env.production.local`) cached empty brand/product/category lists, and a
subsequent build served those cached empties into `sitemap.xml`.

Fixing it properly means not caching failures — e.g. rethrowing inside the cached
function so nothing is persisted, and letting `safeQuery` sit *outside* the cache.
That is a behaviour change in the hot path of the whole site, so it is listed in
`roadmap.md` rather than bundled into an SEO change.

## Two guards added after review

**1. Empty landing pages are excluded from the index.** A brand or category with
zero live products still renders a page (so a stale inbound link does not 404),
but it is `noindex, follow` and is left out of `sitemap.xml`. An empty page
advertised in a sitemap is a site-quality signal, not a ranking opportunity.

**2. No `canonical` in the root layout.** Metadata in a layout is inherited by
every child segment, so a root-level `canonical: '/'` would silently point any
page that forgot its own canonical at the homepage. Every real route now declares
its own canonical, and the root declares none.

## Corrections from specialist review

Three items were raised against this work. Two were real and are fixed:

1. **`category` invented a taxonomy.** `categoryNames.join(' > ')` produced
   `"COLLECTABLE > AS SINGLE"`, which asserts a parent/child relationship that
   does not exist. Google reads `category` as a single product category, so it
   now emits the primary category only.
2. **`priceType` used an undocumented value.** `schema.org/ListPrice` is not a
   value Google documents for strikethrough pricing; it now emits
   `schema.org/StrikethroughPrice`.
3. **`revalidatePath` was missing.** Product pages are prerendered (ISR), so
   clearing the data cache with `revalidateTag` alone left the old HTML in the
   full route cache. `/api/revalidate` now also calls `revalidatePath('/', 'layout')`.

One reported defect was a **false positive** and no change was needed: the
`telephone` field was reported as containing the masked placeholder
`+919****4984`. Verified by reading character ordinals — the file and the built
HTML both contain `+919079674984`, all digits. The asterisks were the agent
tooling masking phone numbers in displayed output, and the reviewer read that
masked output as file content. Lesson: never infer file contents from redacted
tool output; check the bytes.

Two further items were verified as **not** defects:
- Relative `/products/*.jpeg` image paths were reported as 404 on production.
  All 8 are tracked in git and return 200; production products otherwise use
  absolute Vercel Blob URLs, which `absoluteUrl()` passes through untouched.
- `@id` references (`#organization`, `#product`, `#offer`, `#store`, `#website`)
  were checked and resolve within the emitted graph.

## Verified output

```
# build: EXIT=0, sitemap 35 URLs (24 products + 2 brands + 5 categories + 4 static)
# crawled every sitemap URL against the production server -> all 200
/brands/tomica               -> noindex, follow   (no stock)
/brands/hotwheels-premium    -> index, follow
/catalog?brand=hotwheels     -> canonical /brands/hotwheels
/catalog?search=gt3          -> canonical /catalog, noindex
/cart                        -> noindex, follow
/product/<slug>              -> 2 ld+json blocks (site graph + Product/BreadcrumbList)
```
