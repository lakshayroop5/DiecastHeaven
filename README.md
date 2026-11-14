# Hot Wheels Collector - Catalog Site

A Next.js public website for showcasing Hot Wheels diecast collector cars. Built with server-side rendering, Prisma ORM, and WhatsApp integration for inquiries.

## Features

- **Catalog browsing** - Filter and search published Hot Wheels products
- **Product details** - SEO-friendly slug pages with image galleries
- **WhatsApp integration** - Click-to-chat for product inquiries
- **Responsive design** - Mobile-first with Tailwind CSS
- **SEO optimized** - Sitemap, metadata, and Open Graph support

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite (local) / Turso (production)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your database URL
```

3. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:push
```

4. Seed the database:

```bash
npm run prisma:seed
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
├── app/
│   ├── page.tsx           # Homepage
│   ├── catalog/           # Catalog listing
│   ├── product/[slug]/    # Product detail pages
│   ├── about/             # About page
│   ├── api/settings/      # Settings API
│   ├── layout.tsx         # Root layout
│   ├── not-found.tsx      # 404 page
│   ├── sitemap.ts         # Sitemap generation
│   └── robots.ts          # Robots file
├── components/
│   ├── public/            # Public-facing components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── hero.tsx
│   │   ├── product-card.tsx
│   │   ├── category-filter.tsx
│   │   ├── whatsapp-cta.tsx
│   │   └── empty-state.tsx
│   └── ui/                # Shared UI components
├── lib/
│   ├── prisma.ts          # Prisma client
│   ├── queries.ts         # Database queries
│   ├── whatsapp.ts        # WhatsApp URL builder
│   └── utils.ts           # Utility functions
└── prisma/
    ├── schema.prisma      # Database schema
    └── seed.ts            # Seed data
```

## Database Schema

The schema includes:
- **Category** - Product categories with slug-based routing
- **Product** - Products with status (DRAFT/PUBLISHED/SOLD_OUT)
- **ProductImage** - Multiple images per product
- **SiteSetting** - Business settings including WhatsApp number

## WhatsApp Integration

WhatsApp links use the official `wa.me` format:

```
https://wa.me/<number>?text=<encoded_message>
```

The `{product}` placeholder in messages is replaced with the product title.

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Environment Variables

```env
DATABASE_URL=           # libSQL connection string (Turso)
DATABASE_AUTH_TOKEN=    # Turso auth token
NEXT_PUBLIC_SITE_URL=   # Production origin, e.g. https://www.diecastheavenudaipur.in
                        # MUST be set in Vercel. If unset or malformed it falls back
                        # to the hard-coded production origin in lib/seo/site.ts.
```

See [TURSO_SETUP.md](TURSO_SETUP.md) for detailed Turso configuration.

## SEO & Discoverability

Product pages emit Schema.org `Product` markup, every route declares its own
canonical, and there are crawlable brand/category landing pages. A Google
Merchant Center product feed is served at `/feed/google-merchant.xml`.

| Surface | Where |
|---|---|
| Site identity, canonical origin, URL helpers | `lib/seo/site.ts` |
| JSON-LD builders (Product, BreadcrumbList, ItemList, Organization) | `lib/seo/schema.ts` |
| XML sitemap | `app/sitemap.ts` → `/sitemap.xml` |
| Image sitemap | `app/sitemap-images.xml/route.ts` |
| Merchant Center feed | `app/feed/google-merchant.xml/route.ts` |
| robots.txt | `app/robots.ts` |
| IndexNow (Bing/Yandex instant indexing) | `lib/seo/indexnow.ts`, called from `/api/revalidate` |
| Brand / category landing pages | `/brands`, `/brands/[slug]`, `/categories/[slug]` |

**Setting `NEXT_PUBLIC_SITE_URL` in Vercel is required** — without it every
canonical, sitemap entry and feed link falls back to the hard-coded production
origin. The fallback exists so a missing env var can never emit `localhost` URLs
into production again.

Full audit findings, what was implemented and the prioritised next steps live in
[docs/seo/](docs/seo/):
- [implementation.md](docs/seo/implementation.md) — what changed and how to verify it
- [roadmap.md](docs/seo/roadmap.md) — what still needs doing, in priority order
- [audits/](docs/seo/audits/) — the specialist audit reports

> **Google Shopping note:** the site currently hands checkout off to WhatsApp.
> Google treats that as a request for a quote and will not approve a Merchant
> Center account until a real on-site checkout with an order confirmation
> exists. See [roadmap.md § P1](docs/seo/roadmap.md) before submitting the feed.

## Admin Integration

The schema and queries are designed for future admin integration:
- All models use `slug` fields for clean URLs
- `SiteSetting` stores configurable business info
- Query layer is reusable for CRUD operations
- Only `PUBLISHED` products appear on public pages

## License

MIT