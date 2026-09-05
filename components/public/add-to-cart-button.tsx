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

  const label = isPreOrder ? 'Reserve Now' : 'Add to Cart'
  const addedLabel = isPreOrder ? 'Reserved!' : 'Added to Cart!'

  if (variant === 'compact') {
    return (
      <button
        onClick={handleAdd}
        className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors ${
          added ? 'bg-green-600 text-white' : 'bg-hotwheels-red text-white hover:bg-red-700'
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
      className={`inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-bold transition-colors ${
        added
          ? 'bg-green-600 text-white'
          : 'bg-white text-black hover:bg-gray-200'
      }`}
    >
      {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
      {added ? addedLabel : label}
    </button>
  )
}
