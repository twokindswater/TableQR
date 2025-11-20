"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { StoreInsert, Store } from '@/types/database';
import { Upload, X } from 'lucide-react';
import NextImage from 'next/image';
import {
  deleteStoreImage,
  uploadStoreImage,
} from '@/lib/supabase-storage';
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

export function StoreForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: StoreFormProps) {
  const t = useTranslations('dashboard.storeForm');
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
    try {
      setLoading(true);
      const kind = cropType === 'logo' ? 'store-logo' : 'store-cover';
      const previousUrl = cropType === 'logo' ? logoPreview : coverPreview;
      const { heroUrl } = await uploadStoreImage(kind, croppedBlob, previousUrl);

      if (cropType === 'logo') {
        setLogoPreview(heroUrl);
        setValue('logo_url', heroUrl);
      } else {
        setCoverPreview(heroUrl);
        setValue('cover_url', heroUrl);
      }

      toast({
        title: t('toasts.uploadSuccess'),
        description: t('toasts.uploadSuccessDescription'),
      });
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      toast({
        title: t('toasts.uploadError'),
        description: t('toasts.uploadErrorDescription'),
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
      if (logoPreview) {
        await deleteStoreImage(logoPreview, 'store-logo');
      }
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
      if (coverPreview) {
        await deleteStoreImage(coverPreview, 'store-cover');
      }
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
          <CardTitle>{t('basicInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 매장명 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {t('fields.name.label')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name', { required: t('fields.name.required') })}
              placeholder={t('fields.name.placeholder')}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* 매장 로고 */}
          <div className="space-y-2">
            <Label htmlFor="logo">{t('fields.logo.label')}</Label>
            <div className="flex items-start gap-4">
              {/* 로고 미리보기 */}
              {logoPreview && logoPreview.trim() !== '' ? (
                <div className="relative w-32 h-32 border rounded-full overflow-hidden">
                  <NextImage
                    src={logoPreview}
                    alt={t('fields.logo.alt')}
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
                <p className="mt-1 text-sm text-gray-500">{t('fields.logo.help')}</p>
              </div>
            </div>
          </div>

          {/* 커버 이미지 */}
          <div className="space-y-2">
            <Label htmlFor="cover">{t('fields.cover.label')}</Label>
            <div className="flex items-start gap-4">
              {/* 커버 이미지 미리보기 */}
              {coverPreview && coverPreview.trim() !== '' ? (
                <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                  <NextImage
                    src={coverPreview}
                    alt={t('fields.cover.alt')}
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
                <p className="mt-1 text-sm text-gray-500">{t('fields.cover.help')}</p>
              </div>
            </div>
          </div>

          {/* 연락처 */}
          <div className="space-y-2">
            <Label htmlFor="phone">{t('fields.phone.label')}</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder={t('fields.phone.placeholder')}
              disabled={loading}
            />
          </div>

          {/* 영업시간 */}
          <div className="space-y-2">
            <Label htmlFor="business_hours">{t('fields.businessHours.label')}</Label>
            <Textarea
              id="business_hours"
              {...register('business_hours')}
              placeholder={t('fields.businessHours.placeholder')}
              rows={3}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('additionalInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 주의사항 */}
          <div className="space-y-2">
            <Label htmlFor="notice">{t('fields.notice.label')}</Label>
            <Textarea
              id="notice"
              {...register('notice')}
              placeholder={t('fields.notice.placeholder')}
              rows={3}
              disabled={loading}
            />
            <p className="text-sm text-gray-500">{t('fields.notice.hint')}</p>
          </div>

          {/* 매장 소개 */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('fields.description.label')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('fields.description.placeholder')}
              rows={5}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* 버튼 */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          {t('buttons.cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Spinner size="sm" className="mr-2" />}
          {isEdit ? t('buttons.update') : t('buttons.create')}
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
