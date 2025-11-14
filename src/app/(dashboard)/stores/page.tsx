'use client';

import { useEffect, useState } from 'react';
import { Plus, Store as StoreIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Store } from '@/types/database';
import { StoreCard } from '@/components/stores/store-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/spinner';

type SubscriptionStatus = 'loading' | 'none' | 'trialing' | 'active' | 'past_due'

interface SubscriptionSnapshot {
  status: SubscriptionStatus
  storeLimit: number | null
  trialEndsAt: string | null
}
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CHECKOUT_PATH } from '@/lib/checkout';

export default function StoresPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionSnapshot>({
    status: 'loading',
    storeLimit: 1,
    trialEndsAt: null,
  });
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

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

  useEffect(() => {
    let active = true;
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription');
        if (!response.ok) {
          throw new Error('failed to load subscription');
        }
        const data = await response.json();
        if (!active) return;
        setSubscription({
          status: data.status ?? 'none',
          storeLimit:
            typeof data.storeLimit === 'number' || data.storeLimit === null ? data.storeLimit : 1,
          trialEndsAt: data.trialEndsAt ?? null,
        });
      } catch (error) {
        console.error('구독 정보 조회 실패:', error);
        if (active) {
          setSubscription({
            status: 'none',
            storeLimit: 1,
            trialEndsAt: null,
          });
        }
      }
    };

    fetchSubscription();
    return () => {
      active = false;
    };
  }, []);

  const subscriptionLoading = subscription.status === 'loading';
  const canCreateStore =
    subscription.status === 'active' || subscription.status === 'trialing' || stores.length === 0;
  const showLimitBanner = subscription.status === 'none' && stores.length > 0;

  const handleAddStoreClick = () => {
    if (subscriptionLoading) {
      return;
    }
    if (canCreateStore) {
      router.push('/stores/new');
      return;
    }
    setUpgradeDialogOpen(true);
  };

  const handleStartTrial = () => {
    if (!CHECKOUT_PATH) {
      toast({
        title: '결제 설정 필요',
        description: '관리자에게 Polar 상품 ID를 설정해달라고 요청해주세요.',
        variant: 'destructive',
      });
      return;
    }
    router.push(CHECKOUT_PATH);
  };

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
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            <div className="py-12 text-center">
              <StoreIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-2xl font-bold">아직 등록된 가게가 없습니다</h2>
              <p className="mb-6 text-gray-600">첫 번째 가게를 등록하고 메뉴 관리를 시작해보세요!</p>
              <Button size="lg" onClick={handleAddStoreClick} disabled={subscriptionLoading}>
                <Plus className="mr-2 h-5 w-5" />
                가게 추가하기
              </Button>
            </div>
          </div>
        </div>

        <AlertDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>다점포 관리는 Trial 시작 후 이용할 수 있어요</AlertDialogTitle>
              <AlertDialogDescription>
                첫 번째 매장은 무료로 체험할 수 있습니다. 더 많은 매장을 등록하려면 7일 무료 체험을
                시작해주세요.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>닫기</AlertDialogCancel>
              <AlertDialogAction onClick={handleStartTrial}>7일 무료 체험 시작</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* 헤더 */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">내 가게 목록</h1>
              <p className="text-gray-600">총 {stores.length}개의 가게를 운영 중입니다</p>
            </div>
            <Button onClick={handleAddStoreClick} disabled={subscriptionLoading}>
              <Plus className="mr-2 h-5 w-5" />
              가게 추가
            </Button>
          </div>

          {showLimitBanner && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">두 번째 매장은 7일 무료 체험 후 이용할 수 있어요.</p>
              <p className="mt-1">
                Trial을 시작하면 다점포 관리, 실시간 푸시 알림, QR 출력 기능이 즉시 열립니다.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 bg-white text-amber-900 hover:bg-white/80"
                onClick={handleStartTrial}
              >
                7일 무료 체험 시작
              </Button>
            </div>
          )}

          {/* 스토어 그리드 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

      <AlertDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>다점포 관리는 Trial 시작 후 이용할 수 있어요</AlertDialogTitle>
            <AlertDialogDescription>
              무료 체험을 시작하면 매장 수 제한 없이 QR 메뉴, 대기 알림, 이미지 업로드를 사용할 수
              있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartTrial}>7일 무료 체험 시작</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
