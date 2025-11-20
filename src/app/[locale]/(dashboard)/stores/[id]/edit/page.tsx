'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/hooks/use-session';
import { useRouter, Link } from '@/navigation';
import { useParams } from 'next/navigation';
import { StoreForm } from '@/components/stores/store-form';
import { Store, StoreInsert } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations, useLocale } from 'next-intl';

export default function EditStorePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const t = useTranslations('dashboard.storeEditor');
  const locale = useLocale();
  const storeId = Number(params.id);

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStore = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${storeId}`, { cache: 'no-store' });
      if (response.status === 404) {
        toast({
          title: t('edit.errorTitle'),
          description: t('edit.notFound'),
          variant: 'destructive',
        });
        router.push('/stores', { locale });
        return;
      }
      if (!response.ok) {
        throw new Error('failed to load store');
      }

      const payload = await response.json();
      const data = payload?.store ?? null;

      if (!data) {
        toast({
          title: t('edit.errorTitle'),
          description: t('edit.notFound'),
          variant: 'destructive',
        });
        router.push('/stores', { locale });
        return;
      }

      setStore(data);
    } catch (error) {
      console.error('스토어 조회 실패:', error);
      toast({
        title: t('edit.errorTitle'),
        description: t('edit.errorDescription'),
        variant: 'destructive',
      });
      router.push('/stores', { locale });
    } finally {
      setLoading(false);
    }
  }, [storeId, router, t, toast, locale]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login', { locale });
      return;
    }

    if (storeId) {
      loadStore();
    }
  }, [storeId, status, router, loadStore, locale]);

  const handleSubmit = async (data: StoreInsert) => {
    if (!session?.user?.id) {
      toast({
        title: t('edit.errorTitle'),
        description: t('authRequired'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('failed to update store');
      }

      toast({
        title: t('edit.successTitle'),
        description: t('edit.successDescription'),
      });

      router.push('/stores', { locale });
    } catch (error) {
      console.error('스토어 수정 실패:', error);
      toast({
        title: t('edit.errorTitle'),
        description: t('edit.errorDescription'),
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/stores', { locale });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link href="/stores">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('back')}
            </Button>
          </Link>
          <h1 className="mb-2 text-3xl font-bold">{t('edit.title')}</h1>
          <p className="text-gray-600">{t('edit.description')}</p>
        </div>

        <StoreForm initialData={store} onSubmit={handleSubmit} onCancel={handleCancel} isEdit />
      </div>
    </div>
  );
}
