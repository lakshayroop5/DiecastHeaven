async function main() {
  const res = await fetch('https://diecast-heaven.vercel.app/api/revalidate', { method: 'POST' })
  const data = await res.json()
  console.log('Revalidation result:', JSON.stringify(data))
}

main().catch(console.error)
