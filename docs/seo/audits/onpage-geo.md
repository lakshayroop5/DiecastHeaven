# On-page + GEO audit — Diecast Heaven Udaipur

**Date:** 12 November 2026
**Scope:** how this catalogue earns visibility in AI search (AI Overviews, AI Mode,
ChatGPT, Perplexity) and what on-page content is missing. Structured data,
canonicals, sitemaps and Merchant Center are covered in `implementation.md`,
`schema.md` and `ecommerce.md` — not repeated here.

**Measured on the live site (12 Nov 2026):** product pages render ~210 words of
extractable text, essentially zero body copy (title + price + a short description
that is often just the title repeated), and no specifications block. Category
pages are a product grid with no introduction. That single fact drives most of
what follows.

---

## 0. The uncomfortable finding: product pages are the weakest AI surface

Three independent 2026 studies agree, and the numbers are consistent enough to
act on:

| Study | Sample | Product pages | Category / listing pages | Guides / articles |
|---|---|---|---|---|
| PageSpeed Matters, 3 Nov 2026 ([link](https://www.pagespeedmatters.com/resources/data-studies/ai-overview-product-page-citations)) | 11,117 citations, 1,298 product searches | **5.4%** | **43.9%** | 10.0% |
| Same, "best X" searches | 17,069 citations | **4.5%** | — | 22.0% (videos 24.4%) |
| The HOTH, Oct 2026 ([link](https://www.thehoth.com/blog/ecommerce-ai-citation-report)) | 886 pages, 5,362 responses | **6.4%** of citations (but 25% of cited URLs) | — | **61.9%** |
| Wix AI Search Lab, Mar 2026 ([link](https://www.wix.com/studio/ai-search-lab/research/content-types-most-cited-by-llms)) | 75,000 answers, 1,056,727 citations | 13.7% overall, ~2x lower on **commercial** intent | 15.96% (ecommerce) | 19.49% articles, 19.94% listicles |

Per-platform split from The HOTH:

| Platform | Guides | Category pages | Product pages |
|---|---|---|---|
| Google AI Overviews | 60.4% | 31.9% | 7.7% |
| Google AI Mode | 48.4% | 46.2% | 5.4% |
| Gemini | 70.0% | 22.6% | ~7% |

**What this means concretely.** For "Hot Wheels Premium Mercedes 300 SL" the AI
answer is far more likely to cite a *category or listing page* than any single
product page. The brand/category landing pages built in this branch are therefore
the higher-leverage AI surface — but they currently contain a grid and no prose,
which is exactly the "thin category page" the studies say loses.

The one exception worth knowing: in the Wix data product pages lead for every
intent *except* commercial, and the HOTH report notes the only site where product
pages cleared 20% of citations had product names that were also category names.
Diecast casting names ("Skyline R34", "Lancia Stratos") behave similarly — they
*are* the query — so this catalogue is better positioned than a generic store.

**Do not over-read these numbers.** Different page classifiers produce different
splits (Wix says 13.7%, PageSpeed Matters says 5.4%) because they class URLs
differently. The direction is consistent, the exact percentage is not. Treat
"category pages and guides outperform product pages on commercial queries" as the
finding, not the decimals.

---

## 1. GEO reality check — what is actually supported

### 1.1 `llms.txt` — do not build a strategy on it

Widely recommended, almost never read. The evidence is unusually clear:

- **Google, officially:** "Google Search itself doesn't use them … Doing so will
  neither harm nor help your site's visibility or rankings in Google Search, as
  Google Search ignores them."
  → <https://developers.google.com/search/docs/fundamentals/ai-optimization-guide>
- **No lab documents reading it.** OpenAI, Anthropic, Perplexity, Microsoft and
  Google's crawler docs cover `robots.txt` only. None states that GPTBot,
  ClaudeBot, PerplexityBot or Bingbot consume `llms.txt`.
- **Server logs:** Ahrefs, May 2026, 137,210 domains — **97% of published
  `llms.txt` files received zero requests**; AI retrieval bots made 1.1% of the
  requests to the rest.
- **No measured citation effect:** SE Ranking (~300,000 domains) found removing
  the `llms.txt` variable *improved* its citation-prediction model's accuracy.

**Verdict:** skip it, or ship a 10-line file as a zero-cost hedge. It is not a
ranking or citation lever. (Note the genuine adjacent trend: Shopify auto-deployed
`llms.txt`, `agents.md` and `sitemap_agentic_discovery.xml` to every store in May
2026 — that is *agentic commerce*, agents transacting, not AI search citation.)

### 1.2 FAQ schema — dead for this site

- Aug 2023: FAQ rich results restricted to "well-known, authoritative government
  and health websites" ([Google blog](https://developers.google.com/search/blog/2023/08/howto-faq-changes)).
- **May 2026: FAQ rich results stopped appearing entirely**; reports removed June
  2026, API support August 2026 ([SEJ](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/)).
- HowTo was fully deprecated in September 2023.

**Verdict:** do not add `FAQPage` markup expecting rich results. FAQ *content* is
still useful for AI extraction and users; the *schema* buys nothing. Don't remove
existing FAQ markup either — it causes no harm.

### 1.3 What Google does say works

Google's own guidance is that its AI features run on ordinary Search signals —
crawlable pages, useful content, structured data. There is no separate "GEO
markup". Anything claiming otherwise is selling something.

---

## 2. Making a product page citable — three patterns

The goal is not more words, it is **extractable facts in a self-contained block**.
An AI system quoting a page needs a passage that stands alone and answers the
question without surrounding context.

### Pattern A — answer-first opening paragraph

Put a 2–3 sentence factual summary directly under the H1, before the gallery or
price. It must contain the product identity, the scale, the brand and the
availability, because that is what gets quoted.

```text
Hot Wheels Premium Lancia Stratos, 1:64 scale, part of the Premium
Boulevard series. Real Rider rubber tyres and metal/metal construction.
In stock at Diecast Heaven Udaipur, ₹650, ships across India in 3–5 days.
```

Why: an AI answering "what scale is the Hot Wheels Premium Lancia Stratos"
extracts one clean sentence instead of reconstructing it from a grid.

### Pattern B — a real specification table

Already implemented in this branch (`app/(public)/product/[slug]/page.tsx`). It is
the highest-value single change for attribute queries, which is exactly what
diecast buyers ask: scale, series, casting year, material, carded/loose, case
code. The table must be HTML (`<dl>`/`<table>`), not an image and not a
client-rendered accordion that only exists after hydration.

Only emit rows you actually know. A wrong scale is worse than a missing row.

### Pattern C — an explicit availability line

```text
In stock — 2 available. Ships from Udaipur within 24 hours.
```

Availability stated in prose (not only as a badge or a colour) is one of the most
commonly extracted facts on a product page, and it is currently ambiguous on this
site because it is conveyed visually.

### Before / after, realistically

| | Current | After |
|---|---|---|
| Extractable words | ~210 | ~330 |
| Standalone quotable sentences | 0 | 3–4 |
| Structured specs | none | 6–8 rows |
| Availability in prose | no | yes |

That is enough. Do **not** pad pages with 500 words of generated filler about
"the joy of collecting" — it does not get cited and it dilutes the page.

---

## 3. The highest-leverage fix: category and brand page content

This is where the data points most strongly, and where the branch's new
`/brands/[slug]` and `/categories/[slug]` pages currently fall short — they are
grids with a one-line heading.

**Add 150–250 words of genuine introduction above the grid** on each brand and
category page: what the brand/series is, what scale it is, what the difference is
between its sub-lines, who it suits, and what is typically in stock. Similar AI's
analysis is blunt about the threshold: category pages under ~200 words of useful
content above the grid are at risk
([link](http://similar.ai/blog/google-ai-overviews/)).

The same applies to the `/catalog` page, which is currently a bare grid.

This is cheap, it is content the owner can genuinely write, and it targets the
page type that takes 32–46% of AI Overview citations on commercial queries versus
5–8% for product pages.

---

## 4. Content gaps — prioritised

Ordered by expected return against effort. Items 1–2 target the page types the
data says get cited.

| # | Page type | Query intent captured | Why |
|---|---|---|---|
| 1 | **Brand/series guides** — "Hot Wheels Premium buying guide", "Premium vs Mainline vs Silver Series" | Comparison, research | Guides take 60.4% of AI Overview citations on product queries (HOTH). Also ranks for "difference between hot wheels mainline and premium", a high-volume evergreen query |
| 2 | **Category page intros** (see §3) | Commercial browsing | Category pages: 31.9–46.2% of AI citations vs 5–8% for product pages |
| 3 | **Scale landing pages** — `/scale/1-64`, `/scale/1-18` | "1:64 diecast cars india" | Searchers filter by scale; no page currently targets it. Note `scale` is a free-text column — normalise it first |
| 4 | **Set / multipack pages** — 5-packs, Boulevard sets, case assortments | "hot wheels 5 pack india" | Multi-product intent; currently each pack is a single product page with no collection context |
| 5 | **"Best X under ₹Y" roundups** — genuinely curated, with real prices and stock | "best diecast cars under 1000 india" | The listicle format takes ~20% of ecommerce AI citations; must be honest, not auto-generated |
| 6 | **Restock / new-arrivals page** with a stable URL | "hot wheels restock india", "new arrivals" | Freshness signal and a repeat-visit destination; currently no crawlable page for it |
| 7 | **Brand comparison pages** — "Tomica vs Hot Wheels Premium" | Comparison | Under 3% of citations today, but cheap once guides exist |
| 8 | **A `/contact` page** | Brand trust | Currently 404s. Required for Merchant Center and for E-E-A-T signals |

**Caveat on listicles:** the Wix data shows third-party listicles take 80.9% of
listicle citations vs 19.1% for self-promotional ones, and Minuttia found brands
ranking themselves #1 in their own roundups were *excluded from recommendations*
69% of the time in AI Overviews. Write roundups that are genuinely useful, or
pursue third-party coverage instead.

---

## 5. Do not do

- **Do not generate bulk filler copy** across 222 product pages. Thin content that
  is merely longer is still thin, and mass-generated text is a quality risk.
- **Do not add `FAQPage` schema** expecting rich results (§1.2).
- **Do not build a strategy on `llms.txt`** (§1.1).
- **Do not add `AggregateRating` without real reviews.** No review system exists;
  inventing ratings is a structured-data policy violation.
- **Do not block AI crawlers in `robots.txt`** while trying to be cited by them.
  `robots.ts` already allows GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot and
  Google-Extended — keep it that way. Blocking `Googlebot` would remove the site
  from AI Overviews entirely, since they are built on the Search index.

---

## 6. Sources

- Google, AI features optimisation guidance — <https://developers.google.com/search/docs/fundamentals/ai-optimization-guide>
- Google, FAQ/HowTo rich result changes (Aug 2023) — <https://developers.google.com/search/blog/2023/08/howto-faq-changes>
- SEJ, FAQ rich results dropped (2026) — <https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/>
- PageSpeed Matters, AI Overview product-page citations (Nov 2026) — <https://www.pagespeedmatters.com/resources/data-studies/ai-overview-product-page-citations>
- The HOTH, which ecommerce pages get cited (Oct 2026) — <https://www.thehoth.com/blog/ecommerce-ai-citation-report>
- Wix AI Search Lab, content types most cited (Mar 2026) — <https://www.wix.com/studio/ai-search-lab/research/content-types-most-cited-by-llms>
- Similar AI, AI Overviews for ecommerce (Mar 2026) — <http://similar.ai/blog/google-ai-overviews/>
- Search Engine Land, llms.txt guide — <https://searchengineland.com/guide/llms-txt>
- lacleo.ai, llms.txt evidence review (Oct 2026) — <https://lacleo.ai/blog/what-is-llms-txt>

**Unverified / not acted on:** no first-party statement exists from OpenAI,
Anthropic, Perplexity or Microsoft on whether their search products read
`llms.txt` on third-party sites — in either direction. Claims made confidently
either way should be treated as unsupported.
