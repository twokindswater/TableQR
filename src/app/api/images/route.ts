import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import {
  IMAGE_VARIANT_CONFIG,
  ImageKind,
  ImageVariantDefinition,
  getHeroVariantKey,
} from '@/lib/image-variants';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const FORMAT_CONTENT_TYPE: Record<ImageVariantDefinition['format'], string> = {
  webp: 'image/webp',
  avif: 'image/avif',
  jpeg: 'image/jpeg',
};

function extensionForFormat(format: ImageVariantDefinition['format']) {
  switch (format) {
    case 'webp':
      return 'webp';
    case 'avif':
      return 'avif';
    case 'jpeg':
      return 'jpg';
    default:
      return 'webp';
  }
}

function getExtensionFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const fileName = pathname.split('/').pop();
    if (!fileName) return undefined;
    const ext = fileName.split('.').pop();
    return ext?.toLowerCase();
  } catch (error) {
    console.warn('Failed to parse extension from URL:', error);
    return undefined;
  }
}

function getBasePathFromUrl(url: string, kind: ImageKind) {
  try {
    const config = IMAGE_VARIANT_CONFIG[kind];
    const { bucket } = config;
    const pathname = new URL(url).pathname;
    const marker = `${bucket}/`;
    const index = pathname.indexOf(marker);
    if (index === -1) return null;
    const storagePath = pathname.slice(index + marker.length);
    const segments = storagePath.split('/');
    segments.pop(); // remove filename
    if (segments.length === 0) {
      return null;
    }
    return segments.join('/');
  } catch (error) {
    console.warn('Failed to derive base path from URL:', error);
    return null;
  }
}

async function removeExistingAsset(url: string, kind: ImageKind) {
  if (!supabaseAdmin) return;
  const config = IMAGE_VARIANT_CONFIG[kind];
  const basePath = getBasePathFromUrl(url, kind);
  if (!basePath) return;
  const originalExt = getExtensionFromUrl(url);
  const defaultExt = extensionForFormat(config.variants[0]?.format || 'webp');
  const extensions = new Set<string>();
  if (originalExt) extensions.add(originalExt);
  extensions.add(defaultExt);

  const targets: string[] = [];
  for (const variant of config.variants) {
    for (const ext of extensions) {
      targets.push(`${basePath}/${variant.key}.${ext}`);
    }
  }

  if (targets.length === 0) return;

  const { error } = await supabaseAdmin.storage
    .from(config.bucket)
    .remove(targets);
  if (error) {
    console.warn('Failed to remove existing asset variants:', error);
  }
}

async function generateVariantBuffer(
  buffer: Buffer,
  definition: ImageVariantDefinition
) {
  let pipeline = sharp(buffer).resize(definition.width, definition.height, {
    fit: 'cover',
    position: 'centre',
    withoutEnlargement: true,
    fastShrinkOnLoad: true,
  });

  switch (definition.format) {
    case 'webp':
      pipeline = pipeline.webp({
        quality: definition.quality,
        effort: 5,
        smartSubsample: true,
      });
      break;
    case 'avif':
      pipeline = pipeline.avif({
        quality: definition.quality,
        effort: 5,
      });
      break;
    case 'jpeg':
    default:
      pipeline = pipeline.jpeg({
        quality: definition.quality,
        mozjpeg: true,
      });
      break;
  }

  return pipeline.toBuffer();
}

async function uploadVariants(options: {
  buffer: Buffer;
  kind: ImageKind;
  storeId?: string;
  previousUrl?: string | null;
}) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not configured.');
  }
  const { buffer, kind, storeId, previousUrl } = options;
  const config = IMAGE_VARIANT_CONFIG[kind];

  if (config.groupByStoreId && !storeId) {
    throw new Error('storeId is required for menu image uploads.');
  }

  if (previousUrl) {
    await removeExistingAsset(previousUrl, kind);
  }

  const assetId = randomUUID();
  const pathSegments: string[] = [];
  if (config.rootPath) {
    pathSegments.push(config.rootPath);
  }
  if (config.groupByStoreId && storeId) {
    pathSegments.push(storeId);
  }
  pathSegments.push(assetId);
  const basePath = pathSegments.join('/');

  const variantUrls: Record<string, string> = {};

  for (const variant of config.variants) {
    const variantBuffer = await generateVariantBuffer(buffer, variant);
    const ext = extensionForFormat(variant.format);
    const objectPath = `${basePath}/${variant.key}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from(config.bucket)
      .upload(objectPath, variantBuffer, {
        cacheControl: '31536000',
        upsert: true,
        contentType: FORMAT_CONTENT_TYPE[variant.format],
      });

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(config.bucket).getPublicUrl(objectPath);
    variantUrls[variant.key] = publicUrl;
  }

  const heroKey = getHeroVariantKey(kind);
  const heroUrl = variantUrls[heroKey];
  if (!heroUrl) {
    throw new Error('대표 이미지 URL을 확인할 수 없습니다.');
  }

  return {
    heroUrl,
    variantUrls,
  };
}

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured.' },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const kind = formData.get('kind') as ImageKind | null;
  if (!kind || !(kind in IMAGE_VARIANT_CONFIG)) {
    return NextResponse.json(
      { error: '유효하지 않은 이미지 종류입니다.' },
      { status: 400 }
    );
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: '이미지 파일이 필요합니다.' },
      { status: 400 }
    );
  }

  const previousUrl = formData.get('previousUrl');
  const storeIdValue = formData.get('storeId');
  const storeId =
    typeof storeIdValue === 'string' && storeIdValue.length > 0
      ? storeIdValue
      : undefined;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadVariants({
      buffer,
      kind,
      storeId,
      previousUrl: previousUrl && typeof previousUrl === 'string'
        ? previousUrl
        : null,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Image upload failed:', error);
    return NextResponse.json(
      { error: '이미지 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured.' },
      { status: 500 }
    );
  }

  let payload: { url?: string; kind?: ImageKind };
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json(
      { error: '잘못된 요청 본문입니다.' },
      { status: 400 }
    );
  }

  if (!payload.url || !payload.kind || !(payload.kind in IMAGE_VARIANT_CONFIG)) {
    return NextResponse.json(
      { error: '유효하지 않은 요청입니다.' },
      { status: 400 }
    );
  }

  try {
    await removeExistingAsset(payload.url, payload.kind);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Image deletion failed:', error);
    return NextResponse.json(
      { error: '이미지 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
