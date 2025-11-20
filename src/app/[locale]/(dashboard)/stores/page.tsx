"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Store as StoreIcon } from "lucide-react";
import { useRouter } from "@/navigation";
import { useLocale, useTranslations } from "next-intl";

import { Store } from "@/types/database";
import { StoreCard } from "@/components/stores/store-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";

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

interface LimitBannerCopy {
  title: string
  body: string
  button: string
}

interface UpgradeCopy {
  title: string
  description: string
  action: string
}

function formatShortDate(locale: string, date: Date | null) {
  if (!date || Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale, { month: "long", day: "numeric" }).format(date)
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
import { useSession } from '@/hooks/use-session';

type StoreWithMenuCount = Store & { menuCount: number }

export default function StoresPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const locale = useLocale();
  const t = useTranslations("dashboard.stores");
  const tCommon = useTranslations("common.actions");
  const [stores, setStores] = useState<StoreWithMenuCount[]>([]);
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
        const response = await fetch('/api/stores', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('failed to load stores')
        }
        const payload = await response.json()
        const storeData: StoreWithMenuCount[] = Array.isArray(payload?.stores)
          ? payload.stores.map((store: StoreWithMenuCount) => ({
              ...store,
              menuCount: typeof store.menuCount === 'number' ? store.menuCount : 0,
            }))
          : []
        setStores(storeData);
      } catch (error) {
        console.error('Failed to fetch stores:', error);
        toast({
          title: t("toasts.loadError.title"),
          description: t("toasts.loadError.description"),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (sessionStatus === 'loading') {
      return
    }
    if (sessionStatus !== 'authenticated' || !session?.user?.id) {
      setStores([])
      setLoading(false)
      return
    }

    loadStores();
  }, [session?.user?.id, sessionStatus, t, toast]);

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
        console.error('Failed to load subscription:', error);
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
  const checkoutLabels = useMemo<
    Partial<Record<Exclude<SubscriptionStatus, "loading">, string>>
  >(
    () => ({
      none: t("checkoutActions.none"),
      trialing: t("checkoutActions.trialing"),
      active: t("checkoutActions.active"),
      canceled: t("checkoutActions.canceled"),
      past_due: t("checkoutActions.past_due"),
      unpaid: t("checkoutActions.unpaid"),
      incomplete: t("checkoutActions.incomplete"),
      incomplete_expired: t("checkoutActions.incomplete_expired"),
    }),
    [t],
  )
  const checkoutActionLabel =
    checkoutLabels[subscription.status as Exclude<SubscriptionStatus, "loading">] ??
    t("checkoutActions.default");
  const showLimitBanner = isLimited && stores.length > 0;
  const trialEndText = formatShortDate(locale, trialEndDate);
  const currentPeriodEndText = formatShortDate(locale, currentPeriodEndDate);
  const cancellationNotice =
    subscription.cancelAtPeriodEnd && currentPeriodEndText
      ? t("billingBanner.cancellationNotice", { date: currentPeriodEndText })
      : null;
  const limitBannerCopy = useMemo(() => {
    if (subscription.status === "none") {
      return t.raw("limitBanner.trial") as LimitBannerCopy
    }
    return {
      ...(t.raw("limitBanner.renewal") as LimitBannerCopy),
      button: checkoutActionLabel,
    }
  }, [checkoutActionLabel, subscription.status, t])
  const handleCheckoutRedirect = () => {
    if (!CHECKOUT_PATH) {
      toast({
        title: t("toasts.checkoutMissing.title"),
        description: t("toasts.checkoutMissing.description"),
        variant: 'destructive',
      });
      return;
    }
    router.push(CHECKOUT_PATH);
  };

  const handleOpenPortal = () => {
    router.push('/api/billing/portal');
  };
  const upgradeDialogCopy = useMemo<UpgradeCopy>(() => {
    if (subscription.status === "none") {
      return t.raw("upgradeDialog.trial") as UpgradeCopy
    }
    if (needsRenewal) {
      return t.raw("upgradeDialog.renewal") as UpgradeCopy
    }
    if (subscription.status === "canceled") {
      return t.raw("upgradeDialog.canceled") as UpgradeCopy
    }
    return {
      ...(t.raw("upgradeDialog.default") as UpgradeCopy),
      action: checkoutActionLabel,
    }
  }, [checkoutActionLabel, needsRenewal, subscription.status, t])

  const rawBillingBanner: BannerConfig | null = (() => {
    if (subscriptionLoading) return null;
    switch (subscription.status) {
      case 'trialing':
        return {
          tone: 'warning',
          title: trialDaysLeft !== null ? t('billingBanner.trialing.titleCountdown', { days: trialDaysLeft }) : t('billingBanner.trialing.titleDefault'),
          body: trialEndText
            ? t('billingBanner.trialing.body', { date: trialEndText })
            : t('billingBanner.trialing.bodyNoDate'),
          actionLabel: t('billingBanner.trialing.action'),
          action: handleOpenPortal,
        };
      case 'active':
        return {
          tone: 'success',
          title: t('billingBanner.active.title', { plan: planLabel }),
          body: t('billingBanner.active.body'),
          actionLabel: t('billingBanner.active.action'),
          action: handleOpenPortal,
        };
      case 'none':
        return {
          tone: 'info',
          title: t('billingBanner.none.title'),
          body: t('billingBanner.none.body'),
          actionLabel: t('billingBanner.none.action'),
          action: handleCheckoutRedirect,
        };
      case 'canceled':
        return {
          tone: 'warning',
          title: t('billingBanner.canceled.title'),
          body: t('billingBanner.canceled.body'),
          actionLabel: t('billingBanner.canceled.action'),
          action: handleCheckoutRedirect,
          secondaryLabel: t('billingBanner.canceled.secondary'),
          secondaryAction: handleOpenPortal,
        };
      default:
        if (needsRenewal) {
          return {
            tone: 'danger',
            title: t('billingBanner.renewal.title'),
            body: t('billingBanner.renewal.body'),
            actionLabel: t('billingBanner.renewal.action'),
            action: handleCheckoutRedirect,
            secondaryLabel: t('billingBanner.renewal.secondary'),
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
    if (!session?.user?.id) {
      toast({
        title: t("toasts.deleteUnauthorized.title"),
        description: t("toasts.deleteUnauthorized.description"),
        variant: 'destructive',
      });
      return;
    }
    const confirmed = window.confirm(t("confirmDelete"));
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/stores/${storeId}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('failed to delete store')
      }
      
      toast({
        title: t("toasts.deleteSuccess.title"),
        description: t("toasts.deleteSuccess.description"),
      });
      
      // Refresh list
      setStores(stores.filter(store => store.store_id !== storeId));
    } catch (error) {
      console.error('Failed to delete store:', error);
      toast({
        title: t("toasts.deleteError.title"),
        description: t("toasts.deleteError.description"),
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
              <h2 className="mb-2 text-2xl font-bold">{t("empty.title")}</h2>
              <p className="mb-6 text-gray-600">{t("empty.description")}</p>
              <Button size="lg" onClick={handleAddStoreClick} disabled={subscriptionLoading}>
                <Plus className="mr-2 h-5 w-5" />
                {t("empty.button")}
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
              <AlertDialogCancel>{tCommon("close")}</AlertDialogCancel>
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
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">{t("heading")}</h1>
              <p className="text-gray-600">{t("subheading", { count: stores.length })}</p>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Button onClick={handleAddStoreClick} disabled={subscriptionLoading}>
                <Plus className="mr-2 h-5 w-5" />
                {t("actions.add")}
              </Button>
            </div>
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

          {/* Store grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <StoreCard
                key={store.store_id}
                store={store}
                menuCount={store.menuCount}
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
            <AlertDialogCancel>{tCommon("close")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCheckoutRedirect}>
              {upgradeDialogCopy.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
