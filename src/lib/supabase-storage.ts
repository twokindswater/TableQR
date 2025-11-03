import { IMAGE_VARIANT_CONFIG, ImageKind, swapVariantInUrl } from './image-variants';

const IMAGE_API_ENDPOINT = '/api/images';

type UploadImageParams =
  | {
      kind: 'store-logo' | 'store-cover';
      file: Blob;
      previousUrl?: string | null;
    }
  | {
      kind: 'menu';
      file: Blob;
      storeId: number;
      previousUrl?: string | null;
    };

type UploadResponse = {
  heroUrl: string;
  variantUrls: Record<string, string>;
};

async function fetchUpload(params: UploadImageParams): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('kind', params.kind);

  if ('storeId' in params) {
    formData.append('storeId', params.storeId.toString());
  }

  if (params.previousUrl) {
    formData.append('previousUrl', params.previousUrl);
  }

  const fileName =
    params.file instanceof File
      ? params.file.name || 'upload.webp'
      : 'upload.webp';

  formData.append('file', params.file, fileName);

  const response = await fetch(IMAGE_API_ENDPOINT, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `이미지 업로드에 실패했습니다. (${response.status}): ${message}`
    );
  }

  return (await response.json()) as UploadResponse;
}

type DeleteImageParams = {
  url: string;
  kind: ImageKind;
};

async function fetchDelete(params: DeleteImageParams) {
  if (!params.url) return;
  const response = await fetch(IMAGE_API_ENDPOINT, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `이미지 삭제에 실패했습니다. (${response.status}): ${message}`
    );
  }
}

export async function uploadStoreImage(
  kind: 'store-logo' | 'store-cover',
  file: Blob,
  previousUrl?: string | null
) {
  return fetchUpload({ kind, file, previousUrl });
}

export async function uploadMenuImage(
  storeId: number,
  file: Blob,
  previousUrl?: string | null
) {
  return fetchUpload({ kind: 'menu', file, storeId, previousUrl });
}

export async function deleteStoreImage(
  url: string | null,
  kind: 'store-logo' | 'store-cover'
) {
  if (!url) return;
  await fetchDelete({ url, kind });
}

export async function deleteMenuImage(url: string | null) {
  if (!url) return;
  await fetchDelete({ url, kind: 'menu' });
}

export function getImageVariant(
  url: string | null,
  variantKey: string
): string | null {
  if (!url) return null;
  return swapVariantInUrl(url, variantKey);
}

export function getAvailableVariantKeys(kind: ImageKind) {
  return IMAGE_VARIANT_CONFIG[kind].variants.map((variant) => variant.key);
}

export function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  return fetch(dataUrl)
    .then((res) => res.blob())
    .then((blob) => new File([blob], fileName, { type: blob.type }));
}

export function validateImageFile(file: File) {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
  ];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: '지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WEBP, AVIF만 가능)',
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
