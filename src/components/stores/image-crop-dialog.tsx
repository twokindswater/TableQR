'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedImage: Blob) => void;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
}

export function ImageCropDialog({
  open,
  imageSrc,
  onClose,
  onCropComplete,
  aspectRatio = 1,
  cropShape = 'rect',
}: ImageCropDialogProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

  // 다이얼로그가 열릴 때마다 초기화
  useEffect(() => {
    if (open) {
      setCrop(undefined);
      setCompletedCrop(null);
    }
  }, [open]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const el = containerRef.current;
    if (!el) return;
    // 초기 crop을 컨테이너 가장자리에 맞춘 비율 박스 중앙 배치
    const containerW = el.clientWidth;
    const containerH = el.clientHeight;
    const containerAspect = containerW / containerH;
    let width: number;
    let height: number;
    if (containerAspect > aspectRatio) {
      height = Math.round(containerH * 0.8);
      width = Math.round(height * aspectRatio);
    } else {
      width = Math.round(containerW * 0.8);
      height = Math.round(width / aspectRatio);
    }
    const x = Math.round((containerW - width) / 2);
    const y = Math.round((containerH - height) / 2);
    // react-image-crop expects coordinates in pixels when unit:'px'
    setCrop({ unit: 'px', x, y, width, height });
  };

  const createCroppedImage = async () => {
    if (!imgRef.current || !completedCrop) return;
    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = Math.floor(completedCrop.width * scaleX);
      canvas.height = Math.floor(completedCrop.height * scaleY);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        Math.floor(completedCrop.x * scaleX),
        Math.floor(completedCrop.y * scaleY),
        Math.floor(completedCrop.width * scaleX),
        Math.floor(completedCrop.height * scaleY),
        0,
        0,
        Math.floor(completedCrop.width * scaleX),
        Math.floor(completedCrop.height * scaleY)
      );

      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob);
          onClose();
        }
      }, 'image/jpeg');
    } catch (error) {
      console.error('이미지 크롭 실패:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>이미지 크롭</DialogTitle>
          <DialogDescription>
            이미지를 드래그하거나 줌을 조절하여 원하는 영역을 선택하세요.
          </DialogDescription>
        </DialogHeader>
        <div ref={containerRef} className="relative h-[400px] w-full overflow-hidden">
          <ReactCrop
            className="h-full w-full"
            style={{ height: '100%', maxHeight: '100%' }}
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            keepSelection
            locked={false}
            ruleOfThirds
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="crop source"
              onLoad={onImageLoad}
              className="h-full w-full object-contain"
              style={{ maxHeight: '100%', maxWidth: '100%' }}
            />
          </ReactCrop>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={createCroppedImage}>완료</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
