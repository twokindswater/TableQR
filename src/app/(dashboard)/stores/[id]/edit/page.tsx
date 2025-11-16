'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/hooks/use-session';
import { useRouter, useParams } from 'next/navigation';
import { StoreForm } from '@/components/stores/store-form';
import { Store, StoreInsert } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EditStorePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const storeId = Number(params.id);

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStore = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${storeId}`, { cache: 'no-store' })
      if (response.status === 404) {
        toast({
          title: '오류',
          description: '스토어를 찾을 수 없습니다.',
          variant: 'destructive',
        });
        router.push('/stores');
        return;
      }
      if (!response.ok) {
        throw new Error('failed to load store');
      }

      const payload = await response.json();
      const data = payload?.store ?? null;

      if (!data) {
        toast({
          title: '오류',
          description: '스토어를 찾을 수 없습니다.',
          variant: 'destructive',
        });
        router.push('/stores');
        return;
      }

      setStore(data);
    } catch (error) {
      console.error('스토어 조회 실패:', error);
      toast({
        title: '오류',
        description: '스토어 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
      router.push('/stores');
    } finally {
      setLoading(false);
    }
  }, [storeId, router, toast]);

  // 스토어 정보 조회
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (storeId) {
      loadStore();
    }
  }, [storeId, status, router, loadStore]);

  const handleSubmit = async (data: StoreInsert) => {
    if (!session?.user?.id) {
      toast({
        title: '오류',
        description: '로그인이 필요합니다.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('failed to update store')
      }

      toast({
        title: '성공',
        description: '스토어 정보가 수정되었습니다!',
      });

      router.push('/stores');
    } catch (error) {
      console.error('스토어 수정 실패:', error);
      toast({
        title: '오류',
        description: '스토어 수정에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/stores');
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // 스토어 정보가 없는 경우
  if (!store) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/stores">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로가기
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">가게 정보 수정</h1>
          <p className="text-gray-600">가게 정보를 업데이트하세요</p>
        </div>

        {/* 폼 */}
        <StoreForm
          initialData={store}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit
        />
      </div>
    </div>
  );
}
