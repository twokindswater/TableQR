/**
 * Supabase Database Helper Functions
 * Phase 4: 데이터베이스 설계 및 구축
 */

import { supabase } from '@/lib/supabase';
import type {
  User,
  UserInsert,
  Store,
  StoreInsert,
  StoreUpdate,
  Category,
  CategoryInsert,
  CategoryUpdate,
  Menu,
  MenuInsert,
  MenuUpdate,
  Table,
  TableInsert,
  TableUpdate,
} from '@/types/database';

// =====================================================
// Users
// =====================================================

/**
 * Google OAuth 정보로 사용자 생성 또는 업데이트
 */
export async function upsertUser(userData: UserInsert) {
  const { data, error } = await supabase
    .from('users')
    .upsert(userData, { onConflict: 'google_id' })
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

/**
 * 이메일로 사용자 조회
 */
export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data as User | null;
}

/**
 * Google ID로 사용자 조회
 */
export async function getUserByGoogleId(googleId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('google_id', googleId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as User | null;
}

// =====================================================
// Stores
// =====================================================

/**
 * 사용자의 모든 매장 조회
 */
export async function getStoresByUserId(userId: string) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Store[];
}

/**
 * 매장 ID로 단일 매장 조회
 */
export async function getStoreById(storeId: string) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as Store | null;
}

/**
 * 새 매장 생성
 */
export async function createStore(storeData: StoreInsert) {
  const { data, error } = await supabase
    .from('stores')
    .insert(storeData)
    .select()
    .single();

  if (error) throw error;
  return data as Store;
}

/**
 * 매장 정보 업데이트
 */
export async function updateStore(storeId: string, storeData: StoreUpdate) {
  const { data, error } = await supabase
    .from('stores')
    .update(storeData)
    .eq('id', storeId)
    .select()
    .single();

  if (error) throw error;
  return data as Store;
}

/**
 * 매장 삭제
 */
export async function deleteStore(storeId: string) {
  const { error } = await supabase.from('stores').delete().eq('id', storeId);

  if (error) throw error;
}

// =====================================================
// Categories
// =====================================================

/**
 * 매장의 모든 카테고리 조회
 */
export async function getCategoriesByStoreId(storeId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as Category[];
}

/**
 * 카테고리 생성
 */
export async function createCategory(categoryData: CategoryInsert) {
  const { data, error } = await supabase
    .from('categories')
    .insert(categoryData)
    .select()
    .single();

  if (error) throw error;
  return data as Category;
}

/**
 * 카테고리 업데이트
 */
export async function updateCategory(
  categoryId: string,
  categoryData: CategoryUpdate
) {
  const { data, error } = await supabase
    .from('categories')
    .update(categoryData)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) throw error;
  return data as Category;
}

/**
 * 카테고리 삭제
 */
export async function deleteCategory(categoryId: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (error) throw error;
}

// =====================================================
// Menus
// =====================================================

/**
 * 매장의 모든 메뉴 조회 (카테고리 포함)
 */
export async function getMenusByStoreId(storeId: string) {
  const { data, error } = await supabase
    .from('menus')
    .select(
      `
      *,
      category:categories(*)
    `
    )
    .eq('store_id', storeId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as (Menu & { category: Category | null })[];
}

/**
 * 카테고리별 메뉴 조회
 */
export async function getMenusByCategoryId(categoryId: string) {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('category_id', categoryId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as Menu[];
}

/**
 * 판매 가능한 메뉴만 조회 (고객용)
 */
export async function getAvailableMenus(storeId: string) {
  const { data, error } = await supabase
    .from('menus')
    .select(
      `
      *,
      category:categories(*)
    `
    )
    .eq('store_id', storeId)
    .eq('is_available', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as (Menu & { category: Category | null })[];
}

/**
 * 메뉴 생성
 */
export async function createMenu(menuData: MenuInsert) {
  const { data, error } = await supabase
    .from('menus')
    .insert(menuData)
    .select()
    .single();

  if (error) throw error;
  return data as Menu;
}

/**
 * 메뉴 업데이트
 */
export async function updateMenu(menuId: string, menuData: MenuUpdate) {
  const { data, error } = await supabase
    .from('menus')
    .update(menuData)
    .eq('id', menuId)
    .select()
    .single();

  if (error) throw error;
  return data as Menu;
}

/**
 * 메뉴 삭제
 */
export async function deleteMenu(menuId: string) {
  const { error } = await supabase.from('menus').delete().eq('id', menuId);

  if (error) throw error;
}

/**
 * 메뉴 품절 처리
 */
export async function toggleMenuAvailability(
  menuId: string,
  isAvailable: boolean
) {
  const { data, error } = await supabase
    .from('menus')
    .update({ is_available: isAvailable })
    .eq('id', menuId)
    .select()
    .single();

  if (error) throw error;
  return data as Menu;
}

// =====================================================
// Tables
// =====================================================

/**
 * 매장의 모든 테이블 조회
 */
export async function getTablesByStoreId(storeId: string) {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('store_id', storeId)
    .order('table_number', { ascending: true });

  if (error) throw error;
  return data as Table[];
}

/**
 * 테이블 ID로 조회
 */
export async function getTableById(tableId: string) {
  const { data, error } = await supabase
    .from('tables')
    .select(
      `
      *,
      store:stores(*)
    `
    )
    .eq('id', tableId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as (Table & { store: Store }) | null;
}

/**
 * 테이블 생성
 */
export async function createTable(tableData: TableInsert) {
  const { data, error } = await supabase
    .from('tables')
    .insert(tableData)
    .select()
    .single();

  if (error) throw error;
  return data as Table;
}

/**
 * 테이블 업데이트
 */
export async function updateTable(tableId: string, tableData: TableUpdate) {
  const { data, error } = await supabase
    .from('tables')
    .update(tableData)
    .eq('id', tableId)
    .select()
    .single();

  if (error) throw error;
  return data as Table;
}

/**
 * 테이블 삭제
 */
export async function deleteTable(tableId: string) {
  const { error } = await supabase.from('tables').delete().eq('id', tableId);

  if (error) throw error;
}

