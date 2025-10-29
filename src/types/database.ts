// Store Types (기존 테이블 활용)
export interface Store {
  store_id: number  // bigint
  user_id: string | null  // uuid
  name: string | null
  description: string | null
  phone: string | null
  logo_url: string | null  // 우리의 logo 역할
  cover_url: string | null
  business_hours: string | null  // 새로 추가
  notice: string | null  // 새로 추가
  address: string | null
  created_at: string
  updated_at: string | null
}

export type StoreInsert = Omit<Store, 'store_id' | 'created_at' | 'updated_at'>
export type StoreUpdate = Partial<StoreInsert>

// Category Types (새로 생성)
export interface Category {
  category_id: number  // bigint
  store_id: number
  name: string
  display_order: number
  created_at: string
}

export type CategoryInsert = Omit<Category, 'category_id' | 'created_at'>
export type CategoryUpdate = Partial<Omit<CategoryInsert, 'store_id'>>

// Menu Types (기존 테이블 활용)
export interface Menu {
  menu_id: number  // bigint
  store_id: number | null
  category_id: number | null  // 새로 추가
  name: string | null
  price: number | null  // real (float4)
  description: string | null  // 새로 추가
  image_url: string | null  // 우리의 image 역할
  allergy_info: string[] | null  // 새로 추가
  is_active: boolean | null  // 우리의 is_available 역할
  display_order: number | null  // 새로 추가
  created_at: string
  updated_at: string | null
}

export type MenuInsert = Omit<Menu, 'menu_id' | 'created_at' | 'updated_at'>
export type MenuUpdate = Partial<MenuInsert>

// QRCode/Table Types (기존 qrcodes 테이블 활용)
export interface QRCode {
  qr_id: number  // bigint
  store_id: number | null
  code: string | null
  table_number: string | null  // 새로 추가
  is_active: boolean | null
  created_at: string
}

export type QRCodeInsert = Omit<QRCode, 'qr_id' | 'created_at'>
export type QRCodeUpdate = Partial<QRCodeInsert>

// Queue Notification Types
export interface QueueNotification {
  id: number
  store_id: number
  queue_number: number
  fcm_token: string
  created_at: string
  send_status: string | null
  notified_at: string | null
}

export type QueueNotificationInsert = Omit<QueueNotification, 'id' | 'created_at' | 'send_status' | 'notified_at'> & {
  created_at?: string
  send_status?: string | null
  notified_at?: string | null
}
export type QueueNotificationUpdate = Partial<QueueNotificationInsert>

// Account Types (기존 accounts 테이블 - users 역할)
export interface Account {
  account_id: number
  auth_user_id: string | null  // uuid
  role: number | null  // smallint
  name: string | null
  email: string | null
  created_at: string
  updated_at: string | null
}

// 편의를 위한 타입 별칭
export type Table = QRCode;
export type TableInsert = QRCodeInsert;
export type TableUpdate = QRCodeUpdate;

// Database Type for Supabase (필요시 사용)
export type Database = {
  public: {
    Tables: {
      stores: {
        Row: Store
        Insert: StoreInsert
        Update: StoreUpdate
        Relationships: []
      }
      categories: {
        Row: Category
        Insert: CategoryInsert
        Update: CategoryUpdate
        Relationships: []
      }
      menus: {
        Row: Menu
        Insert: MenuInsert
        Update: MenuUpdate
        Relationships: []
      }
      qrcodes: {
        Row: QRCode
        Insert: QRCodeInsert
        Update: QRCodeUpdate
        Relationships: []
      }
      queue_notifications: {
        Row: QueueNotification
        Insert: QueueNotificationInsert
        Update: QueueNotificationUpdate
        Relationships: []
      }
      accounts: {
        Row: Account
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
