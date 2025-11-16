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

type SubscriptionStatus =
  | 'loading'
  | 'none'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'

interface SubscriptionSnapshot {
  status: SubscriptionStatus
  storeLimit: number | null
  trialEndsAt: string | null
  planName: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

type BannerTone = 'info' | 'success' | 'warning' | 'danger'

const NEEDS_RENEWAL_STATUSES: SubscriptionStatus[] = [
  'past_due',
  'unpaid',
  'incomplete',
  'incomplete_expired',
]

const LIMITED_STATUSES: SubscriptionStatus[] = [
  'none',
  'canceled',
  ...NEEDS_RENEWAL_STATUSES,
]

const BANNER_STYLES: Record<
  BannerTone,
  { wrapper: string; accent: string; button: string }
> = {
  success: {
    wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    accent: 'text-emerald-600',
    button: 'bg-white text-emerald-900 hover:bg-white/80',
  },
  warning: {
    wrapper: 'border-amber-200 bg-amber-50 text-amber-900',
    accent: 'text-amber-600',
    button: 'bg-white text-amber-900 hover:bg-white/80',
  },
  danger: {
    wrapper: 'border-rose-200 bg-rose-50 text-rose-900',
    accent: 'text-rose-600',
    button: 'bg-white text-rose-900 hover:bg-white/80',
  },
  info: {
    wrapper: 'border-primary/20 bg-primary-light/30 text-primary-dark',
    accent: 'text-primary',
    button: 'bg-white text-primary hover:bg-white/80',
  },
}

interface BannerConfig {
  tone: BannerTone
  title: string
  body?: string
  actionLabel?: string
  action?: () => void
  secondaryLabel?: string
  secondaryAction?: () => void
}

function getCheckoutActionLabel(status: SubscriptionStatus) {
  switch (status) {
    case 'none':
      return '7일 무료 체험 시작'
    case 'trialing':
      return '체험 유지하기'
    case 'active':
      return '구독 관리하기'
    case 'canceled':
      return '다시 구독하기'
    case 'past_due':
    case 'unpaid':
    case 'incomplete':
    case 'incomplete_expired':
      return '결제 다시 진행하기'
    default:
      return '결제 진행하기'
  }
}

function formatKoreanShortDate(date: Date | null) {
  if (!date || Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
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
    planName: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
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

  // After checkout redirect (?checkoutId=...), force a billing sync
  useEffect(() => {
    const url = new URL(window.location.href)
    const checkoutId = url.searchParams.get('checkoutId')
    const token = url.searchParams.get('customer_session_token')
    if (!checkoutId && !token) return

    let cancelled = false
    const sync = async () => {
      try {
        await fetch('/api/billing/sync', { method: 'POST' })
        if (!cancelled) {
          // refresh subscription state immediately
          const res = await fetch('/api/subscription', { cache: 'no-store' })
          if (res.ok) {
            const data = await res.json()
            setSubscription({
              status: data.status ?? 'none',
              storeLimit: typeof data.storeLimit === 'number' || data.storeLimit === null ? data.storeLimit : 1,
              trialEndsAt: data.trialEndsAt ?? null,
              planName: data.planName ?? null,
              currentPeriodEnd: data.currentPeriodEnd ?? null,
              cancelAtPeriodEnd: Boolean(data.cancelAtPeriodEnd),
            })
          }
        }
      } catch (e) {
        console.error('billing sync failed', e)
      }
    }

    sync()

    return () => {
      cancelled = true
    }
  }, [])

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
          planName: data.planName ?? null,
          currentPeriodEnd: data.currentPeriodEnd ?? null,
          cancelAtPeriodEnd: Boolean(data.cancelAtPeriodEnd),
        });
      } catch (error) {
        console.error('구독 정보 조회 실패:', error);
        if (active) {
          setSubscription({
            status: 'none',
            storeLimit: 1,
            trialEndsAt: null,
            planName: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
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
  const needsRenewal = NEEDS_RENEWAL_STATUSES.includes(subscription.status);
  const isLimited = LIMITED_STATUSES.includes(subscription.status);
  const trialEndDate = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
  const trialDaysLeft =
    trialEndDate && !Number.isNaN(trialEndDate.getTime())
      ? Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;
  const currentPeriodEndDate = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
  const planLabel = subscription.planName ?? 'TableQR Standard';
  const checkoutActionLabel = getCheckoutActionLabel(subscription.status);
  const showLimitBanner = isLimited && stores.length > 0;
  const trialEndText = formatKoreanShortDate(trialEndDate);
  const currentPeriodEndText = formatKoreanShortDate(currentPeriodEndDate);
  const cancellationNotice =
    subscription.cancelAtPeriodEnd && currentPeriodEndText
      ? `${currentPeriodEndText}에 자동 해지됩니다.`
      : null;
  const limitBannerCopy = subscription.status === 'none'
    ? {
        title: '두 번째 매장은 7일 무료 체험 후 이용할 수 있어요.',
        body: 'Trial을 시작하면 다점포 관리, 푸시 알림, 이미지 업로드가 즉시 열립니다.',
        button: '7일 무료 체험 시작',
      }
    : {
        title: '결제가 필요한 상태입니다',
        body: '결제를 완료하면 모든 매장과 메뉴 편집 기능이 다시 활성화됩니다.',
        button: checkoutActionLabel,
      };
  const handleCheckoutRedirect = () => {
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

  const handleOpenPortal = () => {
    router.push('/api/billing/portal');
  };
  const upgradeDialogCopy =
    subscription.status === 'none'
      ? {
          title: '다점포 관리는 Trial 시작 후 이용할 수 있어요',
          description: '무료 체험을 시작하면 두 번째 매장부터 실시간으로 관리할 수 있습니다.',
          action: '7일 무료 체험 시작',
        }
      : needsRenewal
        ? {
            title: '결제를 완료해야 추가 매장을 등록할 수 있어요',
            description: '결제를 다시 진행하면 저장된 매장을 그대로 이어서 사용할 수 있습니다.',
            action: '결제 다시 진행하기',
          }
        : subscription.status === 'canceled'
          ? {
              title: '구독이 해지된 상태입니다',
              description: '다시 구독하면 다점포 관리와 푸시 알림 기능이 다시 활성화됩니다.',
              action: '다시 구독하기',
            }
          : {
              title: '업그레이드가 필요합니다',
              description: '다점포 관리 기능을 이용하려면 구독이 필요합니다.',
              action: checkoutActionLabel,
            };

  const rawBillingBanner: BannerConfig | null = (() => {
    if (subscriptionLoading) return null;
    switch (subscription.status) {
      case 'trialing':
        return {
          tone: 'warning',
          title: trialDaysLeft !== null ? `무료 체험 D-${trialDaysLeft}` : '무료 체험 이용 중',
          body: trialEndText
            ? `${trialEndText}까지 모든 기능을 사용할 수 있어요. 결제/취소는 언제든 구독 관리에서 가능합니다.`
            : '결제/취소는 언제든 구독 관리에서 가능합니다.',
          actionLabel: '구독 관리',
          action: handleOpenPortal,
        };
      case 'active':
        return {
          tone: 'success',
          title: `${planLabel} 이용 중`,
          body: '다점포, 실시간 대기 알림, 이미지 업로드까지 모두 활성화되었습니다.',
          actionLabel: '구독 관리',
          action: handleOpenPortal,
        };
      case 'none':
        return {
          tone: 'info',
          title: '첫 매장은 무료로 시작할 수 있어요',
          body: '7일 무료 체험을 시작하면 다점포 관리와 푸시 알림이 즉시 열립니다.',
          actionLabel: '7일 무료 체험 시작',
          action: handleCheckoutRedirect,
        };
      case 'canceled':
        return {
          tone: 'warning',
          title: '구독이 해지된 상태입니다',
          body: '다시 구독하면 저장된 매장을 그대로 이어서 사용할 수 있어요.',
          actionLabel: '다시 구독하기',
          action: handleCheckoutRedirect,
          secondaryLabel: '구독 관리',
          secondaryAction: handleOpenPortal,
        };
      default:
        if (needsRenewal) {
          return {
            tone: 'danger',
            title: '결제가 필요해요',
            body: '결제를 완료해야 모든 매장을 계속 관리할 수 있습니다.',
            actionLabel: '결제 다시 진행하기',
            action: handleCheckoutRedirect,
            secondaryLabel: '구독 관리',
            secondaryAction: handleOpenPortal,
          };
        }
        return null;
    }
  })();

  const billingBanner =
    cancellationNotice && rawBillingBanner
      ? {
          ...rawBillingBanner,
          body: rawBillingBanner.body
            ? `${rawBillingBanner.body} ${cancellationNotice}`
            : cancellationNotice,
        }
      : rawBillingBanner;

  const billingBannerNode = billingBanner ? (
    <div className={`mb-8 rounded-2xl border p-5 text-sm ${BANNER_STYLES[billingBanner.tone].wrapper}`}>
      <p className="text-base font-semibold">{billingBanner.title}</p>
      {billingBanner.body && <p className="mt-1 text-sm">{billingBanner.body}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {billingBanner.actionLabel && billingBanner.action && (
          <Button
            size="sm"
            className={`${BANNER_STYLES[billingBanner.tone].button}`}
            onClick={billingBanner.action}
          >
            {billingBanner.actionLabel}
          </Button>
        )}
        {billingBanner.secondaryLabel && billingBanner.secondaryAction && (
          <Button
            size="sm"
            variant="outline"
            className="border-current text-current"
            onClick={billingBanner.secondaryAction}
          >
            {billingBanner.secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  ) : null;

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
            {billingBannerNode}
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
              <AlertDialogTitle>{upgradeDialogCopy.title}</AlertDialogTitle>
              <AlertDialogDescription>{upgradeDialogCopy.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>닫기</AlertDialogCancel>
              <AlertDialogAction onClick={handleCheckoutRedirect}>
                {upgradeDialogCopy.action}
              </AlertDialogAction>
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
          {billingBannerNode}
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
              <p className="font-semibold">{limitBannerCopy.title}</p>
              <p className="mt-1">{limitBannerCopy.body}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 bg-white text-amber-900 hover:bg-white/80"
                onClick={handleCheckoutRedirect}
              >
                {limitBannerCopy.button}
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
            <AlertDialogTitle>{upgradeDialogCopy.title}</AlertDialogTitle>
            <AlertDialogDescription>{upgradeDialogCopy.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction onClick={handleCheckoutRedirect}>
              {upgradeDialogCopy.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
