'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { StoreInsert, Store } from '@/types/database';
import { Upload, X } from 'lucide-react';
import NextImage from 'next/image';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ImageCropDialog } from './image-crop-dialog';

type ImageType = 'logo' | 'cover';

interface StoreFormProps {
  initialData?: Store;
  onSubmit: (data: StoreInsert) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

type StoreFormData = Omit<StoreInsert, 'user_id'>;

const SUPABASE_BUCKET = 'store-logos';

type ImageVariantDefinition = {
  key: string;
  width: number;
  height: number;
  quality?: number;
};

const IMAGE_VARIANTS: Record<ImageType, ImageVariantDefinition[]> = {
  logo: [
    { key: 'hero', width: 512, height: 512, quality: 0.92 },
    { key: 'medium', width: 256, height: 256, quality: 0.88 },
    { key: 'thumb', width: 128, height: 128, quality: 0.85 },
  ],
  cover: [
    { key: 'hero', width: 1920, height: 1080, quality: 0.92 },
    { key: 'large', width: 1280, height: 720, quality: 0.9 },
    { key: 'medium', width: 960, height: 540, quality: 0.88 },
    { key: 'thumb', width: 640, height: 360, quality: 0.85 },
  ],
};

const IMAGE_ROOT_PATH: Record<ImageType, string> = {
  logo: 'logos',
  cover: 'covers',
};

const VARIANT_KEYS: Record<ImageType, string[]> = {
  logo: IMAGE_VARIANTS.logo.map((variant) => variant.key),
  cover: IMAGE_VARIANTS.cover.map((variant) => variant.key),
};

const HERO_VARIANT_KEY: Record<ImageType, string> = {
  logo: 'hero',
  cover: 'hero',
};

function createAssetId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function findStoragePathFromPublicUrl(url: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const marker = `${SUPABASE_BUCKET}/`;
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return null;
    return parsed.pathname.slice(index + marker.length);
  } catch (error) {
    console.warn('Failed to parse storage path from URL:', error);
    return null;
  }
}

function deriveAssetBasePath(url: string | null, type: ImageType) {
  const storagePath = findStoragePathFromPublicUrl(url);
  if (!storagePath) return null;
  const segments = storagePath.split('/');
  const last = segments.pop();
  if (!last) return null;
  const variantName = last.replace('.jpg', '');
  if (!VARIANT_KEYS[type].includes(variantName)) return null;
  return segments.join('/');
}

async function removeExistingAsset(basePath: string | null, type: ImageType) {
  if (!basePath) return;
  const paths = VARIANT_KEYS[type].map((variant) => `${basePath}/${variant}.jpg`);
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove(paths);
  if (error) {
    console.warn('Failed to remove previous asset variants:', error);
  }
}

async function loadImageFromBlob(blob: Blob) {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new Error('Failed to load image for variant generation.'));
      img.src = objectUrl;
    });
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function createVariantBlob(
  image: HTMLImageElement,
  definition: ImageVariantDefinition
) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error(
      'Canvas context unavailable while generating image variants.'
    );
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
          reject(new Error('Failed to create variant blob.'));
        }
      },
      'image/jpeg',
      definition.quality
    );
  });

  return blob;
}

