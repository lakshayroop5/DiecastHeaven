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
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.25em] text-gray-500 font-mono">PARC-FERMÉ // INSPECTION</p>
      <button
        type="button"
        onClick={() => setIndex(0)}
        className="aspect-square relative bg-hotwheels-gray rounded-lg overflow-hidden mb-2 group cursor-zoom-in border-2 border-[#2D2D2D] hover:border-hotwheels-red/60 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-colors"
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
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest font-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          Zoom // +
        </div>
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
            <span className="text-white font-bold text-base tracking-wider uppercase bg-black/60 px-4 py-1.5 rounded">Sold Out</span>
          </div>
        )}
      </button>
      <div aria-hidden="true" className="h-2 mb-4 rounded-sm opacity-70" style={{ backgroundImage: 'repeating-conic-gradient(#fff 0% 25%, #0a0a0a 0% 50%)', backgroundSize: '16px 16px' }} />
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, idx) => (
            <button
              key={image.imageUrl}
              type="button"
              onClick={() => setIndex(idx)}
              className={`aspect-square relative bg-hotwheels-gray rounded-md overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)] ${
                idx === 0
                  ? 'ring-2 ring-hotwheels-red border border-hotwheels-red/60'
                  : 'border border-[#2D2D2D] hover:ring-2 hover:ring-hotwheels-red/70 hover:border-hotwheels-red/50'
              }`}
            >
              <Image
                src={image.imageUrl}
                alt={image.altText || `${title} view ${idx + 1}`}
                fill
                sizes="100px"
                className="object-cover transition-transform duration-500 hover:scale-110"
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
