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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agro_chemicals: {
        Row: {
          active_ingredient: string
          created_at: string
          dose_per_acre: string | null
          dose_per_litre: string | null
          id: string
          name: string
          notes: string | null
          phi_days: number | null
          ppe: string | null
          safety_class: string | null
          target: string[] | null
          type: string
        }
        Insert: {
          active_ingredient: string
          created_at?: string
          dose_per_acre?: string | null
          dose_per_litre?: string | null
          id?: string
          name: string
          notes?: string | null
          phi_days?: number | null
          ppe?: string | null
          safety_class?: string | null
          target?: string[] | null
          type: string
        }
        Update: {
          active_ingredient?: string
          created_at?: string
          dose_per_acre?: string | null
          dose_per_litre?: string | null
          id?: string
          name?: string
          notes?: string | null
          phi_days?: number | null
          ppe?: string | null
          safety_class?: string | null
          target?: string[] | null
          type?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      crops_kb: {
        Row: {
          common_diseases: string[] | null
          common_pests: string[] | null
          created_at: string
          crop: string
          id: string
          notes: string | null
          scientific_name: string | null
          season: string | null
          soil: string | null
          water_needs: string | null
        }
        Insert: {
          common_diseases?: string[] | null
          common_pests?: string[] | null
          created_at?: string
          crop: string
          id?: string
          notes?: string | null
          scientific_name?: string | null
          season?: string | null
          soil?: string | null
          water_needs?: string | null
        }
        Update: {
          common_diseases?: string[] | null
          common_pests?: string[] | null
          created_at?: string
          crop?: string
          id?: string
          notes?: string | null
          scientific_name?: string | null
          season?: string | null
          soil?: string | null
          water_needs?: string | null
        }
        Relationships: []
      }
      detections: {
        Row: {
          confidence: number
          created_at: string
          description: string | null
          disease: string
          id: string
          image_data_url: string | null
          is_healthy: boolean
          plant: string | null
          prevention: string | null
          severity: string | null
          treatment: string | null
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          description?: string | null
          disease: string
          id?: string
          image_data_url?: string | null
          is_healthy?: boolean
          plant?: string | null
          prevention?: string | null
          severity?: string | null
          treatment?: string | null
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          description?: string | null
          disease?: string
          id?: string
          image_data_url?: string | null
          is_healthy?: boolean
          plant?: string | null
          prevention?: string | null
          severity?: string | null
          treatment?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mandi_prices: {
        Row: {
          arrival_date: string
          commodity: string
          district: string | null
          fetched_at: string
          id: string
          market: string
          max_price: number | null
          min_price: number | null
          modal_price: number | null
          state: string
          unit: string | null
          variety: string | null
        }
        Insert: {
          arrival_date: string
          commodity: string
          district?: string | null
          fetched_at?: string
          id?: string
          market: string
          max_price?: number | null
          min_price?: number | null
          modal_price?: number | null
          state: string
          unit?: string | null
          variety?: string | null
        }
        Update: {
          arrival_date?: string
          commodity?: string
          district?: string | null
          fetched_at?: string
          id?: string
          market?: string
          max_price?: number | null
          min_price?: number | null
          modal_price?: number | null
          state?: string
          unit?: string | null
          variety?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          read: boolean
          severity: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          read?: boolean
          severity?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          read?: boolean
          severity?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          crops: string[] | null
          display_name: string | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          notify_enabled: boolean
        }
        Insert: {
          created_at?: string
          crops?: string[] | null
          display_name?: string | null
          id: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notify_enabled?: boolean
        }
        Update: {
          created_at?: string
          crops?: string[] | null
          display_name?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notify_enabled?: boolean
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "farmer" | "expert" | "admin"
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
      app_role: ["farmer", "expert", "admin"],
    },
  },
} as const
