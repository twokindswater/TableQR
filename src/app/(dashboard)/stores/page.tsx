'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Store } from '@/types/database';
import { StoreCard } from '@/components/stores/store-card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { useAccountSync } from '@/hooks/use-account-sync';
import { Plus, Store as StoreIcon } from 'lucide-react';
import Link from 'next/link';
import {
  getStoresByUserId,
  deleteStore,
} from '@/lib/supabase-helpers';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';

export default function StoresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  useAccountSync(); // 계정 동기화

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStores = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const data = await getStoresByUserId(session.user.id);
      setStores(data);
    } catch (error) {
      console.error('스토어 조회 실패:', error);
      
      // 개발 중: Mock 데이터 사용
      if (process.env.NODE_ENV === 'development') {
        const { mockStoreAPI } = await import('@/lib/mock-data');
        const mockData = mockStoreAPI.getAll();
        setStores(mockData);
        toast({
          title: '개발 모드',
          description: 'Mock 데이터를 사용 중입니다. Supabase를 활성화하세요.',
          variant: 'default',
        });
      } else {
        toast({
          title: '오류',
          description: '스토어 목록을 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, toast]);

  // 스토어 목록 조회
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user?.id) {
      loadStores();
    }
  }, [session, status, router, loadStores]);

  const handleDeleteClick = async (storeId: number) => {
    const confirmed = window.confirm('정말로 이 가게를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.');
    
    if (!confirmed) return;

    try {
      await deleteStore(storeId);
      toast({
        title: '삭제 완료',
        description: '스토어가 성공적으로 삭제되었습니다.',
      });
      loadStores(); // 목록 새로고침
    } catch (error) {
      console.error('스토어 삭제 실패:', error);
      
      // 개발 중: Mock 데이터 사용
      if (process.env.NODE_ENV === 'development') {
        const { mockStoreAPI } = await import('@/lib/mock-data');
        mockStoreAPI.delete(storeId);
        
        toast({
          title: '개발 모드',
          description: 'Mock 데이터에서 삭제되었습니다.',
        });
        
        loadStores();
      } else {
        toast({
          title: '오류',
          description: '스토어 삭제에 실패했습니다.',
          variant: 'destructive',
        });
      }
    }
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // 스토어가 없는 경우
  if (stores.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <StoreIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">아직 등록된 가게가 없습니다</h2>
            <p className="text-gray-600 mb-6">
              첫 번째 가게를 등록하고 메뉴 관리를 시작해보세요!
            </p>
            <Link href="/stores/new">
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                가게 추가하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 스토어 목록 표시
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">내 가게 목록</h1>
            <p className="text-gray-600">
              총 {stores.length}개의 가게를 운영 중입니다
            </p>
          </div>
          <Link href="/stores/new">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              가게 추가
            </Button>
          </Link>
        </div>

        {/* 스토어 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <StoreCard
              key={store.store_id}
              store={store}
              menuCount={0} // TODO: 실제 메뉴 개수 조회
              onDelete={handleDeleteClick}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

