'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/types/database.generated';
import { Loader2 } from 'lucide-react';
import { CategoryList } from '@/components/menus/category-list';
import { MenuList } from '@/components/menus/menu-list';
import { QueuePanel } from '@/components/queues/queue-panel';
import { QRCodeDialog } from '@/components/stores/qr-code-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Store = Tables<'stores'>;
type Category = Tables<'categories'>;
type Menu = Tables<'menus'>;

export default function StoreDashboardPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setLoading(true);
        const storeId = params.id;

        // 스토어 정보 로드
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('store_id', storeId)
          .single();

        if (storeError) throw storeError;
        setStore(storeData);

        // 카테고리 로드
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('store_id', storeId)
          .order('display_order', { ascending: true });

        if (categoryError) throw categoryError;
        setCategories(categoryData || []);

        // 메뉴 로드
        const { data: menuData, error: menuError } = await supabase
          .from('menus')
          .select('*')
          .eq('store_id', storeId)
          .order('display_order', { ascending: true });

        if (menuError) throw menuError;
        setMenus(menuData || []);

      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadStoreData();
    }
  }, [params.id]);

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
        <h1 className="text-2xl font-bold">스토어를 찾을 수 없습니다</h1>
        <p className="text-gray-500">요청하신 스토어가 존재하지 않습니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* 스토어 정보 */}
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
            <p className="text-sm text-gray-500">연락처</p>
            <p>{store.phone || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">영업시간</p>
            <p className="whitespace-pre-wrap">{store.business_hours || '-'}</p>
          </div>
        </div>
        {store.notice && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-2">주의사항</p>
            <p className="whitespace-pre-wrap">{store.notice}</p>
          </div>
        )}
      </div>

      {/* 탭 섹션 */}
      <Tabs defaultValue="menu" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="menu">메뉴 관리</TabsTrigger>
          <TabsTrigger value="queue">주문 관리</TabsTrigger>
        </TabsList>

        {/* 메뉴 관리 탭 */}
        <TabsContent value="menu" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* 카테고리 목록 */}
            <div className="md:col-span-1 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">카테고리</h2>
              <CategoryList
                storeId={store.store_id}
                categories={categories}
                onCategoriesChange={setCategories}
              />
            </div>

            {/* 메뉴 목록 */}
            <div className="md:col-span-3 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">메뉴</h2>
              <MenuList
                storeId={store.store_id}
                menus={menus}
                categories={categories}
                onMenusChange={setMenus}
              />
            </div>
          </div>
        </TabsContent>

        {/* 주문 관리 탭 */}
        <TabsContent value="queue" className="mt-6">
          <div className="bg-white rounded-lg shadow p-6 min-h-[600px]">
            <QueuePanel storeId={store.store_id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

