import imageVariants from './image-variants'

const { isProductImageUrl, imageVariantUrl } = imageVariants

/**
 * Product photos use the pre-generated WebP variants stored beside each Blob
 * original. Everything else (local logo, Blob hero media) keeps going through
 * the Vercel optimizer, now with a single format and a shorter width ladder.
 */
export default function imageLoader({ src, width, quality }) {
  if (isProductImageUrl(src)) {
    return imageVariantUrl(src, width)
  }

  if (src.startsWith('/_next/image') || src.startsWith('data:') || src.startsWith('blob:')) {
    return src
  }

  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`
}
