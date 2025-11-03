import { supabase } from './supabase';

const MENU_BUCKET = 'menu-images';

const MENU_VARIANTS = [
  { key: 'hero', width: 1920, height: 1080, quality: 0.92 },
  { key: 'detail', width: 1280, height: 720, quality: 0.9 },
  { key: 'card', width: 960, height: 540, quality: 0.88 },
  { key: 'thumb', width: 480, height: 270, quality: 0.85 },
] as const;

type MenuVariantDefinition = (typeof MENU_VARIANTS)[number];
export type MenuVariantKey = MenuVariantDefinition['key'];

const MENU_VARIANT_KEYS: MenuVariantKey[] = MENU_VARIANTS.map(
  (variant) => variant.key
);
const MENU_HERO_VARIANT: MenuVariantKey = 'hero';

type MenuUploadResult = {
  heroUrl: string;
  variantUrls: Record<MenuVariantKey, string>;
  basePath: string;
};

function createAssetId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function loadImageFromFile(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new Error('Failed to load image for menu variants.'));
      img.src = objectUrl;
    });
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function createVariantBlob(
  image: HTMLImageElement,
  definition: MenuVariantDefinition
) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context unavailable when generating menu variants.');
  }

  canvas.width = definition.width;
  canvas.height = definition.height;
  ctx.drawImage(image, 0, 0, definition.width, definition.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Failed to create menu variant blob.'));
        }
      },
      'image/jpeg',
      definition.quality
    );
  });

  return blob;
}

function deriveMenuAssetBasePath(imageUrl: string | null) {
  if (!imageUrl) return null;
  try {
    const parsed = new URL(imageUrl);
    const marker = `${MENU_BUCKET}/`;
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return null;
    const storagePath = parsed.pathname.slice(index + marker.length);
    const segments = storagePath.split('/');
    const last = segments.pop();
    if (!last) return null;
    const variantName = last.replace('.jpg', '') as MenuVariantKey;
    if (!MENU_VARIANT_KEYS.includes(variantName)) return null;
    return segments.join('/');
  } catch (error) {
    console.warn('Failed to derive menu asset base path:', error);
    return null;
  }
}

async function removeMenuAsset(basePath: string | null) {
  if (!basePath) return;
  const removalTargets = MENU_VARIANT_KEYS.map(
    (variant) => `${basePath}/${variant}.jpg`
  );
  const { error } = await supabase.storage
    .from(MENU_BUCKET)
    .remove(removalTargets);
  if (error) {
    console.warn('Failed to remove menu image variants:', error);
  }
}

/**
 * 이미지 파일을 Supabase Storage에 업로드하면서 용도별 변형을 생성합니다.
 * @param storeId 스토어 ID
 * @param file 이미지 파일
 * @param previousUrl 교체 시 제거할 기존 이미지 URL
 */
export async function uploadMenuImage(
  storeId: number,
  file: File,
  previousUrl?: string | null
): Promise<MenuUploadResult> {
  try {
    if (previousUrl) {
      await removeMenuAsset(deriveMenuAssetBasePath(previousUrl));
    }

    const assetId = createAssetId();
    const basePath = `${storeId}/${assetId}`;
    const image = await loadImageFromFile(file);
    const variantUrls: Record<MenuVariantKey, string> = {} as Record<
      MenuVariantKey,
      string
    >;

    for (const definition of MENU_VARIANTS) {
      const variantBlob = await createVariantBlob(image, definition);
      const variantPath = `${basePath}/${definition.key}.jpg`;

      const { error } = await supabase.storage
        .from(MENU_BUCKET)
        .upload(variantPath, variantBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (error) {
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(MENU_BUCKET).getPublicUrl(variantPath);

      variantUrls[definition.key] = publicUrl;
    }

    const heroUrl = variantUrls[MENU_HERO_VARIANT];
    if (!heroUrl) {
      throw new Error('대표 메뉴 이미지 URL을 확인할 수 없습니다.');
    }

    return {
      heroUrl,
      variantUrls,
      basePath,
    };
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    throw error;
  }
}

/**
 * Supabase Storage에서 메뉴 이미지(모든 변형 포함)를 삭제합니다.
 * @param imageUrl 삭제할 이미지의 대표(히어로) URL
 */
export async function deleteMenuImage(imageUrl: string | null) {
  try {
    await removeMenuAsset(deriveMenuAssetBasePath(imageUrl));
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    throw error;
  }
}

/**
 * 대표 이미지 URL에서 다른 변형 URL을 계산합니다.
 * @param imageUrl 대표(히어로) 이미지 URL
 * @param variant 사용할 변형 키
 */
export function getMenuImageVariant(
  imageUrl: string | null,
  variant: MenuVariantKey
) {
  if (!imageUrl) return null;
  try {
    const parsed = new URL(imageUrl);
    const segments = parsed.pathname.split('/');
    const fileName = segments.pop();
    if (!fileName) {
      return imageUrl;
    }

    const currentVariant = fileName.replace('.jpg', '') as MenuVariantKey;
    if (!MENU_VARIANT_KEYS.includes(currentVariant)) {
      return imageUrl;
    }

    segments.push(`${variant}.jpg`);
    parsed.pathname = segments.join('/');
    return parsed.toString();
  } catch (error) {
    console.warn('Failed to derive menu variant URL:', error);
    return imageUrl;
  }
}

/**
 * Base64 이미지를 File 객체로 변환
 * @param dataUrl Base64 이미지 데이터
 * @param fileName 파일 이름
 */
export function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  return fetch(dataUrl)
    .then(res => res.blob())
    .then(blob => new File([blob], fileName, { type: blob.type }));
}

/**
 * 이미지 파일의 크기와 타입 검증
 * @param file 검증할 이미지 파일
 * @returns 검증 결과 (성공 여부와 에러 메시지)
 */
export function validateImageFile(file: File) {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: '지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WEBP만 가능)',
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      error: '이미지 크기가 너무 큽니다. (최대 5MB)',
    };
  }

  return { isValid: true, error: null };
}