async function uploadVariants(
  sourceBlob: Blob,
  type: ImageType,
  assetBasePath: string
) {
  const variantDefinitions = IMAGE_VARIANTS[type];
  const variantEntries: Array<[string, string]> = [];
  const sourceImage = await loadImageFromBlob(sourceBlob);

  for (const definition of variantDefinitions) {
    const variantBlob = await createVariantBlob(sourceImage, definition);
    const variantPath = `${assetBasePath}/${definition.key}.jpg`;
    const variantFile = new File([variantBlob], `${definition.key}.jpg`, {
      type: 'image/jpeg',
    });

    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(variantPath, variantFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(variantPath);

    variantEntries.push([definition.key, publicUrl]);
  }

  return Object.fromEntries(variantEntries) as Record<string, string>;
}

export function StoreForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: StoreFormProps) {
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialData?.logo_url || null
  );
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initialData?.cover_url || null
  );
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropType, setCropType] = useState<'logo' | 'cover'>('logo');
  const [logoAssetBasePath, setLogoAssetBasePath] = useState<string | null>(() =>
    deriveAssetBasePath(initialData?.logo_url || null, 'logo')
  );
  const [coverAssetBasePath, setCoverAssetBasePath] = useState<string | null>(() =>
    deriveAssetBasePath(initialData?.cover_url || null, 'cover')
  );
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<StoreFormData>({
    defaultValues: initialData
      ? {
          name: initialData.name || '',
          logo_url: initialData.logo_url,
          cover_url: initialData.cover_url,
          phone: initialData.phone || '',
          business_hours: initialData.business_hours || '',
          notice: initialData.notice || '',
          description: initialData.description || '',
        }
      : {
          name: '',
          logo_url: null,
          cover_url: null,
          phone: '',
          business_hours: '',
          notice: '',
          description: '',
        },
  });

  const handleFormSubmit = async (data: StoreFormData) => {
    try {
      setLoading(true);
      await onSubmit(data as StoreInsert);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'cover'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImageSrc(reader.result as string);
        setCropType(type);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
      // 파일 입력 초기화
      e.target.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const type: ImageType = cropType;
    try {
      setLoading(true);

      if (type === 'logo') {
        await removeExistingAsset(logoAssetBasePath, 'logo');
      } else {
        await removeExistingAsset(coverAssetBasePath, 'cover');
      }

      const assetId = createAssetId();
      const assetBasePath = `${IMAGE_ROOT_PATH[type]}/${assetId}`;
      const variantUrls = await uploadVariants(croppedBlob, type, assetBasePath);
      const heroUrl = variantUrls[HERO_VARIANT_KEY[type]];

      if (!heroUrl) {
        throw new Error('대표 이미지 URL을 확인할 수 없습니다.');
      }

      if (type === 'logo') {
        setLogoPreview(heroUrl);
        setValue('logo_url', heroUrl);
        setLogoAssetBasePath(assetBasePath);
      } else {
        setCoverPreview(heroUrl);
        setValue('cover_url', heroUrl);
        setCoverAssetBasePath(assetBasePath);
      }

      toast({
        title: '업로드 성공',
        description: '이미지가 성공적으로 업로드되었습니다.',
      });
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      toast({
        title: '업로드 실패',
        description: '이미지 업로드에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearLogo = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await removeExistingAsset(logoAssetBasePath, 'logo');
      setLogoAssetBasePath(null);
    } catch (error) {
      console.error('로고 제거 실패:', error);
    } finally {
      setLoading(false);
      setLogoPreview(null);
      setValue('logo_url', null);
    }
  };

  const clearCover = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await removeExistingAsset(coverAssetBasePath, 'cover');
      setCoverAssetBasePath(null);
    } catch (error) {
      console.error('커버 이미지 제거 실패:', error);
    } finally {
      setLoading(false);
      setCoverPreview(null);
      setValue('cover_url', null);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 매장명 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              매장명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name', { required: '매장명은 필수입니다' })}
              placeholder="예: 카페 모카"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* 매장 로고 */}
          <div className="space-y-2">
            <Label htmlFor="logo">매장 로고</Label>
            <div className="flex items-start gap-4">
              {/* 로고 미리보기 */}
              {logoPreview && logoPreview.trim() !== '' ? (
                <div className="relative w-32 h-32 border rounded-full overflow-hidden">
                  <NextImage
                    src={logoPreview}
                    alt="로고 미리보기"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void clearLogo();
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed rounded-full flex items-center justify-center bg-gray-50">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}

              {/* 파일 업로드 버튼 */}
              <div className="flex-1">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e, 'logo')}
                  disabled={loading}
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500 mt-1">
                  원형으로 표시됩니다 (PNG, JPG)
                </p>
              </div>
            </div>
          </div>

          {/* 커버 이미지 */}
          <div className="space-y-2">
            <Label htmlFor="cover">커버 이미지</Label>
            <div className="flex items-start gap-4">
              {/* 커버 이미지 미리보기 */}
              {coverPreview && coverPreview.trim() !== '' ? (
                <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                  <NextImage
                    src={coverPreview}
                    alt="커버 이미지 미리보기"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void clearCover();
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}

              {/* 파일 업로드 버튼 */}
              <div className="flex-1">
                <Input
                  id="cover"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e, 'cover')}
                  disabled={loading}
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500 mt-1">
                  16:9 비율 권장 (PNG, JPG)
                </p>
              </div>
            </div>
          </div>

          {/* 연락처 */}
          <div className="space-y-2">
            <Label htmlFor="phone">연락처</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="010-1234-5678"
              disabled={loading}
            />
          </div>

          {/* 영업시간 */}
          <div className="space-y-2">
            <Label htmlFor="business_hours">영업시간</Label>
            <Textarea
              id="business_hours"
              {...register('business_hours')}
              placeholder="월-금: 09:00 - 22:00&#10;토-일: 10:00 - 20:00"
              rows={3}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>추가 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 주의사항 */}
          <div className="space-y-2">
            <Label htmlFor="notice">주의사항</Label>
            <Textarea
              id="notice"
              {...register('notice')}
              placeholder="고객에게 알리고 싶은 중요한 공지사항을 입력하세요"
              rows={3}
              disabled={loading}
            />
            <p className="text-sm text-gray-500">
              예: 주차 가능, 반려동물 동반 가능 등
            </p>
          </div>

          {/* 매장 소개 */}
          <div className="space-y-2">
            <Label htmlFor="description">매장 소개</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="매장에 대한 소개를 작성해주세요"
              rows={5}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* 버튼 */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          취소
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Spinner size="sm" className="mr-2" />}
          {isEdit ? '수정하기' : '등록하기'}
        </Button>
      </div>

      {/* 이미지 크롭 다이얼로그 */}
      <ImageCropDialog
        open={cropDialogOpen}
        imageSrc={cropImageSrc}
        onClose={() => setCropDialogOpen(false)}
        onCropComplete={handleCropComplete}
        aspectRatio={cropType === 'logo' ? 1 : 16 / 9}
        cropShape={cropType === 'logo' ? 'round' : 'rect'}
      />
    </form>
  );
}
