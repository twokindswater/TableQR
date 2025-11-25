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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedImage: Blob) => void;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
}

type ResizeMode = 'original' | 'custom';

export function ImageCropDialog({
  open,
  imageSrc,
  onClose,
  onCropComplete,
  aspectRatio,
  cropShape = 'rect',
}: ImageCropDialogProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>();
  const [resizeMode, setResizeMode] = useState<ResizeMode>('original');
  const [customWidth, setCustomWidth] = useState<number>(0);
  const [customHeight, setCustomHeight] = useState<number>(0);
  const [croppedNaturalSize, setCroppedNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(false);

  // 다이얼로그가 열릴 때마다 초기화
  useEffect(() => {
    if (open) {
      setImageSize(undefined);
      setCrop(undefined);
      setCompletedCrop(null);
      setResizeMode('original');
      setCustomWidth(0);
      setCustomHeight(0);
      setCroppedNaturalSize(null);
      setMaintainAspectRatio(false);
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

    // 비율이 지정된 경우에만 비율 고정 크롭, 그렇지 않으면 자유 크롭
    let initialPixelCrop: PixelCrop;
    
    if (aspectRatio) {
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

      initialPixelCrop = {
        unit: 'px',
        x: Math.round((displayWidth * initialPercentCrop.x) / 100),
        y: Math.round((displayHeight * initialPercentCrop.y) / 100),
        width: Math.round((displayWidth * initialPercentCrop.width) / 100),
        height: Math.round((displayHeight * initialPercentCrop.height) / 100),
      };
    } else {
      // 비율 고정 없이 80% 크기로 초기 크롭 영역 생성
      const cropWidth = Math.round(displayWidth * 0.8);
      const cropHeight = Math.round(displayHeight * 0.8);
      const cropX = Math.round((displayWidth - cropWidth) / 2);
      const cropY = Math.round((displayHeight - cropHeight) / 2);

      initialPixelCrop = {
        unit: 'px',
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight,
      };
    }

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

      // 원본 크롭된 이미지 크기 계산
      const croppedWidth = Math.floor(completedCrop.width * scaleX);
      const croppedHeight = Math.floor(completedCrop.height * scaleY);

      // 크기 조절 로직
      let finalWidth = croppedWidth;
      let finalHeight = croppedHeight;

      if (resizeMode === 'custom' && customWidth > 0 && customHeight > 0) {
        // 사용자가 지정한 가로/세로 크기 사용
        finalWidth = customWidth;
        finalHeight = customHeight;
      }
      // resizeMode === 'original'인 경우 원본 크기 유지

      canvas.width = finalWidth;
      canvas.height = finalHeight;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 크롭된 이미지를 캔버스에 그리기 (리사이즈 포함)
      ctx.drawImage(
        image,
        Math.floor(completedCrop.x * scaleX),
        Math.floor(completedCrop.y * scaleY),
        croppedWidth,
        croppedHeight,
        0,
        0,
        finalWidth,
        finalHeight
      );

      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob);
          onClose();
        }
      }, 'image/jpeg', 0.92);
    } catch (error) {
      console.error('Failed to crop image:', error);
    }
  };

  // 크롭 영역이 변경될 때 원본 크기 저장 및 커스텀 크기 초기화
  useEffect(() => {
    if (completedCrop && imgRef.current) {
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const naturalWidth = Math.floor(completedCrop.width * scaleX);
      const naturalHeight = Math.floor(completedCrop.height * scaleY);
      
      setCroppedNaturalSize({
        width: naturalWidth,
        height: naturalHeight,
      });
      
      // 커스텀 크기를 원본 크기로 초기화
      if (resizeMode === 'custom' && (customWidth === 0 || customHeight === 0)) {
        setCustomWidth(naturalWidth);
        setCustomHeight(naturalHeight);
      }
    }
  }, [completedCrop, resizeMode, customWidth, customHeight]);

  // 비율 유지 옵션이 변경될 때 높이 자동 조절
  useEffect(() => {
    if (maintainAspectRatio && croppedNaturalSize && customWidth > 0) {
      const ratio = croppedNaturalSize.height / croppedNaturalSize.width;
      setCustomHeight(Math.round(customWidth * ratio));
    }
  }, [maintainAspectRatio, customWidth, croppedNaturalSize]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crop & Resize Image</DialogTitle>
          <DialogDescription>
            Drag or zoom to select the desired area, then adjust the final image size.
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
            aspect={aspectRatio || undefined}
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

        {/* 크기 조절 옵션 */}
        {completedCrop && croppedNaturalSize && (
          <div className="space-y-4 py-4 border-t">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Resize Options</Label>
              <div className="text-xs text-gray-500">
                Cropped size: {croppedNaturalSize.width} × {croppedNaturalSize.height}px
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resize-mode" className="text-sm">
                Resize Mode
              </Label>
              <Select value={resizeMode} onValueChange={(value) => setResizeMode(value as ResizeMode)}>
                <SelectTrigger id="resize-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original Size</SelectItem>
                  <SelectItem value="custom">Custom Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {resizeMode === 'custom' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="maintain-ratio"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="maintain-ratio" className="text-sm cursor-pointer">
                    Maintain aspect ratio
                  </Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-width" className="text-sm">
                      Width (px)
                    </Label>
                    <Input
                      id="custom-width"
                      type="number"
                      min="1"
                      max="5000"
                      value={customWidth || ''}
                      onChange={(e) => {
                        const width = parseInt(e.target.value) || 0;
                        setCustomWidth(width);
                        if (maintainAspectRatio && croppedNaturalSize) {
                          const ratio = croppedNaturalSize.height / croppedNaturalSize.width;
                          setCustomHeight(Math.round(width * ratio));
                        }
                      }}
                      placeholder="Width"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-height" className="text-sm">
                      Height (px)
                    </Label>
                    <Input
                      id="custom-height"
                      type="number"
                      min="1"
                      max="5000"
                      value={customHeight || ''}
                      onChange={(e) => {
                        const height = parseInt(e.target.value) || 0;
                        setCustomHeight(height);
                        if (maintainAspectRatio && croppedNaturalSize) {
                          const ratio = croppedNaturalSize.width / croppedNaturalSize.height;
                          setCustomWidth(Math.round(height * ratio));
                        }
                      }}
                      placeholder="Height"
                    />
                  </div>
                </div>

                {customWidth > 0 && customHeight > 0 && (
                  <div className="text-xs text-gray-500">
                    Final size: {customWidth} × {customHeight}px
                    {maintainAspectRatio && (
                      <span className="ml-2 text-blue-600">(Aspect ratio maintained)</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {resizeMode === 'original' && (
              <div className="text-xs text-gray-500">
                Image will be saved at original cropped size: {croppedNaturalSize.width} ×{' '}
                {croppedNaturalSize.height}px
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={createCroppedImage} disabled={!completedCrop}>
            Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
