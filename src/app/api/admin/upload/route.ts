import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { cookies } from 'next/headers';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';
import {
  processImageVariants,
  validateImageFile,
  GALLERY_VARIANTS,
  PRODUCT_VARIANTS,
  TRIP_VARIANTS,
  type ImageVariant,
} from '@/lib/image-utils';

const STORE_SLUG = process.env.STORE_SLUG ?? '';

const PURPOSE_VARIANTS: Record<string, ImageVariant[]> = {
  gallery: GALLERY_VARIANTS,
  product: PRODUCT_VARIANTS,
  trips:   TRIP_VARIANTS,
};

const VIDEO_PURPOSES = new Set(['trip-video']);
const VIDEO_MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const VIDEO_MIME_ALLOW = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

async function saveToBlob(
  processed: Array<{ suffix: string; processed: { buffer: Buffer; contentType: string } }>,
  purpose: string,
  baseName: string,
  timestamp: number,
): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};
  for (const { suffix, processed: img } of processed) {
    const blobPath = `${purpose}/${STORE_SLUG}/${timestamp}-${baseName}${suffix}.webp`;
    const blob = await put(blobPath, img.buffer, {
      access: 'public',
      contentType: img.contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    urls[suffix] = blob.url;
  }
  return urls;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!(await verifyAdminToken(token, getAdminSecret()))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const purpose = (formData.get('purpose') as string) ?? 'gallery';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // ── Video upload (trip-video): skip image pipeline ──
  if (VIDEO_PURPOSES.has(purpose)) {
    if (!VIDEO_MIME_ALLOW.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported video type. Use mp4, webm, or mov.' }, { status: 400 });
    }
    if (file.size > VIDEO_MAX_BYTES) {
      return NextResponse.json({ error: 'Video exceeds 25 MB limit.' }, { status: 400 });
    }
    try {
      const ext = file.name.split('.').at(-1) ?? 'mp4';
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const blobPath = `${purpose}/${STORE_SLUG}/${Date.now()}-${baseName}.${ext}`;
      const blob = await put(blobPath, file.stream(), {
        access: 'public',
        contentType: file.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return NextResponse.json({ url: blob.url, storage: 'blob' });
    } catch (error) {
      console.error('[admin upload video]', error);
      return NextResponse.json({ error: 'Video upload failed' }, { status: 500 });
    }
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const variants = PURPOSE_VARIANTS[purpose] ?? GALLERY_VARIANTS;

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const processed = await processImageVariants(inputBuffer, variants);

    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();

    const urls = await saveToBlob(processed, purpose, baseName, timestamp);

    return NextResponse.json({
      urls,
      url: urls[variants[0].suffix],
      thumbnailUrl: urls[variants.at(-1)!.suffix],
      storage: 'blob',
    });
  } catch (error) {
    console.error('[admin upload]', error);
    return NextResponse.json({
      error: 'Upload processing failed',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
