"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { Tables } from '@/types/database.generated';
import { Loader2 } from 'lucide-react';
import { CategoryList } from '@/components/menus/category-list';
import { MenuList } from '@/components/menus/menu-list';
import { QueuePanel } from '@/components/queues/queue-panel';
import { QRCodeDialog } from '@/components/stores/qr-code-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';

type Store = Tables<'stores'>;
type Category = Tables<'categories'>;
type Menu = Tables<'menus'>;

export default function StoreDashboardPage() {
  const params = useParams();
  const { data: session, status: sessionStatus } = useSession();
  const t = useTranslations('dashboard.storeDetails');
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        if (sessionStatus !== 'authenticated') {
          return
        }
        setLoading(true);
        const storeId = params.id;

        const response = await fetch(`/api/stores/${storeId}`, { cache: 'no-store' })
        if (response.status === 404) {
          setStore(null)
          setCategories([])
          setMenus([])
          return
        }
        if (!response.ok) {
          throw new Error('failed to load store')
        }

        const payload = await response.json()
        setStore(payload?.store ?? null);
        setCategories(Array.isArray(payload?.categories) ? payload.categories : []);
        setMenus(Array.isArray(payload?.menus) ? payload.menus : []);

      } catch (error) {
        console.error('Failed to load store data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadStoreData();
    }
  }, [params.id, sessionStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">{t('notFoundTitle')}</h1>
        <p className="text-gray-500">{t('notFoundDescription')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Store info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{store.name}</h1>
            <p className="text-gray-500 whitespace-pre-wrap">{store.description}</p>
          </div>
          <QRCodeDialog storeId={store.store_id} storeName={store.name} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">{t('contact')}</p>
            <p>{store.phone || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('hours')}</p>
            <p className="whitespace-pre-wrap">{store.business_hours || '-'}</p>
          </div>
        </div>
        {store.notice && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-2">{t('notice')}</p>
            <p className="whitespace-pre-wrap">{store.notice}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="menu" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="menu">{t('menuTab')}</TabsTrigger>
          <TabsTrigger value="queue">{t('queueTab')}</TabsTrigger>
        </TabsList>

        {/* Menu tab */}
        <TabsContent value="menu" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Category list */}
            <div className="md:col-span-1 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">{t('categories')}</h2>
              <CategoryList
                storeId={store.store_id}
                categories={categories}
                onCategoriesChange={setCategories}
              />
            </div>

            {/* Menu list */}
            <div className="md:col-span-3 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">{t('menus')}</h2>
              <MenuList
                storeId={store.store_id}
                menus={menus}
                categories={categories}
                onMenusChange={setMenus}
              />
            </div>
          </div>
        </TabsContent>

        {/* Queue tab */}
        <TabsContent value="queue" className="mt-6">
          <div className="bg-white rounded-lg shadow p-6 min-h-[600px]">
            <QueuePanel storeId={store.store_id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
