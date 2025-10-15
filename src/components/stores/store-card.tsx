'use client';

import { Store } from '@/types/database';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Phone, Clock, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface StoreCardProps {
  store: Store;
  menuCount?: number;
  onDelete?: (storeId: number) => void;
}

export function StoreCard({ store, menuCount = 0, onDelete }: StoreCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* 스토어 로고 */}
      <div className="relative h-48 bg-gray-100">
        {store.logo_url && store.logo_url.trim() !== '' && store.logo_url.startsWith('http') ? (
          <Image
            src={store.logo_url}
            alt={store.name || '매장'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Building2 className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      <CardContent className="pt-4">
        {/* 스토어 이름 */}
        <h3 className="text-xl font-bold mb-3 truncate">{store.name || '매장명 없음'}</h3>

        {/* 메뉴 개수 */}
        <p className="text-sm text-gray-600 mb-3">메뉴 {menuCount}개</p>

        {/* 스토어 정보 */}
        <div className="space-y-2 text-sm text-gray-600">
          {store.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span className="truncate">{store.phone}</span>
            </div>
          )}
          {store.business_hours && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="truncate">{store.business_hours}</span>
            </div>
          )}
        </div>

        {/* 주의사항 (있으면 표시) */}
        {store.notice && (
          <p className="mt-3 text-sm text-amber-600 bg-amber-50 p-2 rounded">
            {store.notice.length > 50
              ? `${store.notice.substring(0, 50)}...`
              : store.notice}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Link href={`/stores/${store.store_id}`} className="flex-1">
          <Button variant="default" className="w-full">
            관리하기
          </Button>
        </Link>
        <Link href={`/stores/${store.store_id}/edit`}>
          <Button variant="outline" size="icon">
            <Edit className="w-4 h-4" />
          </Button>
        </Link>
        {onDelete && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(store.store_id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

