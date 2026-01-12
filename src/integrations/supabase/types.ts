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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      stock_entries: {
        Row: {
          classification: string | null
          created_at: string | null
          dropdown1: string | null
          dropdown1_date: string | null
          dropdown2: string | null
          dropdown2_date: string | null
          dropdown3: string | null
          dropdown3_date: string | null
          dropdown4: string | null
          dropdown4_date: string | null
          dropdown5: string | null
          dropdown5_date: string | null
          dropdown6: string | null
          dropdown6_date: string | null
          entry_type: string | null
          id: string
          image_url: string | null
          legacy_timestamp: number | null
          notes: string | null
          og_candle: string | null
          og_close_a: string | null
          og_close_a_date: string | null
          og_open_a: string | null
          og_open_a_date: string | null
          part2_result: string | null
          sd_close_a: string | null
          sd_open_a: string | null
          stock1: string | null
          stock1_date: string | null
          stock2: string | null
          stock2_date: string | null
          stock2b: string | null
          stock2b_color: string | null
          stock3: string | null
          stock3_date: string | null
          stock4: string | null
          stock4_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          classification?: string | null
          created_at?: string | null
          dropdown1?: string | null
          dropdown1_date?: string | null
          dropdown2?: string | null
          dropdown2_date?: string | null
          dropdown3?: string | null
          dropdown3_date?: string | null
          dropdown4?: string | null
          dropdown4_date?: string | null
          dropdown5?: string | null
          dropdown5_date?: string | null
          dropdown6?: string | null
          dropdown6_date?: string | null
          entry_type?: string | null
          id?: string
          image_url?: string | null
          legacy_timestamp?: number | null
          notes?: string | null
          og_candle?: string | null
          og_close_a?: string | null
          og_close_a_date?: string | null
          og_open_a?: string | null
          og_open_a_date?: string | null
          part2_result?: string | null
          sd_close_a?: string | null
          sd_open_a?: string | null
          stock1?: string | null
          stock1_date?: string | null
          stock2?: string | null
          stock2_date?: string | null
          stock2b?: string | null
          stock2b_color?: string | null
          stock3?: string | null
          stock3_date?: string | null
          stock4?: string | null
          stock4_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          classification?: string | null
          created_at?: string | null
          dropdown1?: string | null
          dropdown1_date?: string | null
          dropdown2?: string | null
          dropdown2_date?: string | null
          dropdown3?: string | null
          dropdown3_date?: string | null
          dropdown4?: string | null
          dropdown4_date?: string | null
          dropdown5?: string | null
          dropdown5_date?: string | null
          dropdown6?: string | null
          dropdown6_date?: string | null
          entry_type?: string | null
          id?: string
          image_url?: string | null
          legacy_timestamp?: number | null
          notes?: string | null
          og_candle?: string | null
          og_close_a?: string | null
          og_close_a_date?: string | null
          og_open_a?: string | null
          og_open_a_date?: string | null
          part2_result?: string | null
          sd_close_a?: string | null
          sd_open_a?: string | null
          stock1?: string | null
          stock1_date?: string | null
          stock2?: string | null
          stock2_date?: string | null
          stock2b?: string | null
          stock2b_color?: string | null
          stock3?: string | null
          stock3_date?: string | null
          stock4?: string | null
          stock4_date?: string | null
          updated_at?: string | null
          user_id?: string
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
    Enums: {},
  },
} as const
