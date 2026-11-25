import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import imageVariants from '@/lib/image-variants'

const { IMAGE_VARIANT_SIZES, imageVariantPath } = imageVariants as {
  IMAGE_VARIANT_SIZES: number[]
  imageVariantPath: (pathname: string, size: number) => string
}

// Blob filenames are unique and immutable, so cache originals and variants for
// a year. Variants are also what product pages serve, so this is the long-lived
// copy; the Vercel image optimizer is no longer involved for them.
const IMAGE_CACHE_SECONDS = 60 * 60 * 24 * 365
const VARIANT_QUALITY = 80
const VARIANT_SOURCE_RE = /\.(jpe?g|png|webp|avif)$/i

export const runtime = 'nodejs'
export const maxDuration = 60

async function buildVariants(buffer: Buffer, sourcePath: string) {
  const variants: Array<{ pathname: string; body: Buffer }> = []

  for (const size of IMAGE_VARIANT_SIZES) {
    const body = await sharp(buffer, { failOn: 'none' })
      .rotate()
      .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: VARIANT_QUALITY })
      .toBuffer()

    variants.push({ pathname: imageVariantPath(sourcePath, size), body })
  }

  return variants
}

// ponytail: upload the image to Vercel Blob cloud storage and return the public URL
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const isVideo = (file.type || '').startsWith('video/')
  // ponytail: serverless request body caps ~4.5MB on Vercel; large videos need client-side uploads if they fail
  const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: isVideo ? 'Video must be under 100MB' : 'Image must be under 10MB' },
      { status: 400 }
    )
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: 'Vercel Blob storage token (BLOB_READ_WRITE_TOKEN) is not configured.' },
      { status: 500 }
    )
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate a unique filename to prevent collisions
    const extension = file.name.split('.').pop() || 'jpg'
    const baseName = file.name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const uniqueName = `${Date.now()}-${baseName}.${extension}`

    const folder = (formData.get('folder') as string | null) || 'products'
    const sourcePath = `${folder}/${uniqueName}`

    // Product photos get pre-sized WebP siblings so lib/image-loader.js can
    // serve them without a Vercel transformation. Other uploads (hero media,
    // videos, unsupported formats) keep the original only.
    const shouldBuildVariants =
      folder === 'products' && !isVideo && VARIANT_SOURCE_RE.test(sourcePath)
    const variants = shouldBuildVariants ? await buildVariants(buffer, sourcePath) : []

    const uploads: Array<Promise<{ url: string }>> = [
      put(sourcePath, buffer, {
        access: 'public',
        contentType: file.type || 'application/octet-stream',
        token,
        cacheControlMaxAge: IMAGE_CACHE_SECONDS,
      }),
    ]

    for (const variant of variants) {
      uploads.push(
        put(variant.pathname, variant.body, {
          access: 'public',
          contentType: 'image/webp',
          token,
          cacheControlMaxAge: IMAGE_CACHE_SECONDS,
          addRandomSuffix: false,
          allowOverwrite: true,
        })
      )
    }

    const [original] = await Promise.all(uploads)

    return NextResponse.json({ imageUrl: original.url, altText: file.name })
  } catch (error: any) {
    return NextResponse.json({ error: `Upload process error: ${error?.message || error}` }, { status: 500 })
  }
}
