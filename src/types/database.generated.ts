export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
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
          },
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
          },
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
          },
        ]
      }
      queues: {
        Row: {
          called_at: string | null
          completed_at: string | null
          created_at: string
          queue_id: number
          queue_number: number | null
          status: number | null
          store_id: number | null
        }
        Insert: {
          called_at?: string | null
          completed_at?: string | null
          created_at?: string
          queue_id?: number
          queue_number?: number | null
          status?: number | null
          store_id?: number | null
        }
        Update: {
          called_at?: string | null
          completed_at?: string | null
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
          },
        ]
      }
      queue_notifications: {
        Row: {
          created_at: string
          fcm_token: string
          id: number
          notified_at: string | null
          queue_number: number
          send_status: string | null
          store_id: number
        }
        Insert: {
          created_at?: string
          fcm_token: string
          id?: number
          notified_at?: string | null
          queue_number: number
          send_status?: string | null
          store_id: number
        }
        Update: {
          created_at?: string
          fcm_token?: string
          id?: number
          notified_at?: string | null
          queue_number?: number
          send_status?: string | null
          store_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "queue_notifications_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
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
      order_status: "waiting" | "ready" | "served"
      store_status: "open" | "closed" | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: ["waiting", "ready", "served"],
      store_status: ["open", "closed", "paused"],
    },
  },
} as const
