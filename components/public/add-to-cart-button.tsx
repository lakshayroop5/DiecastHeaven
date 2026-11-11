'use client'

import { useState } from 'react'
import { ShoppingBag, Check } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { track } from '@/lib/track'

interface AddToCartButtonProps {
  product: {
    id: string
    slug: string
    title: string
    price: number | null
    offerPrice: number | null
    depositAmount?: number | null
    orderType?: string
  }
  imageUrl?: string
  variant?: 'full' | 'compact'
}

export default function AddToCartButton({
  product,
  imageUrl,
  variant = 'full',
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const isPreOrder = product.orderType === 'PRE_ORDER'

  const handleAdd = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      offerPrice: product.offerPrice,
      depositAmount: product.depositAmount ?? null,
      orderType: product.orderType ?? 'RTD',
      image: imageUrl || '',
    })
    track({
      eventType: 'ADD_TO_CART',
      productId: product.id,
      productSlug: product.slug,
      productTitle: product.title,
      orderType: product.orderType,
      source: variant === 'compact' ? 'card' : 'product-page',
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const label = isPreOrder ? 'RESERVE PIT SLOT' : 'ADD TO PIT'
  const addedLabel = isPreOrder ? 'SLOT RESERVED!' : 'IN THE PIT!'

  if (variant === 'compact') {
    return (
      <button
        onClick={handleAdd}
        className={`btn-shine inline-flex items-center justify-center gap-2 rounded-sm px-3 py-1.5 text-xs font-black uppercase tracking-widest font-mono whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-100 border-b-2 ${
          added ? 'bg-green-600 text-white border-green-400 shadow-lg shadow-green-900/40' : 'bg-hotwheels-red text-white border-hotwheels-yellow hover:bg-red-600 shadow-lg shadow-red-950/50 hover:shadow-[0_0_20px_rgba(230,0,0,0.6)]'
        }`}
      >
        {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
        {added ? addedLabel : label}
      </button>
    )
  }

  return (
    <button
      onClick={handleAdd}
      className={`btn-shine inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 text-sm font-black uppercase tracking-widest font-mono transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 border-b-2 ${
        added
          ? 'bg-green-600 text-white border-green-400 shadow-lg shadow-green-900/40'
          : 'bg-hotwheels-red text-white border-hotwheels-yellow hover:bg-red-600 shadow-[0_8px_24px_rgba(230,0,0,0.4)] hover:shadow-[0_0_28px_rgba(230,0,0,0.65)]'
      }`}
    >
      {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
      {added ? addedLabel : label}
    </button>
  )
}
