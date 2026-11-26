import imageVariants from './image-variants'

const { isProductImageUrl, imageVariantUrl } = imageVariants

/**
 * Product photos use the pre-generated WebP variants stored beside each Blob
 * original. Everything else (local logo, Blob hero media) keeps going through
 * the Vercel optimizer, now with a single format and a shorter width ladder.
 */
export default function imageLoader({ src, width }) {
  if (isProductImageUrl(src)) {
    return imageVariantUrl(src, width)
  }

  // Temporary: the Vercel image optimization quota is exhausted. Serve the
  // original file directly so local/hero images still load. Product photos
  // above keep using their pre-generated variants.
  return src
}
