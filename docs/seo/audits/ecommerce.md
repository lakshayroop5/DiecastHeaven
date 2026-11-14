# E-commerce / Google Shopping audit — Diecast Heaven Udaipur

**Date:** 12 November 2026
**Site:** https://www.diecastheavenudaipur.in (canonical host `www`)
**Scope:** Google Shopping / free listings eligibility, product feed design, product-page optimisation, competitive reality, local SEO.
**Stack:** Next.js 14 App Router, TypeScript, Prisma + libSQL/Turso, 222 live products, INR, no payment gateway, WhatsApp handoff checkout.

**Evidence standard:** every eligibility claim below cites a Google page fetched during this audit (full URL given). Where I could not verify something, it is marked **UNVERIFIED** and no recommendation is built on it. Statements about the site itself come from the live site and the repo, not from documentation.

---

## 0. The short answer

| Question | Answer |
|---|---|
| Can this site appear in the Google Shopping **tab** nationally (free listings) **today**? | **No** — two hard blockers: no shipping cost anywhere in the flow, and a checkout that ends outside the site with no order confirmation. Both are fixable, but the second is a business decision, not a code change. |
| Can it appear in **free local listings / in-store** results for Udaipur? | **Yes** — and this is the fastest real win. Google explicitly exempts local inventory ads and free local product listings from *both* the online-payment requirement and the shipping requirement. India is a supported country. |
| Can it improve **organic** product-intent queries without any Merchant Center account? | **Yes** — merchant listing structured data + Search Console shipping/returns settings, no account required. This is the highest-ROI work and is fully in the team's control. |
| What is the single biggest structural gap? | Zero structured data on any page, no canonical tags, no brand/category landing pages, and only 12 of 222 products internally linked. Google currently has almost no machine-readable product signal to work with. |

The user's goal ("appear alongside Amazon in Search and in Google Shopping") splits into three separate systems with three different eligibility gates. Treating them as one problem is the main strategic error to avoid:

1. **Organic product snippets / merchant listings in Search** — gated on `Product` structured data + page quality. No checkout requirement in practice, but merchant-listing *eligibility* is stated to require pages "where a shopper can purchase a product".
2. **Free listings in the Shopping tab (national)** — gated on Merchant Center + checkout policy + shipping + landing page.
3. **Free local listings (Udaipur, in-store)** — gated on a Google Business Profile + a local inventory feed. Exempt from (2)'s checkout and shipping rules.

---

## 1. Merchant Center reality check

### 1.1 What Google actually requires

**Free listings are live in India.** Google's supported-countries table lists `India †` with `Indian Rupee (INR)`, and the † footnote reads "The Shopping tab is available to users in this country."
→ https://support.google.com/merchants/answer/160637

**Checkout must exist, and payment must be collectable through an approved method.** The binding text, from "How to fix: Checkout incomplete warning/suspension":

> "In order to show your products in Shopping ads and free listings, your website must provide a way for customers to purchase the products you advertise through an approved online payment service. This can either be directly from your website or through an alternative payment method, such as cash on delivery, invoicing, or payment upon collection."
> "Websites that only allow a customer to request a quote are not supported. The customer must be able to purchase the product online."
> "A confirmation page should be available when a customer completes their transaction."
> "The customer should receive a confirmation of the purchase after completing the checkout process with an estimated date of delivery."

→ https://support.google.com/merchants/answer/10249082

And from "Checkout requirements and best practices":

> "Ensure that all products you advertise are available for either door-to-door delivery or collection point shipping in the countries you sell products in."
> "Provide relevant information … customers can find refund and return policy information, terms and conditions, and how to contact you."

→ https://support.google.com/merchants/answer/9158778

Note what this policy does **not** say: it does not require a card gateway, and it does not require Google to process the payment. COD, invoicing and pay-on-collection are named as acceptable alternatives.

**Shipping cost is mandatory in India.** From "Free listings for products" and from the `shipping [shipping]` attribute page, identically:

> "You're required to set up 'Shipping' settings or add shipping costs using the shipping `[shipping]` attribute in the following countries: Australia, Austria, Belgium, Brazil, Canada, Czechia, Denmark, Finland, France, Germany, Greece, Hungary, **India**, Ireland, Israel, Italy, Japan, New Zealand, …"

→ https://support.google.com/merchants/answer/13889434
→ https://support.google.com/merchants/answer/6324484

**Return policy must be published on the site**, and Google recommends declaring it in Merchant Center:

> "Add your return policy information to your website to show information about returns next to your products. … We recommend adding your return policy in Merchant Center."

→ https://support.google.com/merchants/answer/13889434

**The landing page must sell.** Required elements: "title, description, image, price, currency, availability, and a buy button".
→ https://support.google.com/merchants/answer/2700318

**Editorial rules bite directly on this catalogue.** Prohibited editorial patterns include "gimmicky use of words, numbers, letters, punctuation, or symbols such as FREE".
→ https://support.google.com/merchants/answer/6149970

This matters because the catalogue currently ships titles such as `Majorette Motorsport DTM Deluxe Cars Set of 6 ( no single ) - FREE SHIPPING` and slugs ending in `-free-shipping-`. Those are literal violations of the editorial rule and are trivially machine-detectable.

### 1.2 The verdict on WhatsApp-handoff checkout

Be precise about what is and is not true.

**What is true:** Google's checkout policy permits a purchase completed without a card gateway on the site — "cash on delivery, invoicing, or payment upon collection" are named alternatives. A Udaipur retailer taking a WhatsApp order, collecting UPI payment, and couriering the item is functionally COD/pay-on-confirmation. Google never inspects the payment processor.

**What is also true, and is the problem:** the current flow fails three sub-requirements that a reviewer can observe by clicking "Checkout via WhatsApp" on https://www.diecastheavenudaipur.in/cart:

| Requirement (10249082 / 9158778) | Current state |
|---|---|
| Complete the full checkout **on your website**, without errors | Checkout leaves the site (`window.open(link)` to `wa.me`) — see `app/(public)/cart/page.tsx` |
| Confirmation **page** after the transaction | None exists; confirmation happens in a WhatsApp thread |
| Confirmation with an **estimated date of delivery** | None |
| Shipping cost available at/ before checkout | Cart literally renders `Shipping: Calculated on WhatsApp` |
| Return policy / T&C / contact reachable | `/contact` returns **404** (verified live); nav still links to "Contact" |

**Verdict:** the site does not currently satisfy the checkout policy as written. Whether a human reviewer would accept a WhatsApp thread as the "purchase" is **UNVERIFIED** — I found no Google documentation addressing messaging-app handoff explicitly, and I will not assert an answer either way. What I can assert: three of the four observable conditions in 10249082 fail on the live site, and the shipping attribute that India mandates cannot be filled truthfully while shipping is "calculated on WhatsApp". Expected outcome if submitted as-is: `Checkout incomplete` warning, and products limited or disapproved.

**The counter-argument, stated fairly.** Small Indian merchants do get free listings approved on thin commerce stacks. Enforcement is a mix of automation and human review, and "Checkout incomplete" is usually triggered by *patterns* (pure lead-gen forms, "request a quote", broken carts) rather than by a single click-out. A wa.me deep link with a full pre-filled order, an itemised total, and a merchant who replies in minutes may read as a working COD flow to a reviewer. Also, Merchant Center accepts COD explicitly — and COD is exactly what this shop does today.

**Why I still would not submit the national feed first:** the failure mode is an account-level suspension, not a single disapproved item ("Failure to comply with policy requirements can result in your Shopping ads and free listings being disapproved or your account suspended" — 9158778). Suspensions are slow and annoying to appeal. Sequence the work so the cheap, low-risk paths land first (sections 1.3 and 1.4) and the account is opened only when the checkout story is defensible.

### 1.3 The path that works **today**, with no checkout changes: free local listings

This is the most important finding in the report. From "Local inventory ads and free local product listings policies":

