import { createClient } from '@libsql/client/http'

const client = createClient({
  url: 'libsql://diecastheaven-main-luckycoder555.aws-ap-south-1.turso.io',
  authToken: process.env.DATABASE_AUTH_TOKEN!,
})

async function main() {
  const cats = await client.execute('SELECT id, name, slug FROM categories ORDER BY name')
  console.log('Categories in DB:')
  for (const r of cats.rows) console.log(`  ${r.name} (${r.slug})`)

  const featured = await client.execute('SELECT COUNT(*) as c FROM products WHERE featured = 1')
  console.log('\nFeatured count:', featured.rows[0].c)

  const withScale = await client.execute(`SELECT COUNT(*) as c FROM products WHERE scale IS NOT NULL AND scale != ''`)
  const total = await client.execute('SELECT COUNT(*) as c FROM products')
  console.log(`Scale: ${withScale.rows[0].c}/${total.rows[0].c} products have scale`)
}

main()
