'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/utils'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { track } from '@/lib/track'

export default function CartPage() {
  const { items, subtotal, totalItems, updateQuantity, removeItem, clearCart } = useCart()
  const [checkingOut, setCheckingOut] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [businessName, setBusinessName] = useState('')

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((s) => {
      setWhatsappNumber(s.whatsappNumber || '')
      setBusinessName(s.businessName || '')
    })
  }, [])

  const handleCheckout = () => {
    setCheckingOut(true)
    const lines = items.map(
      (i) => {
        const unit = i.orderType === 'PRE_ORDER' && i.depositAmount != null
          ? i.depositAmount
          : i.offerPrice ?? i.price ?? 0
        const tag = i.orderType === 'PRE_ORDER' ? ' [Pre-Order Deposit]' : ''
        return `- ${i.title}${tag} (x${i.quantity}) - ${formatPrice(unit * i.quantity)}`
      }
    )
    const message = `Hi ${businessName || 'Diecast Heaven Udaipur'}! I'd like to order:\n\n${lines.join(
      '\n'
    )}\n\nTotal: ${formatPrice(subtotal)}\n\nPlease confirm availability and payment details.`
    const link = buildWhatsAppLink(whatsappNumber, message)
    track({
      eventType: 'CART_CHECKOUT',
      meta: JSON.stringify({
        items: items.map((i) => ({ slug: i.slug, qty: i.quantity })),
        totalItems,
        subtotal,
      }),
    })
    window.open(link, '_blank')
    setTimeout(() => setCheckingOut(false), 1500)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-hotwheels-black flex items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <div className="rounded-full bg-hotwheels-gray border border-hotwheels-black p-8 mb-6 inline-flex">
            <ShoppingBag className="h-14 w-14 text-hotwheels-red" />
          </div>
          <h1 className="text-2xl font-bold text-hotwheels-white mb-3">
            Your cart is empty
          </h1>
          <p className="text-gray-400 mb-8">
            Looks like you haven&apos;t added any diecast cars yet. Browse our collection to find your next gem.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-md bg-hotwheels-red px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Browse Catalog
            </Link>
            <Link
              href="/catalog?sort=newest"
              className="inline-flex items-center justify-center rounded-md border border-hotwheels-gray px-6 py-3 text-sm font-semibold text-hotwheels-white hover:border-hotwheels-red/50 transition-colors"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-hotwheels-white transition-colors mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl font-bold text-hotwheels-white">
              Your Cart
              <span className="text-gray-500 text-lg font-normal ml-2">
                ({totalItems} item{totalItems !== 1 ? 's' : ''})
              </span>
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-hotwheels-red transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => {
              const isItemPreOrder = item.orderType === 'PRE_ORDER'
              const unit = isItemPreOrder && item.depositAmount != null
                ? item.depositAmount
                : item.offerPrice ?? item.price ?? 0
              const lineTotal = unit * item.quantity
              return (
                <div
                  key={item.id}
                  className={`flex gap-4 bg-hotwheels-gray rounded-lg p-4 border ${
                    isItemPreOrder
                      ? 'border-hotwheels-yellow/30'
                      : 'border-hotwheels-black'
                  }`}
                >
                  {/* Image */}
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-hotwheels-black flex-shrink-0"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                    {isItemPreOrder && (
                      <span className="absolute top-1 left-1 bg-hotwheels-yellow text-hotwheels-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Pre-Order
                      </span>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`} className="block">
                      <h3 className="text-base font-semibold text-hotwheels-white hover:text-hotwheels-yellow transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>

                    {isItemPreOrder && item.depositAmount != null ? (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 text-sm">
                        <span className="text-hotwheels-yellow font-semibold">
                          Deposit: {formatPrice(item.depositAmount)}
                        </span>
                        {(item.offerPrice ?? item.price) != null && (
                          <span className="text-gray-500">
                            of {formatPrice(item.offerPrice ?? item.price ?? 0)} full
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-hotwheels-yellow font-medium mt-1">
                        {formatPrice(unit)}
                      </p>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center bg-hotwheels-black rounded-full border border-hotwheels-gray">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-gray-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 text-sm font-semibold text-white min-w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-gray-400 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-gray-500 hover:text-hotwheels-red transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-hotwheels-white">
                      {formatPrice(lineTotal)}
                    </p>
                    {isItemPreOrder && item.quantity > 1 && (
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {item.quantity}x {formatPrice(unit)} deposit
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="mt-8 lg:mt-0">
            <div className="bg-hotwheels-gray rounded-lg p-6 border border-hotwheels-black sticky top-24">
              <h2 className="text-lg font-bold text-hotwheels-white mb-4">
                Order Summary
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Items ({totalItems})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span className="text-green-400">Calculated on WhatsApp</span>
                </div>
              </div>

              {items.some((i) => i.orderType === 'PRE_ORDER') && (
                <div className="mt-4 rounded-md bg-hotwheels-yellow/10 border border-hotwheels-yellow/20 px-3 py-2.5">
                  <p className="text-xs text-hotwheels-yellow font-medium text-center">
                    Pre-order items show deposit amounts. Balance due on delivery.
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-hotwheels-black">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-semibold text-hotwheels-white">
                    Subtotal
                  </span>
                  <span className="text-2xl font-bold text-hotwheels-yellow">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                {items.some((i) => i.orderType === 'PRE_ORDER') && (
                  <p className="text-[11px] text-gray-500 text-right mt-0.5">
                    deposit total — balance on delivery
                  </p>
                )}
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="mt-6 w-full rounded-md bg-hotwheels-red px-5 py-3 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {checkingOut ? 'Opening WhatsApp...' : 'Checkout via WhatsApp'}
              </button>

              <p className="mt-3 text-xs text-gray-500 text-center">
                You'll be redirected to WhatsApp to confirm your order and payment details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