> "The following Shopping ads policies **don't apply** to local inventory ads and free local product listings:
> - **Online payment and transaction requirements.** Your site doesn't require an online checkout and payment option. …
> - **Shipping.** Given that local inventory ads and free local product listings require an in-store purchase and pickup, **no shipping information is required**."

Country list includes **India**. Additional requirements: a physical "brick and mortar business location where customers can physically visit, view, and purchase the desired item", no membership exclusivity, and all fees included in the price.
→ https://support.google.com/merchants/answer/3271956

**What it needs technically:**

1. A verified Google Business Profile for the Udaipur store, with a **store code** in the profile.
2. Merchant Center account linked to that Business Profile.
3. A normal product data source (same attributes as §2 — the product feed is *not* waived).
4. A **local inventory data source**, whose required attributes are `store_code`, `id`, `quantity`, `price`, `availability`, where `store_code` must match the Business Profile and `id` must match the primary feed.
   → https://support.google.com/merchants/answer/14819809
   → https://support.google.com/merchants/answer/13869896
   → https://support.google.com/merchants/answer/15182106

**What it buys:** in-store availability in the Shopping tab's local results, Maps, and the Business Profile products module — i.e. "this Hot Wheels Premium Boulevard set is in stock 2.3 km away in Udaipur". It does **not** put the shop into the national Shopping grid next to Amazon. Two different surfaces.

**Honest caveat on inventory:** `stock` is an integer in `prisma/schema.prisma` but several live products are `PRE_ORDER` with `depositAmount`. Only genuinely on-shelf items should enter the local inventory feed; pre-orders must be excluded or they will produce availability mismatches, which is itself a disapproval reason (→ https://support.google.com/merchants/answer/6324448).

### 1.4 The path that works **today**, with no Merchant Center at all: organic merchant listings

Merchant listing structured data drives the shopping knowledge panel, product snippets, Images and "popular products" — and its shipping/returns inputs can be supplied **without** a Merchant Center account:

> "You don't need to create a Merchant Center account to configure shipping and returns in Search Console."
→ https://support.google.com/webmasters/answer/14907594 (Settings → Shopping → Shipping and returns; fields: delivery time, shipping cost, return window, return cost)

Required markup for merchant listings: `Product.name`, `Product.image`, `Product.offers` (must be `Offer`, not `AggregateOffer`), `Offer.price` ("merchant listing experiences require a price greater than zero") and `Offer.priceCurrency`. `availability`, `itemCondition`, `shippingDetails`, `hasMerchantReturnPolicy`, `priceValidUntil` and `url` are *recommended*, not required.
→ https://developers.google.com/search/docs/appearance/structured-data/merchant-listing

The one guideline that constrains this shop:

> "Only pages where a shopper can purchase a product are eligible for merchant listing experiences, not pages with links to other sites that sell the product."

That is a genuine risk for the WhatsApp handoff — and it is the strongest argument in the whole report for putting a real on-site order step in front of the WhatsApp message (see §6, Tier 2). Product **snippets** do not carry the same buy-on-site framing and will work regardless, because they only need `name` + `offers`/`aggregateRating`.

### 1.5 Minimum change set to become eligible

| Tier | Goal | Changes | Effort | Depends on |
|---|---|---|---|---|
| **A** | Free local listings (Udaipur) | GBP created + verified with store code; `/contact` fixed with full NAP; LocalBusiness schema; MC account + product feed (§2) + local inventory feed (in-stock RTD only); return policy page | 1–2 weeks | GBP verification (Google-controlled, days-to-weeks) |
| **B** | Organic merchant listings + snippets | `Product` + `BreadcrumbList` JSON-LD server-rendered; canonical tags; Search Console shipping & returns; return/contact/shipping policy pages; titles & descriptions cleaned | 3–5 days dev | none |
| **C** | National free listings in the Shopping tab | Everything in A and B, **plus**: a real on-site checkout step that captures name/address/payment choice, shows shipping cost + delivery estimate, and renders an order-confirmation page with an order ID (WhatsApp can remain the *notification* channel); shipping configured in MC (or Search Console); return policy in MC | 2–4 weeks dev + a business decision on shipping rates | owner agreeing to fixed shipping rates and a return window |

Tier C's blocking item is not technical. Someone has to decide: flat ₹X shipping or free above ₹Y, and a return window (Flipkart's benchmark on the same SKUs is 7 days — see §4). Once decided, the on-site checkout requirement is one server action and one route.

### 1.6 Counter-arguments worth taking seriously

Stating these because the report is worth less without them.

