'use client';

import { Store } from '@/types/database';
import { StoreCard } from '@/components/stores/store-card';
import { Button } from '@/components/ui/button';
import { Plus, Store as StoreIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/spinner';

export default function StoresPage() {
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setStores(data || []);
      } catch (error) {
        console.error('스토어 조회 실패:', error);
        toast({
          title: '오류',
          description: '스토어 목록을 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, [toast]);

  const handleDeleteClick = async (storeId: number) => {
    const confirmed = window.confirm('정말로 이 가게를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.');
    
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('store_id', storeId);

      if (error) throw error;
      
      toast({
        title: '삭제 완료',
        description: '스토어가 성공적으로 삭제되었습니다.',
      });
      
      // 목록 새로고침
      setStores(stores.filter(store => store.store_id !== storeId));
    } catch (error) {
      console.error('스토어 삭제 실패:', error);
      toast({
        title: '오류',
        description: '스토어 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

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
              menuCount={0}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

