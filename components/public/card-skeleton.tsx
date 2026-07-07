// ponytail: skeleton placeholder while card streams in
export default function CardSkeleton() {
  return (
    <div className="bg-hotwheels-gray rounded-lg overflow-hidden border border-hotwheels-black">
      <div className="aspect-square bg-hotwheels-black animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-hotwheels-black rounded w-1/3 animate-pulse" />
        <div className="h-5 bg-hotwheels-black rounded w-2/3 animate-pulse" />
        <div className="flex gap-1">
          <div className="h-5 bg-hotwheels-black rounded-full w-16 animate-pulse" />
          <div className="h-5 bg-hotwheels-black rounded-full w-12 animate-pulse" />
        </div>
        <div className="h-4 bg-hotwheels-black rounded w-1/4 animate-pulse" />
        <div className="h-6 bg-hotwheels-black rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-hotwheels-black rounded w-full animate-pulse" />
        <div className="h-4 bg-hotwheels-black rounded w-4/5 animate-pulse" />
        <div className="h-9 bg-hotwheels-black rounded w-full animate-pulse" />
      </div>
    </div>
  )
}
