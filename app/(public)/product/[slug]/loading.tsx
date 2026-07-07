export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-hotwheels-black">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-4 sm:mb-6 flex gap-2 items-center">
          <div className="h-4 bg-hotwheels-gray rounded w-12 animate-pulse" />
          <span className="text-gray-600">/</span>
          <div className="h-4 bg-hotwheels-gray rounded w-16 animate-pulse" />
          <span className="text-gray-600">/</span>
          <div className="h-4 bg-hotwheels-gray rounded w-32 animate-pulse" />
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Left Column: Image Gallery Skeleton */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square w-full rounded-lg bg-hotwheels-gray animate-pulse" />
            <div className="flex gap-2">
              <div className="aspect-square w-20 rounded bg-hotwheels-gray animate-pulse" />
              <div className="aspect-square w-20 rounded bg-hotwheels-gray animate-pulse" />
              <div className="aspect-square w-20 rounded bg-hotwheels-gray animate-pulse" />
            </div>
          </div>

          {/* Right Column: Product Details Skeleton */}
          <div className="mt-6 sm:mt-10 lg:mt-0 lg:pl-8 space-y-4">
            {/* Badges */}
            <div className="flex gap-2">
              <div className="h-6 bg-hotwheels-gray rounded-full w-20 animate-pulse" />
              <div className="h-6 bg-hotwheels-gray rounded-full w-24 animate-pulse" />
            </div>
            {/* Title */}
            <div className="h-8 bg-hotwheels-gray rounded w-3/4 animate-pulse" />
            {/* Scale */}
            <div className="h-4 bg-hotwheels-gray rounded w-1/4 animate-pulse" />
            {/* Short Desc */}
            <div className="space-y-2 mt-4">
              <div className="h-4 bg-hotwheels-gray rounded w-full animate-pulse" />
              <div className="h-4 bg-hotwheels-gray rounded w-5/6 animate-pulse" />
            </div>
            {/* Price */}
            <div className="h-8 bg-hotwheels-gray rounded w-1/3 animate-pulse mt-6" />
            {/* Description */}
            <div className="space-y-2 mt-6">
              <div className="h-5 bg-hotwheels-gray rounded w-28 animate-pulse" />
              <div className="h-4 bg-hotwheels-gray rounded w-full animate-pulse" />
              <div className="h-4 bg-hotwheels-gray rounded w-full animate-pulse" />
              <div className="h-4 bg-hotwheels-gray rounded w-2/3 animate-pulse" />
            </div>
            {/* Buttons */}
            <div className="mt-6 sm:mt-8 flex gap-3 flex-wrap">
              <div className="h-12 bg-hotwheels-gray rounded-md w-32 animate-pulse" />
              <div className="h-12 bg-hotwheels-gray rounded-md w-40 animate-pulse" />
              <div className="h-12 bg-hotwheels-gray rounded-md w-36 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
