'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

export function useAccountSync() {
  const { data: session, status } = useSession();
  const [isSynced, setIsSynced] = useState(false);

  const syncAccount = useCallback(async () => {
    if (!session?.user?.id || !session?.user?.email) {
      return;
    }

    try {
      // 단순히 insert 시도 (auth_user_id가 unique이므로 중복 방지됨)
      const { error: insertError } = await supabase
        .from('accounts')
        .insert({
          auth_user_id: session.user.id,
          name: session.user.name || '',
          email: session.user.email,
          role: 0, // 기본 역할 (0: 일반 사용자)
        });

      // 이미 계정이 있는 경우 (unique constraint violation)
      if (insertError?.code === '23505') {
        setIsSynced(true);
        return;
      }

      // 다른 에러가 발생한 경우
      if (insertError) {
        throw insertError;
      }

      setIsSynced(true);
    } catch (error) {
      console.error('계정 동기화 중 오류:', error);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id && !isSynced) {
      syncAccount();
    }
  }, [session, status, isSynced, syncAccount]);

  return { syncAccount, isSynced };
}
