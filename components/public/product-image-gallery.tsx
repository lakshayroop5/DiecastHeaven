'use client'

import { useState } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

interface ProductImageGalleryProps {
  images: Array<{ imageUrl: string; altText: string | null }>
  title: string
  isSoldOut?: boolean
}

export default function ProductImageGallery({ images, title, isSoldOut }: ProductImageGalleryProps) {
  const [index, setIndex] = useState(-1)
  const mainImage = images[0]

  return (
    <div className="flex flex-col">
      {/* Main Image - clickable to open lightbox */}
      <button
        type="button"
        onClick={() => setIndex(0)}
        className="aspect-square relative bg-hotwheels-gray rounded-lg overflow-hidden mb-4 group cursor-zoom-in"
      >
        {mainImage ? (
          <Image
            src={mainImage.imageUrl}
            alt={mainImage.altText || title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-hotwheels-black flex items-center justify-center">
            <span className="text-gray-500">No image available</span>
          </div>
        )}
        {/* Zoom hint */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          Click to zoom
        </div>
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
            <span className="text-white font-bold text-base tracking-wider uppercase bg-black/60 px-4 py-1.5 rounded">Sold Out</span>
          </div>
        )}
      </button>

      {/* Thumbnails - clickable to open lightbox at that image */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, idx) => (
            <button
              key={image.imageUrl}
              type="button"
              onClick={() => setIndex(idx)}
              className="aspect-square relative bg-hotwheels-gray rounded overflow-hidden hover:ring-2 hover:ring-hotwheels-yellow transition-all"
            >
              <Image
                src={image.imageUrl}
                alt={image.altText || `${title} view ${idx + 1}`}
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        index={index}
        slides={images.map((img) => ({
          src: img.imageUrl,
          alt: img.altText || title,
        }))}
        open={index >= 0}
        close={() => setIndex(-1)}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 5, scrollToZoom: true }}
        styles={{ container: { backgroundColor: 'rgba(0,0,0,0.9)' } }}
      />
    </div>
  )
}
