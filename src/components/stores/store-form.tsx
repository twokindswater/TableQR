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
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ImageCropDialog } from './image-crop-dialog';

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

      // Blob을 File로 변환
      const prefix = cropType === 'logo' ? 'logo' : 'cover';
      const fileName = `${prefix}-${Date.now()}.jpg`;
      const file = new File([croppedBlob], fileName, { type: 'image/jpeg' });

      // Supabase Storage에 업로드 (모두 store-logos 버킷 사용)
      const { data, error } = await supabase.storage
        .from('store-logos')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      // 업로드된 파일의 공개 URL 가져오기
      const {
        data: { publicUrl },
      } = supabase.storage.from('store-logos').getPublicUrl(fileName);

      // 미리보기 및 폼 값 업데이트
      if (cropType === 'logo') {
        setLogoPreview(publicUrl);
        setValue('logo_url', publicUrl);
      } else {
        setCoverPreview(publicUrl);
        setValue('cover_url', publicUrl);
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

  const clearLogo = () => {
    setLogoPreview(null);
    setValue('logo_url', null);
  };

  const clearCover = () => {
    setCoverPreview(null);
    setValue('cover_url', null);
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
                  <Image
                    src={logoPreview}
                    alt="로고 미리보기"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearLogo}
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
                  <Image
                    src={coverPreview}
                    alt="커버 이미지 미리보기"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearCover}
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
                  정사각형 이미지 권장 (PNG, JPG)
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
        aspectRatio={1}
        cropShape={cropType === 'logo' ? 'round' : 'rect'}
      />
    </form>
  );
}
