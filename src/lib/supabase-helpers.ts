/**
 * Supabase Database Helper Functions
 * 기존 테이블 구조 활용 (stores, menus, categories, qrcodes)
 */

import { supabase } from '@/lib/supabase';
import type {
  Store,
  StoreInsert,
  StoreUpdate,
  Category,
  CategoryInsert,
  CategoryUpdate,
  Menu,
  MenuInsert,
  MenuUpdate,
  QRCode,
  QRCodeInsert,
  QRCodeUpdate,
  Account,
} from '@/types/database';

// =====================================================
// Stores
// =====================================================

/**
 * 사용자의 모든 매장 조회
 */
export async function getStoresByUserId(userId: string) {
  const { data, error} = await supabase
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
export async function getStoreById(storeId: number) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('store_id', storeId)
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
export async function updateStore(storeId: number, storeData: StoreUpdate) {
  const { data, error } = await supabase
    .from('stores')
    .update(storeData)
    .eq('store_id', storeId)
    .select()
    .single();

  if (error) throw error;
  return data as Store;
}

/**
 * 매장 삭제
 */
export async function deleteStore(storeId: number) {
  const { error } = await supabase.from('stores').delete().eq('store_id', storeId);

  if (error) throw error;
}

// =====================================================
// Categories
// =====================================================

/**
 * 매장의 모든 카테고리 조회
 */
export async function getCategoriesByStoreId(storeId: number) {
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
  categoryId: number,
  categoryData: CategoryUpdate
) {
  const { data, error } = await supabase
    .from('categories')
    .update(categoryData)
    .eq('category_id', categoryId)
    .select()
    .single();

  if (error) throw error;
  return data as Category;
}

/**
 * 카테고리 삭제
 */
export async function deleteCategory(categoryId: number) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('category_id', categoryId);

  if (error) throw error;
}

// =====================================================
// Menus
// =====================================================

/**
 * 매장의 모든 메뉴 조회 (카테고리 포함)
 */
export async function getMenusByStoreId(storeId: number) {
  const { data, error } = await supabase
    .from('menus')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('store_id', storeId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as (Menu & { category: Category | null })[];
}

/**
 * 카테고리별 메뉴 조회
 */
export async function getMenusByCategoryId(categoryId: number) {
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
export async function getAvailableMenus(storeId: number) {
  const { data, error } = await supabase
    .from('menus')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('store_id', storeId)
    .eq('is_active', true)
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
export async function updateMenu(menuId: number, menuData: MenuUpdate) {
  const { data, error } = await supabase
    .from('menus')
    .update(menuData)
    .eq('menu_id', menuId)
    .select()
    .single();

  if (error) throw error;
  return data as Menu;
}

/**
 * 메뉴 삭제
 */
export async function deleteMenu(menuId: number) {
  const { error } = await supabase.from('menus').delete().eq('menu_id', menuId);

  if (error) throw error;
}

/**
 * 메뉴 품절 처리
 */
export async function toggleMenuAvailability(
  menuId: number,
  isActive: boolean
) {
  const { data, error } = await supabase
    .from('menus')
    .update({ is_active: isActive })
    .eq('menu_id', menuId)
    .select()
    .single();

  if (error) throw error;
  return data as Menu;
}

// =====================================================
// QR Codes / Tables
// =====================================================

/**
 * 매장의 모든 QR 코드/테이블 조회
 */
export async function getQRCodesByStoreId(storeId: number) {
  const { data, error } = await supabase
    .from('qrcodes')
    .select('*')
    .eq('store_id', storeId)
    .order('table_number', { ascending: true });

  if (error) throw error;
  return data as QRCode[];
}

/**
 * QR 코드 ID로 조회
 */
export async function getQRCodeById(qrId: number) {
  const { data, error } = await supabase
    .from('qrcodes')
    .select(`
      *,
      store:stores(*)
    `)
    .eq('qr_id', qrId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as (QRCode & { store: Store }) | null;
}

/**
 * QR 코드 생성
 */
export async function createQRCode(qrCodeData: QRCodeInsert) {
  const { data, error } = await supabase
    .from('qrcodes')
    .insert(qrCodeData)
    .select()
    .single();

  if (error) throw error;
  return data as QRCode;
}

/**
 * QR 코드 업데이트
 */
export async function updateQRCode(qrId: number, qrCodeData: QRCodeUpdate) {
  const { data, error } = await supabase
    .from('qrcodes')
    .update(qrCodeData)
    .eq('qr_id', qrId)
    .select()
    .single();

  if (error) throw error;
  return data as QRCode;
}

/**
 * QR 코드 삭제
 */
export async function deleteQRCode(qrId: number) {
  const { error } = await supabase.from('qrcodes').delete().eq('qr_id', qrId);

  if (error) throw error;
}

// 편의를 위한 별칭
export const getTablesByStoreId = getQRCodesByStoreId;
export const getTableById = getQRCodeById;
export const createTable = createQRCode;
export const updateTable = updateQRCode;
export const deleteTable = deleteQRCode;

// =====================================================
// Accounts
// =====================================================

/**
 * 사용자 ID로 계정 정보 조회
 */
export async function getAccountByUserId(userId: string) {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('auth_user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as Account | null;
}

/**
 * 계정 정보 업데이트
 */
export async function updateAccount(accountId: number, accountData: Partial<Account>) {
  const { data, error } = await supabase
    .from('accounts')
    .update(accountData)
    .eq('account_id', accountId)
    .select()
    .single();

  if (error) throw error;
  return data as Account;
}
