import { list, put } from '@vercel/blob'
import sharp from 'sharp'
import imageVariants from '../lib/image-variants'

const { IMAGE_VARIANT_SIZES, imageVariantPath } = imageVariants as {
  IMAGE_VARIANT_SIZES: number[]
  imageVariantPath: (pathname: string, size: number) => string
}

const PREFIX = 'products/'
const CONCURRENCY = 4
const VARIANT_QUALITY = 80
const CACHE_SECONDS = 60 * 60 * 24 * 365
const SOURCE_EXT_RE = /\.(jpe?g|png|webp|avif)$/i
const VARIANT_NAME_RE = /-(?:400|800|1200|1600)\.webp$/i

type BlobItem = {
  url: string
  pathname: string
  size: number
  contentType?: string
}

async function listProductBlobs(token: string): Promise<BlobItem[]> {
  const blobs: BlobItem[] = []
  let cursor: string | undefined

  do {
    const page = await list({ token, prefix: PREFIX, cursor, limit: 1000 })
    blobs.push(...(page.blobs as BlobItem[]))
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)

  return blobs
}

async function download(url: string) {
  let lastError: unknown

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      lastError = error
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
    }
  }

  throw lastError
}

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN is required')

  const blobs = await listProductBlobs(token)
  const existing = new Set(blobs.map((blob) => blob.pathname))

  const originals = blobs.filter(
    (blob) =>
      SOURCE_EXT_RE.test(blob.pathname) &&
      !VARIANT_NAME_RE.test(blob.pathname) &&
      blob.size > 0
  )

  console.log(
    `Found ${blobs.length} blobs under ${PREFIX}; ${originals.length} originals to check.`
  )

  let nextIndex = 0
  let completed = 0
  let skipped = 0
  let uploaded = 0
  const failures: Array<{ pathname: string; error: string }> = []

  async function worker() {
    while (true) {
      const index = nextIndex
      nextIndex += 1
      if (index >= originals.length) return

      const blob = originals[index]
      const missing = IMAGE_VARIANT_SIZES.filter(
        (size) => !existing.has(imageVariantPath(blob.pathname, size))
      )

      if (missing.length === 0) {
        skipped += 1
        completed += 1
        continue
      }

      try {
        const source = await download(blob.url)

        for (const size of missing) {
          const body = await sharp(source, { failOn: 'none' })
            .rotate()
            .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: VARIANT_QUALITY })
            .toBuffer()

          const pathname = imageVariantPath(blob.pathname, size)
          await put(pathname, body, {
            access: 'public',
            contentType: 'image/webp',
            token,
            cacheControlMaxAge: CACHE_SECONDS,
            addRandomSuffix: false,
            allowOverwrite: true,
          })

          existing.add(pathname)
          uploaded += 1
        }
      } catch (error) {
        failures.push({
          pathname: blob.pathname,
          error: error instanceof Error ? error.message : String(error),
        })
      }

      completed += 1
      if (completed % 25 === 0 || completed === originals.length) {
        console.log(
          `Progress ${completed}/${originals.length} (uploaded ${uploaded}, skipped ${skipped}, failed ${failures.length})`
        )
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))

  console.log(
    `Done. Originals: ${originals.length}, uploaded variants: ${uploaded}, skipped: ${skipped}, failed images: ${failures.length}.`
  )

  for (const failure of failures) {
    console.error(`FAILED ${failure.pathname}: ${failure.error}`)
  }

  if (failures.length > 0) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
