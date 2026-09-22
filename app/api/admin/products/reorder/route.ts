import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateTag } from '@/lib/queries'

// ponytail: spaced order values so a move touches 1 row, not N
const GAP = 1024
const WINDOW = 50

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { activeId?: string; overId?: string; orderedIds?: string[] }
  if (body.orderedIds) return legacyReorder(body.orderedIds)

  const { activeId, overId } = body
  if (!activeId || !overId) return NextResponse.json({ error: 'activeId and overId required' }, { status: 400 })
  if (activeId === overId) return NextResponse.json({ ok: true, noop: true })

  const ordered = await prisma.product.findMany({
    select: { id: true, sortOrder: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
  const oldIdx = ordered.findIndex((p) => p.id === activeId)
  const overIdx = ordered.findIndex((p) => p.id === overId)
  if (oldIdx < 0 || overIdx < 0) return NextResponse.json({ error: 'product not found' }, { status: 404 })

  // mirror client arrayMove: remove active, insert at over's original index
  const arr = ordered.filter((p) => p.id !== activeId)
  arr.splice(Math.min(overIdx, arr.length), 0, { id: activeId, sortOrder: ordered[oldIdx].sortOrder })
  const newPos = arr.findIndex((p) => p.id === activeId)
  const prev = newPos > 0 ? arr[newPos - 1] : null
  const next = newPos < arr.length - 1 ? arr[newPos + 1] : null

  let sortOrder: number | null = null
  if (!prev && next) sortOrder = next.sortOrder - GAP
  else if (prev && !next) sortOrder = prev.sortOrder + GAP
  else if (prev && next && next.sortOrder - prev.sortOrder > 1) {
    sortOrder = prev.sortOrder + Math.floor((next.sortOrder - prev.sortOrder) / 2)
  }

  if (sortOrder !== null) {
    await prisma.product.update({ where: { id: activeId }, data: { sortOrder } })
  } else {
    // ponytail: gap exhausted at this spot (takes ~10 stacked inserts), respread neighbors
    const lo = Math.max(0, newPos - WINDOW)
    const hi = Math.min(arr.length - 1, newPos + WINDOW)
    const before = lo > 0 ? arr[lo - 1].sortOrder : arr[lo].sortOrder - GAP * (hi - lo + 2)
    const after = hi < arr.length - 1 ? arr[hi + 1].sortOrder : before + GAP * (hi - lo + 2)
    if (after - before > (hi - lo + 1) * GAP) {
      await prisma.$transaction(
        arr.slice(lo, hi + 1).map((p, i) => prisma.product.update({ where: { id: p.id }, data: { sortOrder: before + GAP * (i + 1) } }))
      )
      sortOrder = before + GAP * (newPos - lo + 1)
    } else {
      await prisma.$transaction(
        arr.map((p, i) => prisma.product.update({ where: { id: p.id }, data: { sortOrder: i * GAP } }))
      )
      sortOrder = newPos * GAP
    }
  }

  revalidateTag('products')
  return NextResponse.json({ ok: true, sortOrder })
}

// ponytail: keep old full-list path for stale tabs, client no longer uses it
async function legacyReorder(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, i) => prisma.product.update({ where: { id }, data: { sortOrder: i } }))
  )
  revalidateTag('products')
  return NextResponse.json({ ok: true, legacy: true })
}

// one-time reindex: assign spaced sortOrder to all products
export async function PATCH() {
  const products = await prisma.product.findMany({ select: { id: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] })
  await prisma.$transaction(
    products.map((p, i) => prisma.product.update({ where: { id: p.id }, data: { sortOrder: i * GAP } }))
  )
  revalidateTag('products')
  return NextResponse.json({ reindexed: products.length })
}
