'use client';

import { useSession } from '@/hooks/use-session';
import { useRouter, Link } from '@/navigation';
import { StoreForm } from '@/components/stores/store-form';
import { StoreInsert } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations, useLocale } from 'next-intl';

export default function NewStorePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('dashboard.storeEditor');
  const locale = useLocale();

  if (status === 'unauthenticated') {
    router.push('/login', { locale });
    return null;
  }

  if (status === 'loading') {
    return <div>{t('loading')}</div>;
  }

  const handleSubmit = async (data: StoreInsert) => {
    if (!session?.user?.id) {
      toast({
        title: t('create.errorTitle'),
        description: t('authRequired'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('failed to create store');
      }

      toast({
        title: t('create.successTitle'),
        description: t('create.successDescription'),
      });

      router.push('/stores', { locale });
    } catch (error) {
      console.error('스토어 생성 실패:', error);
      toast({
        title: t('create.errorTitle'),
        description: t('create.errorDescription'),
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/stores', { locale });
  };

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
          <h1 className="mb-2 text-3xl font-bold">{t('create.title')}</h1>
          <p className="text-gray-600">{t('create.description')}</p>
        </div>

        <StoreForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
