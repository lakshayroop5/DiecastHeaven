import { createClient } from '@libsql/client'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// Creates the analytics_events table on the target database (local file or Turso).
// Repo precedent: prisma/push-hero-media-table.ts — prisma db push does not reach
// production Turso reliably with driverAdapters, so tables are created via raw DDL.

// ponytail: tsx does not auto-load .env for @libsql/client; tiny fallback parser
function loadEnv(): void {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^"|"$/g, '')
    }
  }
}

loadEnv()

const rawUrl = process.env.DATABASE_URL
if (!rawUrl) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

// Prisma resolves file: URLs relative to prisma/schema.prisma — mirror that
const url = rawUrl.startsWith('file:')
  ? 'file:' + resolve('prisma', rawUrl.slice('file:'.length))
  : rawUrl

const client = createClient({
  url,
  authToken: url.startsWith('libsql://') ? process.env.DATABASE_AUTH_TOKEN : undefined,
})

const DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS "analytics_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "product_id" TEXT,
    "product_slug" TEXT,
    "product_title" TEXT,
    "brand" TEXT,
    "category" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT 0,
    "orderType" TEXT,
    "source" TEXT,
    "search_query" TEXT,
    "meta" TEXT,
    "created_at" DATETIME NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "idx_ae_eventType_created" ON "analytics_events" ("eventType", "created_at")`,
  `CREATE INDEX IF NOT EXISTS "idx_ae_visitor_product_created" ON "analytics_events" ("visitorId", "product_slug", "created_at")`,
  `CREATE INDEX IF NOT EXISTS "idx_ae_product_slug" ON "analytics_events" ("product_slug")`,
]

async function main(): Promise<void> {
  for (const sql of DDL) {
    await client.execute(sql)
  }
  console.log('analytics_events ready at', url.startsWith('file:') ? url : 'turso')
}

main().catch((e) => {
  console.error('ERR:', e.message)
  process.exit(1)
})
