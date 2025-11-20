'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useCallback, useEffect, useRef } from 'react';
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
  areCropsEqual,
} from 'react-image-crop';
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
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>();

  // 다이얼로그가 열릴 때마다 초기화
  useEffect(() => {
    if (open) {
      setImageSize(undefined);
      setCrop(undefined);
      setCompletedCrop(null);
    }
  }, [open]);

  const clampCrop = useCallback(
    (nextCrop: PixelCrop): PixelCrop => {
      if (!imageSize) return nextCrop;
      const width = Math.min(nextCrop.width, imageSize.width);
      const height = Math.min(nextCrop.height, imageSize.height);
      const maxX = Math.max(imageSize.width - width, 0);
      const maxY = Math.max(imageSize.height - height, 0);
      const x = Math.min(Math.max(nextCrop.x, 0), maxX);
      const y = Math.min(Math.max(nextCrop.y, 0), maxY);
      return { unit: 'px', x, y, width, height };
    },
    [imageSize]
  );

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const image = e.currentTarget;
    imgRef.current = image;
    const { naturalWidth, naturalHeight } = image;
    const container = containerRef.current;
    const containerWidth = container?.clientWidth ?? naturalWidth;
    const maxHeight = 400;

    let displayWidth = Math.min(containerWidth, naturalWidth);
    let displayHeight = (naturalHeight / naturalWidth) * displayWidth;

    if (displayHeight > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = (naturalWidth / naturalHeight) * displayHeight;
    }

    displayWidth = Math.round(displayWidth);
    displayHeight = Math.round(displayHeight);

    setImageSize({ width: displayWidth, height: displayHeight });

    const initialPercentCrop = centerCrop(
      makeAspectCrop(
        { unit: '%', width: 80 },
        aspectRatio,
        naturalWidth,
        naturalHeight
      ),
      naturalWidth,
      naturalHeight
    );

    const initialPixelCrop: PixelCrop = {
      unit: 'px',
      x: Math.round((displayWidth * initialPercentCrop.x) / 100),
      y: Math.round((displayHeight * initialPercentCrop.y) / 100),
      width: Math.round((displayWidth * initialPercentCrop.width) / 100),
      height: Math.round((displayHeight * initialPercentCrop.height) / 100),
    };

    const clamped = clampCrop(initialPixelCrop);
    setCrop(clamped);
    setCompletedCrop(clamped);
  };

  const createCroppedImage = async () => {
    if (!imgRef.current || !completedCrop || !completedCrop.width || !completedCrop.height)
      return;
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
        <div
          ref={containerRef}
          className="relative w-full max-h-[400px] overflow-hidden flex items-center justify-center"
          style={{ height: imageSize?.height }}
        >
          <ReactCrop
            className="max-h-full max-w-full"
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              width: imageSize?.width,
              height: imageSize?.height,
            }}
            crop={crop}
            onChange={(nextCrop) => {
              const clamped = clampCrop(nextCrop);
              setCrop((prev) => (prev && areCropsEqual(prev, clamped) ? prev : clamped));
            }}
            onComplete={(nextCrop) => setCompletedCrop(clampCrop(nextCrop))}
            aspect={aspectRatio}
            keepSelection
            locked={false}
            ruleOfThirds
            circularCrop={cropShape === 'round'}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="crop source"
              onLoad={onImageLoad}
              className="max-h-[400px] max-w-full object-contain"
              style={{
                maxHeight: '400px',
                maxWidth: '100%',
                width: imageSize?.width,
                height: imageSize?.height,
              }}
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
