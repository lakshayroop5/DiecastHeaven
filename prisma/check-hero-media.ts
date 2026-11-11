import { createClient } from '@libsql/client/http'

const url = 'libsql://diecastheaven-main-luckycoder555.aws-ap-south-1.turso.io'

async function main() {
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN })
  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='hero_media'"
  )
  if (tables.rows.length > 0) {
    const rows = await client.execute('SELECT id, url, type, sort_order FROM hero_media ORDER BY sort_order')
    console.log('TABLE EXISTS in prod, rows:')
    for (const r of rows.rows) console.log(`  ${r.id} | ${r.url} | ${r.type} | ${r.sort_order}`)
  } else {
    console.log('MISSING in prod')
  }
}

main().catch((e) => {
  console.log('ERR:', e.message)
  process.exit(1)
})
