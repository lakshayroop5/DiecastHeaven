import { NextResponse } from 'next/server'
import { revalidateTag } from '@/lib/queries'

export async function POST() {
  revalidateTag('products')
  revalidateTag('featured-products')
  revalidateTag('categories')
  revalidateTag('brands')
  revalidateTag('settings')
  return NextResponse.json({ revalidated: true, timestamp: Date.now() })
}
