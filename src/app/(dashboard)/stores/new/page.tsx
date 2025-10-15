'use client';

import { useSession } from '@/hooks/use-session';
import { useRouter } from 'next/navigation';
import { StoreForm } from '@/components/stores/store-form';
import { createStore } from '@/lib/supabase-helpers';
import { StoreInsert } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewStorePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  // 인증 확인
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (data: StoreInsert) => {
    if (!session?.user?.id) {
      toast({
        title: '오류',
        description: '로그인이 필요합니다.',
        variant: 'destructive',
      });
      return;
    }

    const storeData: StoreInsert = {
      ...data,
      user_id: session.user.id,
    };

    try {
      const newStore = await createStore(storeData);

      toast({
        title: '성공',
        description: '새로운 가게가 등록되었습니다!',
      });

      // 스토어 목록 페이지로 이동
      router.push('/stores');
    } catch (error) {
      console.error('스토어 생성 실패:', error);
      toast({
        title: '오류',
        description: '가게 등록에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/stores');
  };

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
          <h1 className="text-3xl font-bold mb-2">새 가게 등록</h1>
          <p className="text-gray-600">
            가게 정보를 입력하고 메뉴 관리를 시작하세요
          </p>
        </div>

        {/* 폼 */}
        <StoreForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}