1. **Free listings are a price-comparison surface, not a discovery surface.** Submitting 222 SKUs with one photo each, no reviews, no ratings and no GTIN into a grid where Amazon shows ₹689 for a Boulevard car will mostly produce impressions without clicks. The merchandising work (§3) has to precede or accompany the feed, or the feed just documents weakness.
2. **Availability mismatch is the most common self-inflicted disapproval.** Google: "If we find that a product is in stock on your landing page or during checkout, but the availability attribute is set to `out_of_stock` in your product data, we disapprove the product." (→ 6324448) With 60 %+ of the live catalogue on pre-order and stock counts that change by hand, mismatch is close to guaranteed unless the feed is generated from the same rows the page renders — which is exactly why §2.7 generates the feed from `lib/queries.ts` rather than a spreadsheet.
3. **Pre-order + a mandated `availability_date` is a promise.** Once `availability` is `preorder`, `availability_date` becomes **required** (→ https://support.google.com/merchants/answer/6324470). The schema has `orderType = PRE_ORDER` but no ETA column. Fixtures-to-India dates slip; a fabricated date is a false statement to Google. This is a small schema migration, not a workaround.
4. **Brand-keyword bidding is not the same as ranking.** Winning "hot wheels premium india" organically is realistic; out-ranking Amazon's Shopping slot for the same head term is not, and no amount of feed hygiene changes that.
5. **A suspension costs more than a slow start.** Hence the tier ordering above.

I am not arguing against Merchant Center. I am arguing that the local path and the organic path pay out first and carry no account risk, and that the national feed should land after the checkout story is defensible.

---

## 2. Product feed specification

### 2.1 Format decision

Use **RSS 2.0 with the Google Merchant Center namespace**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
```

The namespace string is `http://base.google.com/ns/1.0` — **scheme is `http`, not `https`**, and it must match exactly. Google: "Ensure that all attribute names in your feeds XML file have the right namespace … This isn't understood by our system. The attribute is missing the namespace and will therefore cause a warning and will not be processed."
→ https://support.google.com/merchants/answer/14987622
→ https://support.google.com/merchants/answer/16693405

Atom 1.0 (`<feed xmlns="http://www.w3.org/2005/Atom" xmlns:g="http://base.google.com/ns/1.0">`) is equally supported. I recommend RSS 2.0 only because every example and every debugging page Google publishes uses it, so a future maintainer has more to pattern-match against. TSV/CSV are also accepted and are marginally smaller, but they give up multi-value attributes (`shipping`, `additional_image_link`) and are harder to generate safely from a typed data model.

**Hard limits:**

- File must end in `.xml`, up to **4 GB** per file. → https://support.google.com/merchants/answer/12631822
- Max **5,000,000 items** per data source per country/language (not a constraint at 222). → https://support.google.com/merchants/answer/16564100
- 200 data sources per account; **100 primary-feed fetches per day**. → same quotas page
- Google re-fetches scheduled sources daily. Set the fetch schedule to daily and keep the endpoint cheap — hence `revalidate`, below. Google's guidance for push/scheduled fetches is daily generation; 222 items makes hourly regeneration pointless. → https://support.google.com/merchants/answer/14991445

**Refresh cadence recommendation:** `revalidate = 3600` on the route *plus* tag-based invalidation on any product write. A price change must reach Google within the same day; an hour of staleness is acceptable and is well inside what a daily fetch will consume anyway.

### 2.2 Attribute matrix for India

Required = per Google's spec for an offer that must show. Recommended = affects quality/eligibility for enrichments.

| Attribute | Status | Value for this site | Notes |
|---|---|---|---|
| `g:id` | Required | `product.id` (cuid) | Must stay stable forever; 50 char max. Never use the slug — slugs here are mutable and already messy. |
| `g:title` | Required | formula in §3.1 | ≤150 chars. No ALL-CAPS, no emoji, no "FREE SHIPPING", no price. |
| `g:description` | Required | rewritten copy | ≤5,000 chars, plain text. No price arithmetic, no promo words. |
| `g:link` | Required | `https://www.diecastheavenudaipur.in/product/{slug}` | Must be the `www` host and match the verified domain. |
| `g:image_link` | Required | raw blob URL (see §2.4) | JPEG/PNG/WebP; ≥500×500 from 2027-01-31. |
| `g:additional_image_link` | Recommended | extra images if present | Repeatable; up to 10. Currently most products have exactly one. |
| `g:availability` | Required | `in_stock` / `preorder` / `out_of_stock` | Mapping table in §2.5. |
| `g:availability_date` | **Required when `preorder`** | needs new schema column | → 6324470 |
| `g:price` | Required | `5350.00 INR` | Number, dot decimal, space, ISO 4217. Must include GST (India). → https://support.google.com/merchants/answer/14819809 |
| `g:sale_price` | Recommended | `offerPrice` when < `price` | Only when a genuine struck-through price exists on the page. → https://support.google.com/merchants/answer/6324471 |
| `g:sale_price_effective_date` | Optional | omit | If omitted the sale price is treated as always-on. Omit rather than inventing dates. |
| `g:condition` | Required only for used/refurbished | `new` | All stock is new; submit it anyway — it removes reviewer doubt. → https://support.google.com/merchants/answer/6324469 |
| `g:brand` | Required where a brand exists | `Hot Wheels`, `Majorette`, `Matchbox`, `LCD`, `CCA`, … | Submit the **manufacturer** brand, not the series. `"HOTWHEELS PREMIUM"` is a Mattel product line, not a brand. |
| `g:gtin` / `g:mpn` | Required when they exist | absent today | Mattel UPCs exist in the real world (Amazon.in lists UPC `194735336531` for a Boulevard car) — plan a column, don't fake it. |
| `g:identifier_exists` | Required when no UPI | `no` | Only acceptable value: `no` (or `false`), in English. → https://support.google.com/merchants/answer/6324478 |
| `g:google_product_category` | Required (recommended by Google, effectively required for correct placement) | `3551` = `Toys & Games > Toys > Play Vehicles > Toy Cars` | Verified in Google's taxonomy file. Use the ID, not the path, and not a guessed path. |
| `g:product_type` | Recommended | own taxonomy, e.g. `Diecast & Model Cars > Hot Wheels > Premium` | Free text; this is where series naming lives. |
| `g:item_group_id` | Required for variants | group colourways of one casting | e.g. the three `land-rover-range-rover-1-64-scale-*` colourways are one group. |
| `g:shipping` | **Required in India** | prefer account-level settings | → 6324484 |
| return policy | Required on site; declare in MC/Search Console | account-level, 7 days, buyer pays return freight | → 14907594, 10220642 |
| `g:custom_label_0..4` | Optional | `series`, `order_type`, `scale`, `imported` | Up to 1,000 unique values each; useful later for campaign segmentation. |

Taxonomy evidence: `3551 - Toys & Games > Toys > Play Vehicles > Toy Cars`, plus `2505 - Toys & Games > Toys > Play Vehicles` as the parent, from Google's published taxonomy file (`https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt`).

Two deliberate omissions: no `age_group` (this is a collector product, not a children's age-graded toy — and mis-declaring age invites a mismatch), and no `multipack` unless the set-of-6/5 items are genuinely one sellable unit (they are — those should instead be one item with a clear title, not six phantom variants).

### 2.3 Worked example — a real product

Verified live on 12 Nov 2026 at `https://www.diecastheavenudaipur.in/product/hotwheels-premium-boulevard-combo-set`:

- Title rendered: `HOTWHEELS PREMIUM BOULEVARD COMBO SET`
- Price: `₹5,350` with struck-through `₹5,550` and "4% off" → `offerPrice` 5350, `price` 5550
- Brand: `HOTWHEELS PREMIUM`; categories: `COLLECTABLE`
- Image (underlying asset): `https://1hcggaciljsuxuel.public.blob.vercel-storage.com/products/1792906713669-img-0059.jpeg`
- Description currently reads like a price calculation: `Hotwheels Premium Boulevard 156 - 160 + Porsche TT + Honda TT / MRP Value - 1400x2 + 550x5 = 5,550 / Offer Deal … Total Price 2750 + 2600 = 5,350 ( Shipping Extra )`

That description is unusable in a feed — it is price arithmetic, it contradicts the required `shipping` block with "Shipping Extra", and it duplicates nothing a shopper needs. The replacement below is written from the observable facts only (5 Boulevard cars + 2 Team Transport, 1:64, new, sealed):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Diecast Heaven Udaipur</title>
    <link>https://www.diecastheavenudaipur.in</link>
    <description>Hot Wheels, Majorette, Matchbox and LCD diecast collector cars, Udaipur</description>

    <item>
      <g:id>clq7f2b1x0000abcd1234efgh</g:id>
      <g:title>Hot Wheels Premium Boulevard Set of 5 + 2 Team Transport - 1:64 Collector Set</g:title>
      <g:description>Seven-car Hot Wheels Premium bundle: the five Boulevard releases 156-160 together with a Porsche Team Transport and a Honda Team Transport. All cars are 1:64 scale with metal bodies and Real Riders tyres, supplied new and sealed in their original packaging. Imported stock, hand-checked for card and blister condition before dispatch from Udaipur, Rajasthan.</g:description>
      <g:link>https://www.diecastheavenudaipur.in/product/hotwheels-premium-boulevard-combo-set</g:link>
      <g:image_link>https://1hcggaciljsuxuel.public.blob.vercel-storage.com/products/1792906713669-img-0059.jpeg</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>5550.00 INR</g:price>
      <g:sale_price>5350.00 INR</g:sale_price>
      <g:condition>new</g:condition>
      <g:brand>Hot Wheels</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>3551</g:google_product_category>
      <g:product_type>Diecast &amp; Model Cars &gt; Hot Wheels &gt; Premium Boulevard</g:product_type>
      <g:custom_label_0>Hot Wheels Premium</g:custom_label_0>
      <g:custom_label_1>set</g:custom_label_1>
      <g:custom_label_2>rtd</g:custom_label_2>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>80.00 INR</g:price>
      </g:shipping>
    </item>
  </channel>
</rss>
```

Notes on that item, because each line is a decision:

- `g:id` is the cuid, not the slug — the slug for this product is already ugly (`…combo-set`, no trailing junk here, but seven other slugs end in a stray hyphen: `66-super-nova-hotwheels-premium-boulevard-`, `hotwheels-m-case-2026-indian-`, `mercedes-benz-300-sl-hotwheels-silver-series-vintage-club-1968-imported-`). Slugs will be cleaned up during the route work in §3.5; the ID must survive that.
- `g:price` 5550 is the MRP actually shown struck-through on the page, `g:sale_price` 5350 is what a shopper pays. Do not invert them. If the "MRP Value" arithmetic is not a real historical price, drop `price`/`sale_price` to a single 5350 and stop advertising a discount you cannot substantiate — Google compares the two against the landing page. (→ 6324371, 6324471)
- `g:shipping` at item level is the last resort. Google's own guidance: "Use account shipping settings in Merchant Center first. Use the `shipping` attribute only as a last resort to override the settings you create at the account level." (→ 6324484) The block is included here only to show the shape; in production configure one India shipping service in Merchant Center or Search Console.
- `g:identifier_exists` `no` is honest today. It is also a ranking disadvantage: Google's knowledge-panel guidance for India specifically says to "provide strong product identifiers (GTIN, MPN+Brand) … to be added correctly into the knowledge panel" (→ 13889434).

A second worked shape, for the pre-order case (`…/porsche-911-gt3-r-2026-gt-world-challenge-asia-mandalika`, tagged PRE-ORDER with 20 % off):

```xml
<g:availability>preorder</g:availability>
<g:availability_date>2026-12-15T00:00+0530</g:availability_date>
<g:price>1999.00 INR</g:price>
```

The date must be a real ETA from the supplier, held in a new `preorderEta DateTime?` column. Without that column, pre-order items cannot be submitted at all — `availability_date` is required once `availability` is `preorder` (→ 6324470), and the store currently has no field to hold it.

### 2.4 Image requirements

Verified from the `image_link` page (rendered in full):

> "We recently announced new image size requirements of at least **500 x 500 pixels** for all products beginning **January 31, 2027**. However, to ensure best performance in all listing formats, we recommend that you provide images **1500x1500 pixels** or above."

Rejected patterns (same page, verbatim categories): promotional text overlays such as "New" or "2-piece set"; "Barcodes and tracking codes: UPC barcodes, QR codes, or serial tags overlaid on the photo"; "Overlays and watermarks: Stock photo watermarks, copyright symbols, or graphic stamps"; "Added brand, manufacturer, or retailer names and logos: Superimposed logos or store names added in post-production (allowed only if they are an inherent, physical part of the product itself)"; and "Don't use a placeholder, generic image, or graphic that doesn't show your product".
→ https://support.google.com/merchants/answer/6324350

**Concretely for this site:** the product pages serve images through Next's optimiser (`/_next/image?url=…&w=3840&q=75`). That URL is publicly fetchable and stable enough, but the feed should point at the **underlying Vercel Blob URL** instead, because it is immutable, has no `w`/`q` parameters, and cannot be broken by an `images.remotePatterns` change in `next.config.js`. Blob URLs are already public (they are rendered to anonymous browsers today).

Also: the first `<img>` on every product page is the site logo (`/diecast-heaven-logo.png`), and most products have exactly one real photo. Do not submit the logo; do submit at least one real photo, and treat "add a second and third photo" as a per-product content task, not a feed task.

### 2.5 Availability mapping from the data model

`status ∈ {DRAFT, PUBLISHED, SOLD_OUT}`, `orderType ∈ {RTD, PRE_ORDER}`, `stock Int`.

| status | orderType | stock | `g:availability` | Notes |
|---|---|---|---|---|
| DRAFT | any | any | — | Exclude from feed entirely. |
| PUBLISHED | RTD | > 0 | `in_stock` | Normal case. |
| PUBLISHED | RTD | 0 | `out_of_stock` | Page must also show sold-out, or it is a mismatch (→ 6324448). |
| PUBLISHED | PRE_ORDER | any | `preorder` + `availability_date` | Requires the new ETA column. |
| SOLD_OUT | any | any | `out_of_stock` | Legitimate value. Google's caution is about *discontinued* items: "For permanently discontinued products, delete them entirely from your data source rather than setting them to out of stock" (→ 6324448). One-off collector stock that will never return should be **removed from the feed**, not marked out of stock. |

That last row is a real decision for a shop that sells single units: a sold-out Boulevard casting is never coming back, so ~every `SOLD_OUT` row is a deletion, not an `out_of_stock`. Keeping them inflates the catalogue and drags the account's data-health signal down.

### 2.6 Identifier strategy (gtin/mpn when the columns do not exist)

There is no `gtin`, no `mpn`, no `sku`, no `condition` in `prisma/schema.prisma`. Three options, ranked:

1. **Ship `identifier_exists=no` now** (honest, works, small ranking penalty) and add `gtin String?` + `mpn String?` to `Product` for future data entry. Mattel prints a UPC on every Boulevard/Premium card; Amazon.in exposes them (`UPC 194735336531`). These are facts about the product that can be transcribed once per casting and reused across colourway variants.
2. **Use the casting code as `mpn`.** Several titles already embed a real manufacturer code — `LCD64039-WB`, `LCD64046-GR`, `LCD64031-VB`, `LCD64049-BU` for LCD models. That is a legitimate MPN with a real brand (`LCD`), and it is the cheapest high-value identifier available. Requires `brand` to be correct first (currently the brand row is `LCD`, which happens to be right).
3. **Do not invent GTINs.** A wrong GTIN matches the offer to another merchant's product and causes mismatched-value disapprovals that are painful to unwind.

`identifier_exists` must never be combined with a submitted `gtin` — that contradiction is a classic disapproval (→ 6324478).

### 2.7 Next.js implementation

**Route:** `app/feed/google-merchant.xml/route.ts` → serves `/feed/google-merchant.xml`.
A dot in a static segment is legal in the App Router; if the build is fussy about it, `app/feed/google-merchant/route.ts` + `robots`/`sitemap` rename is an equivalent fallback.

Three files, following the patterns already in the repo (`lib/queries.ts` uses `unstable_cache` with tags, and exports a `revalidateTag` wrapper that also clears the local memory cache).

**1. Mapping layer — `lib/feed/merchant.ts`**

```ts
import type { ProductWithRelations } from '@/lib/types'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.diecastheavenudaipur.in'
const BASE = SITE.replace(/\/$/, '')

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;').replace(/'/g, '&apos;')

/** Google wants the manufacturer brand, not the series name. */
const BRAND_FIX: Record<string, string> = {
  HOTWHEELS: 'Hot Wheels',
  'HOTWHEELS PREMIUM': 'Hot Wheels',
  'HOT WHEELS SILVER SERIES': 'Hot Wheels',
  MAJORETTE: 'Majorette',
  MATCHBOX: 'Matchbox',
  LCD: 'LCD',
  CCA: 'CCA',
  'INNO 64': 'Inno64',
  KINSMART: 'Kinsmart',
  'POP RACE': 'Pop Race',
}

const inr = (n: number) => `${n.toFixed(2)} INR`

export function availability(p: ProductWithRelations) {
  if (p.orderType === 'PRE_ORDER') return { value: 'preorder', date: p.preorderEta }
  if (p.status === 'SOLD_OUT' || (p.stock ?? 0) <= 0) return { value: 'out_of_stock', date: null }
  return { value: 'in_stock', date: null }
}

export function toItem(p: ProductWithRelations): string | null {
  const price = p.price ?? p.offerPrice
  const image = p.images?.[0]?.imageUrl
  // Google requires a price greater than zero and an image.
  if (!price || price <= 0 || !image) return null

  const { value: avail, date } = availability(p)
  const brand = BRAND_FIX[p.brand?.name?.toUpperCase() ?? ''] ?? p.brand?.name ?? ''
  const sale = p.offerPrice && p.price && p.offerPrice < p.price ? p.offerPrice : null

  const parts = [
    `<g:id>${esc(p.id)}</g:id>`,
    `<g:title>${esc(p.title.slice(0, 150))}</g:title>`,
    `<g:description>${esc((p.description || p.shortDesc || p.title).slice(0, 5000))}</g:description>`,
    `<g:link>${esc(`${BASE}/product/${p.slug}`)}</g:link>`,
    `<g:image_link>${esc(image)}</g:image_link>`,
    `<g:availability>${avail}</g:availability>`,
    date ? `<g:availability_date>${date.toISOString()}</g:availability_date>` : '',
    `<g:price>${inr(p.price ?? price)}</g:price>`,
    sale ? `<g:sale_price>${inr(sale)}</g:sale_price>` : '',
    `<g:condition>new</g:condition>`,
    brand ? `<g:brand>${esc(brand)}</g:brand>` : '',
    p.gtin ? `<g:gtin>${esc(p.gtin)}</g:gtin>` : '<g:identifier_exists>no</g:identifier_exists>',
    p.mpn ? `<g:mpn>${esc(p.mpn)}</g:mpn>` : '',
    `<g:google_product_category>3551</g:google_product_category>`,
    `<g:product_type>${esc(productType(p))}</g:product_type>`,
    `<g:item_group_id>${esc(p.itemGroupId ?? p.id)}</g:item_group_id>`,
    p.scale ? `<g:custom_label_0>${esc(p.scale)}</g:custom_label_0>` : '',
    `<g:custom_label_1>${esc(p.orderType.toLowerCase())}</g:custom_label_1>`,
  ]
  return `  <item>\n    ${parts.filter(Boolean).join('\n    ')}\n  </item>`
}
```

Two details that cause silent bugs: `&` and `>` inside `product_type` **must** be escaped (`&amp;`, `&gt;`), and a bare `&` anywhere makes the whole file unparseable — Merchant Center will reject the fetch with no useful error. Also, no CDATA: Google's parser handles it, but escaping is safer and keeps the file diffable.

**2. Data access — add to `lib/queries.ts`** (same shape as its neighbours, so tag invalidation keeps working):

```ts
const getFeedProductsRaw = (): Promise<ProductWithRelations[]> =>
  safeQuery(
    prisma.product.findMany({
      where: { status: 'PUBLISHED' },        // SOLD_OUT handled as deletions
      include: { brand: true, categories: { include: { category: true } }, images: { take: 1 } },
      orderBy: { sortOrder: 'asc' },
    }) as Promise<ProductWithRelations[]>,
    []
  )

export const getFeedProducts = cache(
  safeUnstableCache(getFeedProductsRaw, ['feed-products'], { tags: ['products'] })
)
```

Reusing the existing `['products']` tag means every admin product write that already calls `revalidateTag('products')` refreshes the feed too — no new hook needed for correctness. Note `images: { take: 1 }` — full image arrays are what blew past the 2 MB data-cache limit that `safeUnstableCache` exists to work around.

**3. The route — `app/feed/google-merchant.xml/route.ts`**

```ts
import { getFeedProducts } from '@/lib/queries'
import { toItem } from '@/lib/feed/merchant'

export const revalidate = 3600          // hourly; cheap for 222 items
export const dynamic = 'force-static'   // never per-request DB traffic

export async function GET() {
  const products = await getFeedProducts()
  const items = products.map(toItem).filter(Boolean).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Diecast Heaven Udaipur</title>
    <link>https://www.diecastheavenudaipur.in</link>
    <description>Diecast collector cars from Udaipur, Rajasthan</description>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
```

**Caching and revalidation strategy, precisely:**

- `revalidate = 3600` bounds staleness from the CDN. Product writes invalidate immediately **if** the admin path calls `revalidateTag('products')` — `lib/queries.ts` already wraps that helper and clears the memory cache, so this is plumbing that exists.
- Add an explicit admin hook rather than relying on incidental calls: after any product create/update/delete, `POST /api/admin/revalidate?tag=feed`. If such an endpoint already exists for products, `revalidateTag('products')` inside it is sufficient and nothing new is needed.
- Do **not** put the feed behind `/api/`: `robots.ts` disallows `/api/analytics` and `/api/track` only, but a future `/api/*` disallow would silently kill the feed, and Merchant Center reports a blocked fetch as an unhelpful error.
- Register the URL in Merchant Center as a scheduled fetch (`https://www.diecastheavenudaipur.in/feed/google-merchant.xml`), daily. Google's fetch requirements are explicit: the URL must point directly at the file, must not be an HTML page, and "Googlebot" and "AdsBot-Google" must not be blocked in that directory (→ 14991445). Current `robots.ts` allows `*` on `/`, so nothing needs changing — but the `NEXT_PUBLIC_SITE_URL` fallback to `localhost` that breaks the sitemap would equally break `g:link` and `g:image_link` if it were used here. Hard-code the production origin (as in the snippet above) instead of trusting the env var, until the env fix lands.

**Sanity gate:** before registering the feed, fetch it and assert `item` count ≈ 222 (minus drafts and sold-out deletions), zero `NaN`, zero `<g:price>0`, and every `g:link` returning 200. A five-line script in CI is cheaper than a Merchant Center disapproval loop.

---

## 3. Product page optimisation for commercial intent

### 3.1 Where the pages stand today

Measured on six live product pages (Hot Wheels Premium ×3, Hot Wheels Silver Series, Majorette, LCD):

| Element | Current | Problem |
|---|---|---|
| `<title>` | `🐴 LANCIA DELTA S4 - Hotwheels Premium Thrill Climber \| Diecast Heaven` | Emoji prefix on every title; eats ~2 chars of SERP width and reads as gimmick to a merchant reviewer (→ 6149970 "gimmicky use of … symbols") |
| `meta description` | identical to the title | Zero unique selling copy; Google will rewrite it anyway |
| `<link rel=canonical>` | **absent on every page** | Filtered URLs (`/catalog?brand=…`) are already indexed; without canonicals the product/brand relationship is ambiguous |
| `h1` | matches title | Fine, but duplicates the `<title>` token-for-token |
| JSON-LD | **0 blocks on every page** | No `Product`, no `Offer`, no `BreadcrumbList`, no `LocalBusiness` |
| Internal links into catalogue | `/catalog` renders **12** product links and no pagination controls | 210 of 222 products are reachable only via the sitemap |
| Description body | often a single line = the title (`LANCIA DELTA S4 - Hotwheels Premium Thrill Climber`) | Thin/duplicate content; no spec table |
| Images | 1 real photo, logo also in DOM | Not enough for merchant quality signals |
| `/contact` | **404** (nav still links to it) | Breaks the checkout policy's "how to contact you" requirement (→ 9158778) |

### 3.2 Title formula

`[Model] — [Brand line] [Series] [Scale] [collector qualifier] | Diecast Heaven`

Order matters: model first, because that is what the query contains ("lancia delta s4 hot wheels premium"). Brand line second, scale third, collector qualifier last. No emoji, no ALL-CAPS, no price, no "FREE SHIPPING", ≤60 visible chars where possible (Google truncates on width, not characters).

Real products, before → after:

| Live product | Current title | Proposed |
|---|---|---|
| `lancia-delta-s4-hotwheels-premium-thrill-climber` | `🐴 LANCIA DELTA S4 - Hotwheels Premium Thrill Climber \| Diecast Heaven` | `Lancia Delta S4 — Hot Wheels Premium Thrill Climbers 1:64 \| Diecast Heaven` |
| `2024-toyota-tacoma-trd-pro-hotwheels-premium-road-trip` | `🐴 2024 TOYOTA TACOMA TRD PRO - Hotwheels Premium Road Trip` | `2024 Toyota Tacoma TRD Pro — Hot Wheels Premium Road Trip 1:64` |
| `mercedes-benz-300-sl-hotwheels-silver-series-vintage-club-1968-imported-` | `🐴 MERCEDES-BENZ 300 SL - Hotwheels Silver Series Vintage Club 1968 * Imported *` | `Mercedes-Benz 300 SL — Hot Wheels Silver Series Vintage Club 1968, Imported` |
| `hotwheels-premium-boulevard-combo-set` | `🐴 HOTWHEELS PREMIUM BOULEVARD COMBO SET` | `Hot Wheels Premium Boulevard Set of 5 + 2 Team Transport 1:64` |
| `pagani-utopia-1-64-scale-white-with-bluecarbon-lcd64039-wb` | `🐴 Pagani Utopia, 1:64 Scale (White with bluecarbon) - LCD64039-WB` | `Pagani Utopia — LCD 1:64, White/Blue Carbon (LCD64039-WB)` |
| `majorette-motorsport-dtm-deluxe-cars-set-of-6-no-single-free-shipping-` | `🐴 Majorette Motorsport DTM Deluxe Cars Set of 6 ( no single ) - FREE SHIPPING` | `Majorette Motorsport DTM Deluxe — Set of 6 Cars, 1:64` |

Rules encoded in those examples: "Hotwheels" → "Hot Wheels" (the split spelling is what people type and what Mattel uses); "* Imported *" loses its asterisks and becomes a trailing qualifier; the model number is kept where it is a genuine identifier (`LCD64039-WB`) because that is a high-intent query token.

### 3.3 Meta description formula

`[Model] in [scale] from [series/brand line] — ₹[price], [stock state]. [One differentiator: imported / sealed / carded / set size]. Order from Udaipur on WhatsApp.` ≤155 chars.

Example (Tacoma): `2024 Toyota Tacoma TRD Pro from Hot Wheels Premium Road Trip, 1:64 scale — ₹650. Imported, sealed card. Sourced by a collector in Udaipur, ships across India.`

The price in the description is legitimate for organic (it raises CTR) and must simply stay in sync — which the same DB row guarantees.

### 3.4 H1, thin content, internal linking

- **H1:** one per page, model-first, no emoji, no brand-name suffix duplication with `<title>`.
- **Thin content:** the Lancia page's entire description is the title. Threshold to aim for is ~120–200 words of *unique* text per product, structured as: what it is (series, year, casting), scale and materials, what's in the box, condition (sealed card / blister / loose), import status, and who it suits. Do not auto-generate from the title — a templated 150-word block × 222 products is exactly the thin-content pattern quality gates exist to catch. Prioritise: write real copy for the top ~30 SKUs by search demand (Premium, Silver Series, Boulevard, popular JDM/Euro castings), leave the rest at a shorter but honest template with a spec table.
- **Spec table** on every product: Scale, Brand line, Series, Year, Casting code, Condition, Packaging, Stock status. This is the cheapest way to add unique-per-product text that Google can parse, and it mirrors the `Product` schema fields.
- **Internal linking:** every product needs (a) breadcrumb `Home > Brand > Series > Product`, (b) 4 related products (the query exists: `getRelatedProducts`), (c) links up to its brand page and series page. Fixing `/catalog` pagination is a prerequisite — right now the catalogue hub links 12 items.

### 3.5 The crawlable route architecture this site is missing

Today: facets are query parameters — `/catalog?brand=hotwheels`, `/catalog?brand=hotwheels-premium`, `/catalog?category=imported`. Verified behaviour: the slugs are `hotwheels`, `hotwheels-premium`, `majorette`, `lcd`, `cca`, `matchbox`, `kinsmart`, `inno-64`, `pop-race`; `/catalog?brand=hot-wheels` renders "No products available" (a soft 404 that Google has indexed variants of). Each facet page is also parameter-equivalent duplicate content with no canonical.

Proposed structure:

```
/brands                      → index of all brands (real links, not a dropdown)
/brands/hot-wheels           → brand hub: what Hot Wheels is, mainline vs Premium vs
                               Silver Series, link to series pages, 24 products
/brands/hot-wheels/premium   → series landing page (the money page for
                               "hot wheels premium india")
/brands/hot-wheels/silver-series
/brands/majorette
/brands/lcd
/categories/imported         → existing category rows, promoted to real URLs
/categories/collectable
/categories/5-pack-gift-pack
/series/boulevard            → optional, only if content justifies it
/product/[slug]              → unchanged
```

Implementation notes:

- Build them from the tables that already exist (`Brand.slug`, `Category.slug`) — no schema change, just routes + `generateStaticParams` + `generateMetadata`.
- **Migration, not duplication:** add `canonical` on the param pages pointing at the new landing page for a few weeks, then 301 `/catalog?brand=hotwheels` → `/brands/hot-wheels`, `/catalog?category=imported` → `/categories/imported`. Do the 301 after the landing pages are indexed, or you lose the equity the params already earned.
- `/brands` and `/brands/[slug]` need real copy (2–4 paragraphs) or they become doorway pages. A brand hub with one product grid and no text is a thin page that competes with itself.
- Keep `/catalog` as the faceted search surface, canonicalised to itself with `noindex` on multi-facet combinations (`?brand=x&category=y&orderType=PRE_ORDER&page=3`), index only the clean single-facet URLs until the 301s land.
- Fix the two URL defects while touching routing: the seven slugs ending in `-`, and `hotwheels-m-case-2026-indian-` (looks truncated). 301 them to clean slugs **and** keep `g:id` stable so the feed does not see them as new products.

### 3.6 Structured data to add (server-rendered, in the initial HTML)

From https://developers.google.com/search/docs/appearance/structured-data/merchant-listing:

- `Product` with `name`, `image[]`, `description`, `brand`, `sku`/`mpn` where known, `offers` as a single **`Offer`** (not `AggregateOffer` — "merchant listings require an `Offer`").
- Inside `Offer`: `price` (>0), `priceCurrency: "INR"`, `availability` (`InStock` / `PreOrder` / `OutOfStock` / `SoldOut`), `itemCondition`, `url`, `priceValidUntil` for the sale window, plus the recommended `shippingDetails` and `hasMerchantReturnPolicy`.
- `BreadcrumbList` matching the visible breadcrumb (the page already renders `Home/Catalog/<title>` as text — it just isn't marked up).
- Site-wide `Organization` + `LocalBusiness` (`Store`) with NAP for §5.
- Put it in the server component, not a client effect: "If you're a merchant optimizing for all types of shopping results, we recommend putting `Product` structured data in the initial HTML", and "dynamically-generated markup can make Shopping crawls less frequent and less reliable".

Sale pricing encoding (relevant: every discounted product shows a struck-through price): the active price goes in `price`, and the struck-through original goes in `priceSpecification` with `priceType: "https://schema.org/StrikethroughPrice"`. Do not put both in `price`-like properties.

---

## 4. Competitive reality

### 4.1 What Amazon and Flipkart actually win on

Verified on 12 Nov 2026 for the *same* product families this shop stocks:

- **Amazon.in** lists Hot Wheels Boulevard 1:64 cars at `₹689`, `₹729`, `₹999`, `₹1,455`, `₹1,489` against MRPs of `₹999`–`₹2,999`, with `UPC 194735336531` published, sold via "Gracious Aura / ships from Amazon Fulfillment", and delivery dates ("Get it by Friday, August 21"). Multiple listings show "Only 2 left in stock".
- **Flipkart** lists Majorette sets at `₹899` (Vision Gran Turismo 5-pack, **Sold Out**), `₹2,998` (Set of 6 Volvo construction, `₹3,299` MRP, `₹65` delivery, "Delivery by 17 May"), `₹659` (Hyundai i20 WRC), `₹447` (Porsche 911 GT3 RS, **Sold Out**). Every listing carries "**7 Days Return Policy**", COD availability, and a seller rating ("The Hobby Heaven Toys 4.2").

The structural advantages, in order of how hard they are to beat:

1. **Identifiers + reviews.** Amazon has the GTIN, the ratings, and the review volume. That combination wins the knowledge panel and the "popular products" unit, and it supplies the social proof that a zero-review shop cannot fake.
2. **Price credibility at scale.** "₹689 with 77 % savings" sets a reference price in the shopper's head that a single-unit collector shop cannot match on a like-for-like casting.
3. **Fulfilment promise.** A concrete delivery date beats "Calculated on WhatsApp" every time, both for shoppers and for Google's landing-page quality signals.
4. **Breadth of the long tail.** Amazon has thousands of castings, so almost any model query has a listing.

### 4.2 Where they are weak — the five query classes this shop can win

The asymmetry is **depth and specificity**, not price. Amazon's titles are keyword-stuffed and generic ("Hot Wheels Boulevard™ '17 Ford GT Premium 1:64 Scale Sports Car, Full Metal Body Construction & Real Riders™ Tires") and its stock on collector lines is thin ("Only 2 left", "Sold Out" on Flipkart). A specialist shop with one page per casting, real photos of the actual item, and honest stock can own:

| Query class | Example | Why a shop wins it |
|---|---|---|
| **Exact casting + series** | `hot wheels premium lancia delta s4 thrill climbers` | Amazon's equivalent listing may not exist; the shop has the exact item with the exact series name in title + H1 + URL |
| **Model/casting code** | `lcd64039`, `lcd64046-gr` | Nobody optimises for these; they are in the shop's own titles already, and they are pure purchase intent |
| **Price-India** | `hot wheels premium price in india` | requires an indexed page with a visible INR price and no "contact us" wall |
| **In-stock-India** | `hot wheels premium boulevard in stock india` | Amazon is frequently out; the shop can say "in stock, ships from Udaipur today" |
| **Set / bundle / sealed** | `sealed set of 5 hot wheels boulevard`, `majorette dtm set of 6` | Sets are where marketplaces fragment listings into singles; the shop sells the set as one SKU |
| **Imported / carded** | `imported hot wheels india`, `carded hot wheels silver series` | Collector vocabulary that marketplaces do not use in titles |
| **Local intent** | `diecast cars udaipur`, `hot wheels shop udaipur` | unwinnable for Amazon, winnable in a week with a GBP |
| **Series explainers** | `hot wheels silver series vs premium`, `what is hot wheels boulevard` | informational, feeds the money pages, no marketplace competition |

### 4.3 Keyword → target page map (products verified on the live catalogue)

Do not invent SKUs; every product below was fetched from `https://www.diecastheavenudaipur.in/product/<slug>` during this audit.

| Query | Target page | Status today |
|---|---|---|
| `hot wheels premium boulevard set of 5` | `/product/hotwheels-premium-boulevard-combo-set` | exists, ₹5,350 (₹5,550 struck) |
| `hot wheels premium lancia delta s4` | `/product/lancia-delta-s4-hotwheels-premium-thrill-climber` | exists, ₹550 |
| `2024 toyota tacoma trd pro hot wheels premium` | `/product/2024-toyota-tacoma-trd-pro-hotwheels-premium-road-trip` | exists, ₹650, **sold out** |
| `hot wheels silver series vintage club mercedes 300 sl` | `/product/mercedes-benz-300-sl-hotwheels-silver-series-vintage-club-1968-imported-` | exists, imported |
| `majorette dtm deluxe set of 6` | `/product/majorette-motorsport-dtm-deluxe-cars-set-of-6-no-single-free-shipping-` | exists, pre-order |
| `pagani utopia lcd 1:64` | `/product/pagani-utopia-1-64-scale-white-with-bluecarbon-lcd64039-wb` | exists, LCD64039-WB |
| `hot wheels premium india online store` | `/brands/hot-wheels/premium` | **page does not exist** — highest-value missing page |
| `hot wheels silver series india` | `/brands/hot-wheels/silver-series` | **missing** |
| `lcd models 1:64 india` | `/brands/lcd` | **missing** (21 products in catalogue) |
| `imported diecast cars india` | `/categories/imported` | **missing** (param only) |
| `hot wheels m case 2026 india` | `/product/hotwheels-m-case-2026-indian-` | exists, but slug is truncated-looking |
| `majorette cars india` | `/brands/majorette` | **missing** (9 products) |
| `diecast cars udaipur` | GBP + `/about` or a real `/contact` | **/contact is 404** |

The pattern: the product pages exist and are the right target for casting-level queries; the *series* and *brand* pages — where the commercial head terms live — do not exist at all. That is the single largest organic gap on the site and it is entirely within the team's control.

---

## 5. Local SEO

**Should a GBP exist? Yes, and it is the highest-priority item in this report** — not because of classic local pack traffic, but because a verified Business Profile is the *gate* to free local listings, the only Shopping-adjacent surface this shop is eligible for today without changing its checkout (§1.3).

How it connects:

1. Verified GBP with a **store code** → Merchant Center can be linked to it (→ 13869896, 15182106).
2. Product feed + local inventory feed → in-store availability appears in the Shopping tab's local results, Maps, and "the products module on Business Profile" (→ 13889434).
3. Same GBP feeds the local pack for `diecast cars udaipur`, `hot wheels shop udaipur`, `toy shop udaipur` — queries Amazon cannot enter.
4. The GBP's product module and the site's `Product` schema reinforce each other; Google's own merchant-listing doc ties the knowledge panel to both.

**NAP consistency requirements.** Google requires the store address to be "physically accessible to customers" with "a valid address" for local inventory to match (→ 15077749). Concretely, these four strings must be byte-identical:

- GBP name, address, phone
- site footer / a real `/contact` page (currently **404** — fix first)
- `LocalBusiness`/`Store` JSON-LD (`name`, `address` with `streetAddress`/`addressLocality: "Udaipur"`/`addressRegion: "Rajasthan"`/`postalCode`, `telephone`, `openingHoursSpecification`)
- Instagram (`@diecast_heaven_udaipur`) and YouTube ("Diecast Heaven - Udaipur") bios

**Two naming problems to resolve before creating the profile:**

1. **"Contact" exists in the nav but 404s.** A profile that points at a dead contact page is a verification and a trust problem. Ship the page first.
2. **Name collision.** There is at least one other business trading as "Diecast Heaven" (a "Diecast Heaven - by UTOYS" page describing itself as official Mattel licensed merchandise, and an unrelated `@diecast_heaven254`). Use a distinguishable profile name — `Diecast Heaven Udaipur` — and never "Hot Wheels Udaipur": using a trademark you do not own in a business name is a Google suspension risk and a Mattel legal risk.

**Hours are already published** on `/about` (Mon–Sat 10:00–20:00, Sun 10:00–18:00). Reuse them verbatim in the profile and in schema; a mismatch between the site and the profile is a classic local ranking drag.

**Reviews.** No review surface exists on the site and none is visible for the business. The post-purchase WhatsApp thread is the natural ask point ("if the car arrived well packed, a Google review helps other collectors find us"), with a deep link to the profile. Do not gate reviews behind a discount — incentivised reviews must be disclosed, and undisclosed ones are a policy violation (→ the `aggregateRating` guidance in the ecommerce skill's validation rules; Google's structured-data policy forbids fake or undisclosed incentivised reviews).

---

## 6. Prioritised action list

### Doable now, with current infrastructure (no business decision required)

| # | Action | Why | How we'd know it failed |
|---|---|---|---|
| 1 | Ship `Product` + `Offer` + `BreadcrumbList` + `Organization`/`Store` JSON-LD, server-rendered | Zero structured data today; this is the only path to product snippets and merchant listings and needs no approvals | Rich Results Test / Search Console "Merchant listings" report still shows zero eligible items after 4 weeks |
| 2 | Add `rel=canonical` to product and catalogue pages; `noindex` multi-facet combos | Canonicals are absent on every page while parameterised facets are already indexed | Param URLs keep appearing in GSC "Pages > Indexed" |
| 3 | Set shipping + returns in **Search Console → Settings → Shopping** (no Merchant Center account needed) | Satisfies the shipping/returns signal for merchant listings at zero infra cost; verified at 14907594 | Policies stay "pending"/rejected after 2 weeks |
| 4 | Publish `/shipping`, `/returns`, `/contact`, `/terms` pages | Checkout policy explicitly requires return/refund/T&C/contact info; `/contact` is 404 today | — (binary) |
| 5 | Ship `/feed/google-merchant.xml` per §2.7 | Feed is a prerequisite for both the local and national paths, and is harmless to publish before the account exists | Feed returns <200 items or any `NaN` / zero price |
| 6 | Clean titles/metas per §3.2–3.3 (remove 🐴, "FREE SHIPPING", ALL-CAPS, duplicate meta) | Editorial policy risk (6149970) + CTR | Titles still contain "FREE" in GSC after deploy |
| 7 | Build `/brands`, `/brands/[slug]`, `/categories/[slug]` | Converts already-indexed query params into real landing pages; head terms have no page at all | New URLs indexed but zero impressions after 6 weeks |
| 8 | Fix `/catalog` pagination (12 of 222 products linked) | Crawl depth; 210 products depend on the sitemap alone | GSC crawl stats show no improvement in discovered-not-indexed |
| 9 | Write real copy + spec tables for the top ~30 SKUs | Thin content is the main reason a product page loses to Amazon despite better specificity | Indexed pages with <100 words remain the majority |
| 10 | Resolve `NEXT_PUBLIC_SITE_URL` (owned by another workstream) and hard-code the feed's base URL meanwhile | Feed `link`/`image_link` must not inherit the localhost fallback | `g:link` values contain `localhost` |

### Needs a business decision or new infrastructure

| # | Action | Decision / dependency | Risk if skipped |
|---|---|---|---|
| 11 | Create + verify **Google Business Profile** with store code | Owner must supply exact address, phone, and be willing to be publicly listed | Free local listings stay unavailable; no local pack entry. **Blocking for Tier A** |
| 12 | Open Merchant Center, link to GBP, register product feed + local inventory feed | Needs 11; needs someone to own feed health weekly | Account sits in "Needs attention" and nothing serves |
| 13 | Decide fixed shipping: flat ₹X or free above ₹Y | Owner. Currently "Calculated on WhatsApp", which cannot be encoded as `shipping` | India shipping attribute cannot be filled → national free listings impossible |
| 14 | Decide return window + who pays return freight, publish it | Owner. Flipkart's benchmark on these SKUs is 7 days | Return policy missing → policy non-compliance (13889434) |
| 15 | Build a real on-site checkout step: address + payment choice + shipping cost + delivery estimate + order-confirmation page with an order ID. WhatsApp stays as the notification channel | Engineering + owner (13, 14). This is the blocker for the national Shopping grid | Submitting the national feed without it risks a "Checkout incomplete" suspension (10249082) |
| 16 | Add `preorderEta`, `gtin`, `mpn`, `itemGroupId` columns to `Product` | Small migration; ETA needs supplier commitments | Pre-orders cannot be fed (`availability_date` required), and identifier quality stays at zero |
| 17 | Local inventory feed from real shelf stock (exclude pre-orders) | Depends on 11 + an actual stock discipline in the admin | Availability mismatches on 60 %+ of the catalogue |
| 18 | Review-collection loop via WhatsApp | Owner willingness to ask | No social proof; snippets stay rating-less |

### Sequencing

`4 → 1 → 2 → 3 → 6` (all dev, no dependencies, ~1 week) → `11` in parallel (Google-controlled latency) → `5 → 12` → `7 → 8 → 9` (organic growth) → `13, 14 → 16 → 15 → 17` (the national push).

Ship in that order: the first block removes every *policy* blocker that is free to remove, the second unlocks the local surface, and the third is the only part that needs the owner to change how the business takes money.

---

## Appendix A — Google sources fetched for this report

| Claim | URL |
|---|---|
| Shopping tab available in India; INR supported | https://support.google.com/merchants/answer/160637 |
| Checkout must exist; COD/invoicing/collection accepted; confirmation page + delivery estimate required | https://support.google.com/merchants/answer/10249082 |
| Checkout best practices; door-to-door or collection-point delivery; return/T&C/contact visible | https://support.google.com/merchants/answer/9158778 |
| Free listings eligibility; return policy on site; **shipping required in India** | https://support.google.com/merchants/answer/13889434 |
| Free listings policies (prohibited practices, site requirements) | https://support.google.com/merchants/answer/12073010 |
| **LIA / free local listings exempt from online payment and shipping requirements**; brick-and-mortar required; India supported | https://support.google.com/merchants/answer/3271956 |
| Product data specification | https://support.google.com/merchants/answer/7052112 |
| RSS 2.0 format; namespace `http://base.google.com/ns/1.0` | https://support.google.com/merchants/answer/14987622 |
| Missing-namespace warning | https://support.google.com/merchants/answer/16693405 |
| File formats and 4 GB limit | https://support.google.com/merchants/answer/12631822 |
| Quotas: 5M items per source, 200 sources, 100 uploads/day | https://support.google.com/merchants/answer/16564100 |
| Scheduled fetch requirements (direct file URL, Googlebot/AdsBot access) | https://support.google.com/merchants/answer/14991445 |
| `image_link` — 500×500 from 2027-01-31, watermark/promo/placeholder bans | https://support.google.com/merchants/answer/6324350 |
| `price` — must include tax outside US/CA; regional pricing; no shipping in price | https://support.google.com/merchants/answer/6324371 |
| GST must be included in price (India) | https://support.google.com/merchants/answer/14819809 |
| `sale_price` | https://support.google.com/merchants/answer/6324471 |
| `availability` values + mismatch disapproval | https://support.google.com/merchants/answer/6324448 |
| `availability_date` **required** for preorder/backorder | https://support.google.com/merchants/answer/6324470 |
| `condition` supported values | https://support.google.com/merchants/answer/6324469 |
| `identifier_exists` = `no`/`false` | https://support.google.com/merchants/answer/6324478 |
| `google_product_category` taxonomy behaviour | https://support.google.com/merchants/answer/6324436 |
| `shipping` attribute; **India in required list**; account settings first | https://support.google.com/merchants/answer/6324484 |
| Return policies for Shopping ads and free listings; must be publicly accessible | https://support.google.com/merchants/answer/14011730 |
| Search Console shipping & returns **without** a Merchant Center account | https://support.google.com/webmasters/answer/14907594 |
| Search Console policies precedence / migration on MC onboarding | https://support.google.com/merchants/answer/14886954 |
| Landing page must show title, description, image, price, currency, availability, buy button | https://support.google.com/merchants/answer/2700318 |
| Editorial policy — "gimmicky … FREE" | https://support.google.com/merchants/answer/6149970 |
| Merchant listing structured data; required/recommended properties; "only pages where a shopper can purchase" | https://developers.google.com/search/docs/appearance/structured-data/merchant-listing |
| Product snippet structured data | https://developers.google.com/search/docs/appearance/structured-data/product-snippet |
| Local inventory data spec: `store_code`, `id`, `quantity`, `price`, `availability` | https://support.google.com/merchants/answer/14819809 |
| `store_code` must match Business Profile | https://support.google.com/merchants/answer/13869896 |
| Uploading local inventory data; id must match primary feed | https://support.google.com/merchants/answer/15182106 |
| Invalid store code → Business Profile address/verification | https://support.google.com/merchants/answer/15077749 |
| Google product taxonomy file (node `3551`) | https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt |

## Appendix B — Explicitly unverified

1. **Whether Google would accept a wa.me handoff as a valid checkout.** No documentation addresses messaging-app checkout. The policy text permits non-card payment but demands an on-site confirmation page and delivery estimate; I found no ruling either way on messaging handoff. Do not present this as settled.
2. **Whether a Google Business Profile already exists** for this store. Search surfaced Instagram (`@diecast_heaven_udaipur`), a YouTube channel ("Diecast Heaven - Udaipur") and an unrelated "Diecast Heaven - by UTOYS", but no profile I could confirm as this business. Verify directly in Business Profile Manager.
3. **Current indexation state** of the `?brand=` / `?category=` parameter URLs (stated as already indexed in the brief; not re-measured here — no Search Console access in this session).
4. **Real GTINs for the LCD/F1/Boulevard castings** — Amazon.in shows one UPC for one Boulevard car; I did not verify a GTIN for any product this shop sells, and none should be submitted without reading the packaging.
5. **India-specific minimum return window.** Google's return-policy pages reference per-country minimums without publishing an India figure I could confirm; the policy must exist and be linked regardless. Treat 7 days (the Flipkart benchmark on these SKUs) as commercial, not regulatory, guidance.
6. **Whether `free listings` serve in the Shopping tab for a merchant whose entire catalogue is pre-order/sold-out.** The pre-order path is documented (`preorder` + `availability_date`) but its commercial performance in India is unknown.
