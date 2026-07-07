export default function CatalogLoading() {
  return (
    <div className="min-h-screen bg-hotwheels-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-4">
          {/* Page Title Skeleton */}
          <div className="h-10 bg-hotwheels-gray rounded w-48 animate-pulse" />
          {/* Pill Filters Skeleton */}
          <div className="flex flex-wrap gap-2 pt-2">
            <div className="h-9 bg-hotwheels-gray rounded-full w-16 animate-pulse" />
            <div className="h-9 bg-hotwheels-gray rounded-full w-24 animate-pulse" />
            <div className="h-9 bg-hotwheels-gray rounded-full w-20 animate-pulse" />
            <div className="h-9 bg-hotwheels-gray rounded-full w-28 animate-pulse" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-9 bg-hotwheels-gray rounded-full w-20 animate-pulse" />
            <div className="h-9 bg-hotwheels-gray rounded-full w-24 animate-pulse" />
            <div className="h-9 bg-hotwheels-gray rounded-full w-16 animate-pulse" />
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-hotwheels-gray rounded-lg overflow-hidden border border-hotwheels-black">
              <div className="aspect-square bg-hotwheels-black animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-hotwheels-black rounded w-1/3 animate-pulse" />
                <div className="h-5 bg-hotwheels-black rounded w-2/3 animate-pulse" />
                <div className="h-4 bg-hotwheels-black rounded w-1/4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
