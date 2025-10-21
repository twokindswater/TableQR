'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface QRCodeDialogProps {
  storeId: number;
  storeName: string | null;
}

export function QRCodeDialog({ storeId, storeName }: QRCodeDialogProps) {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrUrl = `https://tableqr-web.vercel.app/store/${storeId}`;

  useEffect(() => {
    if (open && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        qrUrl,
        {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) {
            console.error('QR 코드 생성 실패:', error);
          }
        }
      );
    }
  }, [open, qrUrl]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${storeName || 'store'}-qr-code.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="w-4 h-4 mr-2" />
          QR 코드 생성
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>주문 QR 코드</DialogTitle>
          <DialogDescription>
            고객이 스캔하여 주문할 수 있는 QR 코드입니다.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <canvas ref={canvasRef} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">{storeName || '스토어'}</p>
            <p className="text-xs text-gray-500 break-all px-4">{qrUrl}</p>
          </div>
          <Button onClick={handleDownload} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            QR 코드 다운로드
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

