import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

// ponytail: upload the image to Vercel Blob cloud storage and return the public URL
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 10MB' }, { status: 400 })
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
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const uniqueName = `${Date.now()}-${baseName}.${extension}`

    // Upload to Vercel Blob
    const blob = await put(`products/${uniqueName}`, buffer, {
      access: 'public',
      contentType: file.type || 'image/jpeg',
      token: token,
    })

    return NextResponse.json({ imageUrl: blob.url, altText: file.name })
  } catch (error: any) {
    return NextResponse.json({ error: `Upload process error: ${error?.message || error}` }, { status: 500 })
  }
}
