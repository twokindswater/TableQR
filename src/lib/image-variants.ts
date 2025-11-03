export type ImageKind = 'store-logo' | 'store-cover' | 'menu';

export type ImageVariantDefinition = {
  key: string;
  width: number;
  height: number;
  quality: number;
  format: 'webp' | 'avif' | 'jpeg';
};

type ImageKindConfig = {
  bucket: string;
  heroKey: string;
  variants: ImageVariantDefinition[];
  rootPath?: string;
  groupByStoreId?: boolean;
};

export const IMAGE_VARIANT_CONFIG: Record<ImageKind, ImageKindConfig> = {
  'store-logo': {
    bucket: 'store-logos',
    heroKey: 'hero',
    rootPath: 'logos',
    variants: [
      { key: 'hero', width: 512, height: 512, quality: 80, format: 'webp' },
      { key: 'medium', width: 256, height: 256, quality: 75, format: 'webp' },
      { key: 'thumb', width: 128, height: 128, quality: 70, format: 'webp' },
    ],
  },
  'store-cover': {
    bucket: 'store-logos',
    heroKey: 'hero',
    rootPath: 'covers',
    variants: [
      { key: 'hero', width: 1920, height: 1080, quality: 82, format: 'webp' },
      { key: 'large', width: 1280, height: 720, quality: 78, format: 'webp' },
      { key: 'medium', width: 960, height: 540, quality: 75, format: 'webp' },
      { key: 'thumb', width: 640, height: 360, quality: 72, format: 'webp' },
    ],
  },
  menu: {
    bucket: 'menu-images',
    heroKey: 'hero',
    groupByStoreId: true,
    variants: [
      { key: 'hero', width: 1920, height: 1080, quality: 82, format: 'webp' },
      { key: 'detail', width: 1280, height: 720, quality: 78, format: 'webp' },
      { key: 'card', width: 960, height: 540, quality: 75, format: 'webp' },
      { key: 'thumb', width: 480, height: 270, quality: 70, format: 'webp' },
    ],
  },
};

export function getVariantKeys(kind: ImageKind) {
  return IMAGE_VARIANT_CONFIG[kind].variants.map((variant) => variant.key);
}

export function getHeroVariantKey(kind: ImageKind) {
  return IMAGE_VARIANT_CONFIG[kind].heroKey;
}

export function swapVariantInUrl(url: string, targetVariant: string) {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/');
    const filename = segments.pop();
    if (!filename) {
      return url;
    }
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      segments.push(targetVariant);
      parsed.pathname = segments.join('/');
      return parsed.toString();
    }
    const ext = filename.slice(lastDotIndex + 1);
    segments.push(`${targetVariant}.${ext}`);
    parsed.pathname = segments.join('/');
    return parsed.toString();
  } catch (error) {
    console.warn('Failed to swap variant in URL:', error);
    return url;
  }
}
