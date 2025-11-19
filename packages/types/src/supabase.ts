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
      action_plans: {
        Row: {
          checklist: Json | null
          created_at: string | null
          emergency_contacts: Json | null
          id: string
          if_then: Json | null
          is_shared_with_sponsor: boolean | null
          situation: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          checklist?: Json | null
          created_at?: string | null
          emergency_contacts?: Json | null
          id?: string
          if_then?: Json | null
          is_shared_with_sponsor?: boolean | null
          situation?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          checklist?: Json | null
          created_at?: string | null
          emergency_contacts?: Json | null
          id?: string
          if_then?: Json | null
          is_shared_with_sponsor?: boolean | null
          situation?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          meta: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      craving_events: {
        Row: {
          created_at: string | null
          id: string
          intensity: number
          lat: number | null
          lng: number | null
          notes: string | null
          occurred_at: string
          response_taken: string | null
          trigger_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          intensity: number
          lat?: number | null
          lng?: number | null
          notes?: string | null
          occurred_at?: string
          response_taken?: string | null
          trigger_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          intensity?: number
          lat?: number | null
          lng?: number | null
          notes?: string | null
          occurred_at?: string
          response_taken?: string | null
          trigger_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_entries: {
        Row: {
          coping_actions: Json | null
          cravings_intensity: number | null
          created_at: string | null
          entry_date: string
          feelings: Json | null
          gratitude: string | null
          id: string
          notes: string | null
          share_with_sponsor: boolean | null
          triggers: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coping_actions?: Json | null
          cravings_intensity?: number | null
          created_at?: string | null
          entry_date?: string
          feelings?: Json | null
          gratitude?: string | null
          id?: string
          notes?: string | null
          share_with_sponsor?: boolean | null
          triggers?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coping_actions?: Json | null
          cravings_intensity?: number | null
          created_at?: string | null
          entry_date?: string
          feelings?: Json | null
          gratitude?: string | null
          id?: string
          notes?: string | null
          share_with_sponsor?: boolean | null
          triggers?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content_ciphertext: string
          created_at: string | null
          id: string
          nonce: string
          recipient_id: string
          sender_id: string
          thread_id: string
        }
        Insert: {
          content_ciphertext: string
          created_at?: string | null
          id?: string
          nonce: string
          recipient_id: string
          sender_id: string
          thread_id: string
        }
        Update: {
          content_ciphertext?: string
          created_at?: string | null
          id?: string
          nonce?: string
          recipient_id?: string
          sender_id?: string
          thread_id?: string
        }
        Relationships: []
      }
      notification_tokens: {
        Row: {
          created_at: string | null
          id: string
          platform: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          clean_date: string | null
          created_at: string | null
          handle: string | null
          id: string
          program: Database["public"]["Enums"]["program"] | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          clean_date?: string | null
          created_at?: string | null
          handle?: string | null
          id?: string
          program?: Database["public"]["Enums"]["program"] | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          clean_date?: string | null
          created_at?: string | null
          handle?: string | null
          id?: string
          program?: Database["public"]["Enums"]["program"] | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      risk_signals: {
        Row: {
          created_at: string | null
          id: string
          inputs: Json
          score: number
          scored_at: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          inputs: Json
          score: number
          scored_at?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          inputs?: Json
          score?: number
          scored_at?: string
          user_id?: string
        }
        Relationships: []
      }
      routine_logs: {
        Row: {
          created_at: string | null
          id: string
          note: string | null
          routine_id: string
          run_at: string
          status: Database["public"]["Enums"]["routine_status"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          note?: string | null
          routine_id: string
          run_at?: string
          status: Database["public"]["Enums"]["routine_status"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          note?: string | null
          routine_id?: string
          run_at?: string
          status?: Database["public"]["Enums"]["routine_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_logs_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          schedule: Json
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          schedule: Json
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          schedule?: Json
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sobriety_streaks: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          relapse_note: string | null
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          relapse_note?: string | null
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          relapse_note?: string | null
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sponsor_relationships: {
        Row: {
          created_at: string | null
          id: string
          sponsee_id: string
          sponsor_id: string
          status: Database["public"]["Enums"]["sponsor_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          sponsee_id: string
          sponsor_id: string
          status?: Database["public"]["Enums"]["sponsor_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          sponsee_id?: string
          sponsor_id?: string
          status?: Database["public"]["Enums"]["sponsor_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      step_entries: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          is_shared_with_sponsor: boolean | null
          step_id: string
          updated_at: string | null
          user_id: string
          version: number
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          is_shared_with_sponsor?: boolean | null
          step_id: string
          updated_at?: string | null
          user_id: string
          version?: number
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          is_shared_with_sponsor?: boolean | null
          step_id?: string
          updated_at?: string | null
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "step_entries_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "steps"
            referencedColumns: ["id"]
          },
        ]
      }
      steps: {
        Row: {
          created_at: string | null
          id: string
          program: Database["public"]["Enums"]["program"]
          prompts: Json
          step_number: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          program: Database["public"]["Enums"]["program"]
          prompts?: Json
          step_number: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          program?: Database["public"]["Enums"]["program"]
          prompts?: Json
          step_number?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trigger_locations: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          label: string
          lat: number
          lng: number
          on_enter: Json | null
          on_exit: Json | null
          radius_m: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          label: string
          lat: number
          lng: number
          on_enter?: Json | null
          on_exit?: Json | null
          radius_m?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          label?: string
          lat?: number
          lng?: number
          on_enter?: Json | null
          on_exit?: Json | null
          radius_m?: number
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
      is_sponsor_of: { Args: { sponsee_user_id: string }; Returns: boolean }
    }
    Enums: {
      program: "NA" | "AA"
      routine_status: "completed" | "skipped" | "failed"
      sponsor_status: "pending" | "active" | "revoked"
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
      program: ["NA", "AA"],
      routine_status: ["completed", "skipped", "failed"],
      sponsor_status: ["pending", "active", "revoked"],
    },
  },
} as const
