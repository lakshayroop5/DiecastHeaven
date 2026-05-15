'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-hotwheels-gray rounded-lg overflow-hidden">
          <Skeleton className="aspect-square bg-hotwheels-black" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4 bg-hotwheels-black" />
            <Skeleton className="h-4 w-1/2 bg-hotwheels-black" />
            <Skeleton className="h-4 w-full bg-hotwheels-black" />
            <Skeleton className="h-4 w-2/3 bg-hotwheels-black" />
            <Skeleton className="h-8 w-24 bg-hotwheels-black" />
          </div>
        </div>
      ))}
    </div>
  )
}