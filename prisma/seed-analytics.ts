import prisma from '../lib/prisma'
import type { Prisma } from '@prisma/client'

// Synthetic analytics events for local QA/demo of the /analytics dashboard.
// Usage: npm run seed:analytics            — insert ~400 events over 90 days
//        npm run seed:analytics -- --clear — delete all events

const CLEAR = process.argv.includes('--clear')

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main(): Promise<void> {
  if (CLEAR) {
    const deleted = await prisma.analyticsEvent.deleteMany({})
    console.log(`Cleared ${deleted.count} analytics events`)
    return
  }

  const products = await prisma.product.findMany({
    where: { status: { in: ['PUBLISHED', 'SOLD_OUT'] } },
    include: { brand: true, categories: { include: { category: true } } },
    take: 10,
    orderBy: { sortOrder: 'asc' },
  })

  if (products.length === 0) {
    console.error('No published products — seed products first (npm run prisma:seed)')
    process.exit(1)
  }

  const visitors = Array.from({ length: 4 }, () => crypto.randomUUID())
  const searchTerms = ['hot wheels', 'bmw', 'porsche 911', 'jordan', 'lamborghini', 'fast furious']
  const now = Date.now()
  const rows: Prisma.AnalyticsEventCreateManyInput[] = []

  for (let day = 89; day >= 0; day--) {
    const dayBase = now - day * 86400000 + rand(9, 18) * 3600000

    for (let i = 0; i < rand(1, 8); i++) {
      rows.push({
        eventType: 'PAGE_VIEW',
        visitorId: pick(visitors),
        source: pick(['/', '/catalog', '/catalog', '/about']),
        createdAt: new Date(dayBase + rand(0, 3500) * 1000),
      })
    }

    // Product interest skews toward the first 3 products
    for (let i = 0; i < rand(0, 4); i++) {
      const visitor = pick(visitors)
      const p =
        Math.random() < 0.6
          ? products[rand(0, Math.min(2, products.length - 1))]
          : pick(products)
      const ts = new Date(dayBase + rand(0, 8) * 3600000)
      rows.push({
        eventType: 'PRODUCT_VIEW',
        visitorId: visitor,
        productId: p.id,
        productSlug: p.slug,
        productTitle: p.title,
        brand: p.brand?.name ?? null,
        category: p.categories[0]?.category.name ?? null,
        featured: p.featured,
        orderType: p.orderType,
        source: 'product-page',
        createdAt: ts,
      })
      if (Math.random() < 0.5) {
        rows.push({
          eventType: 'PRODUCT_CLICK',
          visitorId: visitor,
          productId: p.id,
          productSlug: p.slug,
          productTitle: p.title,
          featured: p.featured,
          orderType: p.orderType,
          source: pick(['catalog', 'featured']),
          createdAt: new Date(ts.getTime() - 60000),
        })
      }
      if (Math.random() < 0.25) {
        // WhatsApp clicks carry only the title (matches WhatsAppCTA reality)
        rows.push({
          eventType: 'WHATSAPP_CLICK',
          visitorId: visitor,
          productTitle: p.title,
          source: pick(['small', 'primary']),
          createdAt: new Date(ts.getTime() + 120000),
        })
      }
      if (Math.random() < 0.2) {
        rows.push({
          eventType: 'ADD_TO_CART',
          visitorId: visitor,
          productId: p.id,
          productSlug: p.slug,
          productTitle: p.title,
          orderType: p.orderType,
          source: 'card',
          createdAt: new Date(ts.getTime() + 60000),
        })
      }
    }

    if (Math.random() < 0.3) {
      rows.push({
        eventType: 'SEARCH',
        visitorId: pick(visitors),
        searchQuery: pick(searchTerms),
        source: 'catalog',
        createdAt: new Date(dayBase + rand(0, 8) * 3600000),
      })
    }
    if (Math.random() < 0.25) {
      const p = pick(products)
      rows.push({
        eventType: 'FILTER_APPLY',
        visitorId: pick(visitors),
        meta: `category:${p.categories[0]?.category.slug ?? 'all'}|brand:${p.brand?.slug ?? 'any'}`,
        source: 'catalog',
        createdAt: new Date(dayBase + rand(0, 8) * 3600000),
      })
    }
    if (Math.random() < 0.1) {
      rows.push({
        eventType: 'CART_CHECKOUT',
        visitorId: pick(visitors),
        meta: JSON.stringify({
          items: [{ slug: pick(products).slug, qty: 1 }],
          totalItems: 1,
          subtotal: rand(500, 5000),
        }),
        createdAt: new Date(dayBase + rand(0, 8) * 3600000),
      })
    }
  }

  // Sequential create: guaranteed on SQLite + libsql adapter (createMany support varies)
  for (const r of rows) {
    await prisma.analyticsEvent.create({ data: r })
  }
  console.log(`Inserted ${rows.length} analytics events`)
}

main()
  .catch((e) => {
    console.error('ERR:', e instanceof Error ? e.message : e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
