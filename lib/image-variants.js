/**
 * Shared contract for pre-generated product image variants.
 *
 * Product photos live in Vercel Blob as originals. The upload route and the
 * backfill script write four pre-sized WebP copies next to each original, and
 * the next/image loader points at those copies so Vercel does not transform
 * product photos at request time.
 *
 * Keep the sizes and the URL naming in sync with lib/image-loader.js and
 * scripts/backfill-image-variants.ts.
 */
const IMAGE_VARIANT_SIZES = [400, 800, 1200, 1600]
const VARIANT_NAME_RE = /-(?:400|800|1200|1600)\.webp$/i
const SOURCE_EXT_RE = /\.(jpe?g|png|webp|avif)$/i

function isProductImageUrl(src) {
  if (typeof src !== 'string' || !src.startsWith('http')) return false

  let url
  try {
    url = new URL(src)
  } catch {
    return false
  }

  return (
    url.hostname.endsWith('.public.blob.vercel-storage.com') &&
    url.pathname.startsWith('/products/') &&
    !VARIANT_NAME_RE.test(url.pathname) &&
    SOURCE_EXT_RE.test(url.pathname)
  )
}

/** Pick the smallest pre-generated file that still covers the requested width. */
function imageVariantSizeForWidth(width) {
  const w = Number(width) || 800
  if (w <= 600) return 400
  if (w <= 1000) return 800
  if (w <= 1400) return 1200
  return 1600
}

function imageVariantUrl(src, width) {
  const url = new URL(src)
  url.pathname = url.pathname.replace(SOURCE_EXT_RE, `-${imageVariantSizeForWidth(width)}.webp`)
  return url.toString()
}

function imageVariantPath(pathname, size) {
  return pathname.replace(SOURCE_EXT_RE, `-${size}.webp`)
}

module.exports = {
  IMAGE_VARIANT_SIZES,
  isProductImageUrl,
  imageVariantSizeForWidth,
  imageVariantUrl,
  imageVariantPath,
}
