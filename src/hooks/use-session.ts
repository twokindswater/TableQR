'use client';

import { useSession as useNextAuthSession } from 'next-auth/react';
import { Session } from 'next-auth';

// 개발 환경용 mock session
const mockSession: Session = {
  user: {
    id: '104085693824085358553',
    name: 'Test User',
    email: 'mekingme@gmail.com',
    image: null,
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후 만료
};

export function useSession() {
  const session = useNextAuthSession();
  const isDevelopment = process.env.NODE_ENV === 'development';

  return isDevelopment
    ? {
        data: mockSession,
        status: 'authenticated' as const,
        update: session.update,
      }
    : session;
}
