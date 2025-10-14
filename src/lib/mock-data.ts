/**
 * Mock Data for Development
 * Supabase 마이그레이션 전 개발용 임시 데이터
 */

import { Store } from '@/types/database';

// Mock 스토어 데이터 (새 스키마 반영)
export const mockStores: Store[] = [
  {
    store_id: 1,
    user_id: 'mock-user-1',
    name: '카페 모카',
    description: '따뜻한 분위기의 카페입니다',
    phone: '010-1234-5678',
    logo_url: null,
    cover_url: null,
    business_hours: '09:00 - 22:00',
    notice: '주차 가능합니다',
    address: '서울시 강남구',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    store_id: 2,
    user_id: 'mock-user-1',
    name: '레스토랑 블루',
    description: '프리미엄 레스토랑',
    phone: '010-9876-5432',
    logo_url: null,
    cover_url: null,
    business_hours: '11:00 - 23:00',
    notice: '예약 필수',
    address: '서울시 서초구',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// localStorage 키
const MOCK_STORES_KEY = 'tableqr_mock_stores';

// Mock 스토어 CRUD 함수
export const mockStoreAPI = {
  // 전체 조회
  getAll: (): Store[] => {
    if (typeof window === 'undefined') return mockStores;
    const stored = localStorage.getItem(MOCK_STORES_KEY);
    return stored ? JSON.parse(stored) : mockStores;
  },

  // ID로 조회
  getById: (id: number): Store | null => {
    const stores = mockStoreAPI.getAll();
    return stores.find(s => s.store_id === id) || null;
  },

  // 생성
  create: (data: Omit<Store, 'store_id' | 'created_at' | 'updated_at'>): Store => {
    const stores = mockStoreAPI.getAll();
    const newStore: Store = {
      ...data,
      store_id: Date.now(), // 간단한 ID 생성
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [...stores, newStore];
    if (typeof window !== 'undefined') {
      localStorage.setItem(MOCK_STORES_KEY, JSON.stringify(updated));
    }
    return newStore;
  },

  // 수정
  update: (id: number, data: Partial<Store>): Store | null => {
    const stores = mockStoreAPI.getAll();
    const index = stores.findIndex(s => s.store_id === id);
    if (index === -1) return null;
    
    const updated = stores.map(s => 
      s.store_id === id 
        ? { ...s, ...data, updated_at: new Date().toISOString() }
        : s
    );
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(MOCK_STORES_KEY, JSON.stringify(updated));
    }
    return updated[index];
  },

  // 삭제
  delete: (id: number): boolean => {
    const stores = mockStoreAPI.getAll();
    const filtered = stores.filter(s => s.store_id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(MOCK_STORES_KEY, JSON.stringify(filtered));
    }
    return true;
  },
};
