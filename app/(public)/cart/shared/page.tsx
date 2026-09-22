import Link from 'next/link'
import prisma from '@/lib/prisma'
import { decodeCart } from '@/lib/cart-share'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function SharedCartPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>
}) {
  const { c } = await searchParams
  const entries = decodeCart(c)

  if (entries.length === 0) {
    return (
      <div className="min-h-screen bg-hotwheels-black flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Invalid cart link</h1>
          <p className="text-gray-400 mb-6">This shared cart link is empty or malformed.</p>
          <Link href="/catalog" className="inline-flex rounded-md bg-hotwheels-red px-6 py-3 text-sm font-semibold text-white hover:bg-red-700">
            Browse Catalog
          </Link>
        </div>
      </div>
    )
  }

  // ponytail: one slim query, needed columns only. Prices always from DB.
  const products = await prisma.product.findMany({
    where: { id: { in: entries.map((e) => e.id) } },
    select: {
      id: true, title: true, slug: true, status: true,
      price: true, offerPrice: true, depositAmount: true, orderType: true,
      images: { take: 1, select: { imageUrl: true } },
    },
  })
  const byId = new Map(products.map((p) => [p.id, p]))

  const rows = entries.map((e) => ({ entry: e, product: byId.get(e.id) ?? null }))
  const missing = rows.filter((r) => !r.product).length
  const subtotal = rows.reduce((sum, { entry, product }) => {
    if (!product) return sum
    const unit = product.orderType === 'PRE_ORDER' && product.depositAmount != null
      ? product.depositAmount
      : product.offerPrice ?? product.price ?? 0
    return sum + unit * entry.qty
  }, 0)

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-hotwheels-yellow mb-2">Shared cart</p>
        <div className="mb-8 rounded-xl border border-hotwheels-yellow/25 bg-gradient-to-br from-hotwheels-gray to-hotwheels-black p-5 sm:p-6 shadow-[0_0_30px_rgba(230,200,0,0.08)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">Total payable</p>
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">{formatPrice(subtotal)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-hotwheels-yellow">{rows.length}</p>
              <p className="text-xs text-gray-400">item{rows.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {missing > 0 && (
          <p className="mb-4 text-sm text-hotwheels-yellow">
            {missing} item{missing !== 1 ? 's were' : ' was'} removed or unavailable since sharing.
          </p>
        )}

        <div className="space-y-3">
          {rows.map(({ entry, product }) => {
            if (!product) {
              return (
                <div key={entry.id} className="flex items-center gap-3 bg-hotwheels-gray rounded-lg px-4 py-3 border border-hotwheels-black opacity-60">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-400">Unavailable item</h3>
                    <p className="text-xs text-gray-500">No longer listed (x{entry.qty})</p>
                  </div>
                </div>
              )
            }
            const isDeposit = product.orderType === 'PRE_ORDER' && product.depositAmount != null
            const unit = isDeposit ? product.depositAmount! : product.offerPrice ?? product.price ?? 0
            return (
              <div key={product.id} className="flex items-center gap-3 bg-hotwheels-gray rounded-lg p-3 border border-hotwheels-black">
                <Link href={`/product/${product.slug}`} className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-hotwheels-black flex-shrink-0">
                  {product.images[0] ? (
                    <img src={product.images[0].imageUrl} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
                  ) : null}
                  {isDeposit && (
                    <span className="absolute top-1 left-1 bg-hotwheels-yellow text-hotwheels-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Pre-Order
                    </span>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="text-sm sm:text-base font-semibold text-white hover:text-hotwheels-yellow line-clamp-1">{product.title}</h3>
                  </Link>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs font-bold text-white bg-hotwheels-black px-2 py-0.5 rounded-full border border-hotwheels-gray">
                      x{entry.qty}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatPrice(unit)}{isDeposit ? ' deposit' : ''} each
                    </span>
                  </div>
                  {product.status === 'SOLD_OUT' && (
                    <span className="text-xs text-red-400">Sold out since sharing</span>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base sm:text-lg font-bold text-white">{formatPrice(unit * entry.qty)}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link href="/catalog" className="inline-flex justify-center rounded-md border border-hotwheels-gray px-6 py-3 text-sm font-semibold text-white hover:border-hotwheels-red/50">
            Browse Catalog
          </Link>
          <Link href="/cart" className="inline-flex justify-center rounded-md bg-hotwheels-red px-6 py-3 text-sm font-semibold text-white hover:bg-red-700">
            Open My Cart
          </Link>
        </div>
      </div>
    </div>
  )
}
