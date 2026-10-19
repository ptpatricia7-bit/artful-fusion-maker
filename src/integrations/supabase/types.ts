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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      affiliate_commissions: {
        Row: {
          affiliate_id: string
          amount_cents: number
          created_at: string
          description: string
          id: string
          level: number
          status: string
        }
        Insert: {
          affiliate_id: string
          amount_cents: number
          created_at?: string
          description?: string
          id?: string
          level: number
          status?: string
        }
        Update: {
          affiliate_id?: string
          amount_cents?: number
          created_at?: string
          description?: string
          id?: string
          level?: number
          status?: string
        }
        Relationships: []
      }
      affiliates: {
        Row: {
          code: string
          created_at: string
          pix_key: string | null
          referred_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          code?: string
          created_at?: string
          pix_key?: string | null
          referred_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          pix_key?: string | null
          referred_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_gateway_control: {
        Row: {
          id: number
          paused_at: string
          paused_message: string
          paused_reason: string
          updated_at: string
        }
        Insert: {
          id?: number
          paused_at?: string
          paused_message: string
          paused_reason: string
          updated_at?: string
        }
        Update: {
          id?: number
          paused_at?: string
          paused_message?: string
          paused_reason?: string
          updated_at?: string
        }
        Relationships: []
      }
      commission_settings: {
        Row: {
          enabled: boolean
          hold_days: number
          id: number
          level1_bps: number
          level2_bps: number
          network_depth: number
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          hold_days?: number
          id?: number
          level1_bps?: number
          level2_bps?: number
          network_depth?: number
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          hold_days?: number
          id?: number
          level1_bps?: number
          level2_bps?: number
          network_depth?: number
          updated_at?: string
        }
        Relationships: []
      }
      configuration_audit: {
        Row: {
          actor_id: string | null
          after_value: Json | null
          before_value: Json | null
          created_at: string
          entity: string
          entity_id: string
          id: string
          operation: string
        }
        Insert: {
          actor_id?: string | null
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          entity: string
          entity_id: string
          id?: string
          operation: string
        }
        Update: {
          actor_id?: string | null
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          entity?: string
          entity_id?: string
          id?: string
          operation?: string
        }
        Relationships: []
      }
      fal_video_daily_usage: {
        Row: {
          updated_at: string
          usage_date: string
          used: number
          user_id: string
        }
        Insert: {
          updated_at?: string
          usage_date?: string
          used?: number
          user_id: string
        }
        Update: {
          updated_at?: string
          usage_date?: string
          used?: number
          user_id?: string
        }
        Relationships: []
      }
      marketplace_products: {
        Row: {
          category: string
          contact_url: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          kind: string
          price_cents: number
          seller_id: string
          seller_name: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          contact_url?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          kind?: string
          price_cents: number
          seller_id?: string
          seller_name?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          contact_url?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          kind?: string
          price_cents?: number
          seller_id?: string
          seller_name?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          active: boolean
          billing_months: number
          code: string
          created_at: string
          currency: string
          fal_video_daily_limit: number
          id: string
          image_daily_limit: number | null
          name: string
          price_cents: number
          text_daily_limit: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          billing_months?: number
          code: string
          created_at?: string
          currency?: string
          fal_video_daily_limit?: number
          id?: string
          image_daily_limit?: number | null
          name: string
          price_cents?: number
          text_daily_limit?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          billing_months?: number
          code?: string
          created_at?: string
          currency?: string
          fal_video_daily_limit?: number
          id?: string
          image_daily_limit?: number | null
          name?: string
          price_cents?: number
          text_daily_limit?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          provider: string | null
          provider_subscription_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      affiliate_referral_counts: {
        Args: never
        Returns: {
          nivel1: number
          nivel2: number
        }[]
      }
      ensure_affiliate: {
        Args: { p_ref?: string }
        Returns: {
          code: string
          created_at: string
          pix_key: string | null
          referred_by: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "affiliates"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reserve_fal_video_quota: { Args: { p_user_id: string }; Returns: number }
      set_affiliate_pix: { Args: { p_pix: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user" | "seller" | "affiliate"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user", "seller", "affiliate"],
    },
  },
} as const
