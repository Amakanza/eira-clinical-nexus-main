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
      activities_daily_living: {
        Row: {
          activity: string
          assessment_date: string | null
          comment: string | null
          created_at: string | null
          current_level: string | null
          id: string
          initial_level: string | null
          patient_id: string
          reassessment_1_level: string | null
          reassessment_2_level: string | null
          reassessment_3_level: string | null
        }
        Insert: {
          activity: string
          assessment_date?: string | null
          comment?: string | null
          created_at?: string | null
          current_level?: string | null
          id?: string
          initial_level?: string | null
          patient_id: string
          reassessment_1_level?: string | null
          reassessment_2_level?: string | null
          reassessment_3_level?: string | null
        }
        Update: {
          activity?: string
          assessment_date?: string | null
          comment?: string | null
          created_at?: string | null
          current_level?: string | null
          id?: string
          initial_level?: string | null
          patient_id?: string
          reassessment_1_level?: string | null
          reassessment_2_level?: string | null
          reassessment_3_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_daily_living_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_notes: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          note_date: string
          note_type: string
          patient_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          note_date?: string
          note_type: string
          patient_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          note_date?: string
          note_type?: string
          patient_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      joint_measurements: {
        Row: {
          comment: string | null
          created_at: string | null
          current_rom: string | null
          id: string
          initial_rom: string | null
          joint: string
          measurement_date: string | null
          patient_id: string
          reassessment_1_rom: string | null
          reassessment_2_rom: string | null
          reassessment_3_rom: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          current_rom?: string | null
          id?: string
          initial_rom?: string | null
          joint: string
          measurement_date?: string | null
          patient_id: string
          reassessment_1_rom?: string | null
          reassessment_2_rom?: string | null
          reassessment_3_rom?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          current_rom?: string | null
          id?: string
          initial_rom?: string | null
          joint?: string
          measurement_date?: string | null
          patient_id?: string
          reassessment_1_rom?: string | null
          reassessment_2_rom?: string | null
          reassessment_3_rom?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "joint_measurements_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      muscle_strength: {
        Row: {
          comment: string | null
          created_at: string | null
          current_strength: string | null
          id: string
          initial_strength: string | null
          measurement_date: string | null
          muscle_group: string
          patient_id: string
          reassessment_1_strength: string | null
          reassessment_2_strength: string | null
          reassessment_3_strength: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          current_strength?: string | null
          id?: string
          initial_strength?: string | null
          measurement_date?: string | null
          muscle_group: string
          patient_id: string
          reassessment_1_strength?: string | null
          reassessment_2_strength?: string | null
          reassessment_3_strength?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          current_strength?: string | null
          id?: string
          initial_strength?: string | null
          measurement_date?: string | null
          muscle_group?: string
          patient_id?: string
          reassessment_1_strength?: string | null
          reassessment_2_strength?: string | null
          reassessment_3_strength?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "muscle_strength_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          case_manager: string | null
          case_number: string | null
          created_at: string | null
          date_of_birth: string | null
          date_of_initial_ax: string | null
          diagnosis: string | null
          facility: string | null
          home_address: string | null
          id: string
          medical_aid: string | null
          medical_aid_number: string | null
          occupation: string | null
          patient_name: string
          physiotherapist: string | null
          referring_dr: string | null
          updated_at: string | null
        }
        Insert: {
          case_manager?: string | null
          case_number?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          date_of_initial_ax?: string | null
          diagnosis?: string | null
          facility?: string | null
          home_address?: string | null
          id?: string
          medical_aid?: string | null
          medical_aid_number?: string | null
          occupation?: string | null
          patient_name: string
          physiotherapist?: string | null
          referring_dr?: string | null
          updated_at?: string | null
        }
        Update: {
          case_manager?: string | null
          case_number?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          date_of_initial_ax?: string | null
          diagnosis?: string | null
          facility?: string | null
          home_address?: string | null
          id?: string
          medical_aid?: string | null
          medical_aid_number?: string | null
          occupation?: string | null
          patient_name?: string
          physiotherapist?: string | null
          referring_dr?: string | null
          updated_at?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
