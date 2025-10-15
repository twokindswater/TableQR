export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          account_id: number
          auth_user_id: string | null
          created_at: string
          email: string | null
          name: string | null
          role: number | null
          updated_at: string | null
        }
        Insert: {
          account_id?: number
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          name?: string | null
          role?: number | null
          updated_at?: string | null
        }
        Update: {
          account_id?: number
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          name?: string | null
          role?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          category_id: number
          created_at: string | null
          description: string | null
          display_order: number | null
          name: string
          store_id: number
        }
        Insert: {
          category_id?: number
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          name: string
          store_id: number
        }
        Update: {
          category_id?: number
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          name?: string
          store_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          }
        ]
      }
      menus: {
        Row: {
          allergy_info: string[] | null
          category_id: number | null
          created_at: string
          description: string | null
          display_order: number | null
          image_url: string | null
          is_active: boolean | null
          menu_id: number
          name: string | null
          price: number | null
          store_id: number | null
          updated_at: string | null
        }
        Insert: {
          allergy_info?: string[] | null
          category_id?: number | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          image_url?: string | null
          is_active?: boolean | null
          menu_id?: number
          name?: string | null
          price?: number | null
          store_id?: number | null
          updated_at?: string | null
        }
        Update: {
          allergy_info?: string[] | null
          category_id?: number | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          image_url?: string | null
          is_active?: boolean | null
          menu_id?: number
          name?: string | null
          price?: number | null
          store_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menus_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "menus_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          }
        ]
      }
      qrcodes: {
        Row: {
          code: string | null
          created_at: string
          is_active: boolean | null
          qr_id: number
          store_id: number | null
          table_number: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          is_active?: boolean | null
          qr_id?: number
          store_id?: number | null
          table_number?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          is_active?: boolean | null
          qr_id?: number
          store_id?: number | null
          table_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qrcodes_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          }
        ]
      }
      queues: {
        Row: {
          called_at: string | null
          created_at: string
          queue_id: number
          queue_number: number | null
          status: number | null
          store_id: number | null
        }
        Insert: {
          called_at?: string | null
          created_at?: string
          queue_id?: number
          queue_number?: number | null
          status?: number | null
          store_id?: number | null
        }
        Update: {
          called_at?: string | null
          created_at?: string
          queue_id?: number
          queue_number?: number | null
          status?: number | null
          store_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "queues_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          }
        ]
      }
      stores: {
        Row: {
          address: string | null
          business_hours: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          logo_url: string | null
          name: string | null
          notice: string | null
          phone: string | null
          store_id: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          logo_url?: string | null
          name?: string | null
          notice?: string | null
          phone?: string | null
          store_id?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          logo_url?: string | null
          name?: string | null
          notice?: string | null
          phone?: string | null
          store_id?: number
          updated_at?: string | null
          user_id?: string | null
        }
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
