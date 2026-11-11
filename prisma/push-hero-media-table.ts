import { createClient } from '@libsql/client/http'

const url = 'libsql://diecastheaven-main-luckycoder555.aws-ap-south-1.turso.io'

async function main() {
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN })

  const existing = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='hero_media'")
  if (existing.rows.length > 0) {
    console.log('hero_media already exists in prod')
    return
  }

  await client.execute(`CREATE TABLE hero_media (
    id TEXT PRIMARY KEY NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'IMAGE',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`)
  console.log('hero_media table created in prod')

  await client.execute(
    "INSERT INTO hero_media (id, url, type, sort_order) VALUES ('seed-default', '/hero-banner.jpeg', 'IMAGE', 0)"
  )
  console.log('default hero slide seeded')
}

main().catch((e) => {
  console.log('ERR:', e.message)
  process.exit(1)
})
