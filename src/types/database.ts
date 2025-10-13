// User Types
export interface User {
  id: string
  email: string
  google_id: string
  name: string
  profile_image: string | null
  created_at: string
  updated_at: string
}

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>
export type UserUpdate = Partial<UserInsert>

// Store Types
export interface Store {
  id: string
  user_id: string
  name: string
  logo: string | null
  phone: string | null
  business_hours: string | null
  notice: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export type StoreInsert = Omit<Store, 'id' | 'created_at' | 'updated_at'>
export type StoreUpdate = Partial<StoreInsert>

// Category Types
export interface Category {
  id: string
  store_id: string
  name: string
  display_order: number
  created_at: string
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at'>
export type CategoryUpdate = Partial<CategoryInsert>

// Menu Types
export interface Menu {
  id: string
  store_id: string
  category_id: string | null
  name: string
  price: number
  description: string | null
  image: string | null
  allergy_info: string[] | null
  is_available: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type MenuInsert = Omit<Menu, 'id' | 'created_at' | 'updated_at'>
export type MenuUpdate = Partial<MenuInsert>

// Table (QR Code) Types
export interface Table {
  id: string
  store_id: string
  table_number: string
  qr_code_url: string | null
  created_at: string
}

export type TableInsert = Omit<Table, 'id' | 'created_at'>
export type TableUpdate = Partial<TableInsert>

// Database Type for Supabase
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: UserInsert
        Update: UserUpdate
        Relationships: []
      }
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
      tables: {
        Row: Table
        Insert: TableInsert
        Update: TableUpdate
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
