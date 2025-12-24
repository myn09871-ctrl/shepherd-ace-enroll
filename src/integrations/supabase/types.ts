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
      admin_notes: {
        Row: {
          admin_user_id: string | null
          application_id: string
          created_at: string
          id: string
          note: string
        }
        Insert: {
          admin_user_id?: string | null
          application_id: string
          created_at?: string
          id?: string
          note: string
        }
        Update: {
          admin_user_id?: string | null
          application_id?: string
          created_at?: string
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "enrollment_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollment_applications: {
        Row: {
          academic_performance: string | null
          academic_records_url: string | null
          allergies: Json | null
          authorized_persons: Json | null
          birth_certificate_url: string | null
          career_training_interests: string[] | null
          consent_discipline: boolean | null
          consent_emergency: boolean | null
          consent_media: boolean | null
          consent_records: boolean | null
          consent_terms: boolean | null
          consent_truthfulness: boolean | null
          created_at: string
          current_medications: Json | null
          financial_acknowledgment: boolean | null
          financial_assistance_interest: boolean | null
          guardian1_address: string
          guardian1_email: string
          guardian1_employer: string | null
          guardian1_full_name: string
          guardian1_is_primary_contact: boolean | null
          guardian1_landmark: string | null
          guardian1_occupation: string | null
          guardian1_phone_primary: string
          guardian1_phone_secondary: string | null
          guardian1_relationship: string
          guardian1_workplace_address: string | null
          guardian1_workplace_phone: string | null
          guardian2_address: string | null
          guardian2_email: string | null
          guardian2_full_name: string | null
          guardian2_is_emergency_contact: boolean | null
          guardian2_phone_primary: string | null
          guardian2_phone_secondary: string | null
          guardian2_relationship: string | null
          has_allergies: boolean | null
          has_medical_conditions: boolean | null
          has_special_needs: boolean | null
          id: string
          immunization_up_to_date: boolean | null
          intended_start_date: string | null
          is_first_time_enrollment: boolean | null
          last_grade_completed: string | null
          medical_authorization: boolean | null
          medical_conditions: string[] | null
          medical_conditions_details: string | null
          pickup_location: string | null
          previous_school_location: string | null
          previous_school_name: string | null
          program_level: string
          reason_for_change: string | null
          reference_number: string
          residence_proof_url: string | null
          special_needs_details: string | null
          special_needs_types: string[] | null
          status: string
          student_dob: string
          student_first_name: string
          student_gender: string
          student_middle_name: string | null
          student_nationality: string
          student_photo_url: string | null
          student_place_of_birth: string | null
          student_surname: string
          transportation_method: string | null
          updated_at: string
          vaccination_card_url: string | null
        }
        Insert: {
          academic_performance?: string | null
          academic_records_url?: string | null
          allergies?: Json | null
          authorized_persons?: Json | null
          birth_certificate_url?: string | null
          career_training_interests?: string[] | null
          consent_discipline?: boolean | null
          consent_emergency?: boolean | null
          consent_media?: boolean | null
          consent_records?: boolean | null
          consent_terms?: boolean | null
          consent_truthfulness?: boolean | null
          created_at?: string
          current_medications?: Json | null
          financial_acknowledgment?: boolean | null
          financial_assistance_interest?: boolean | null
          guardian1_address: string
          guardian1_email: string
          guardian1_employer?: string | null
          guardian1_full_name: string
          guardian1_is_primary_contact?: boolean | null
          guardian1_landmark?: string | null
          guardian1_occupation?: string | null
          guardian1_phone_primary: string
          guardian1_phone_secondary?: string | null
          guardian1_relationship: string
          guardian1_workplace_address?: string | null
          guardian1_workplace_phone?: string | null
          guardian2_address?: string | null
          guardian2_email?: string | null
          guardian2_full_name?: string | null
          guardian2_is_emergency_contact?: boolean | null
          guardian2_phone_primary?: string | null
          guardian2_phone_secondary?: string | null
          guardian2_relationship?: string | null
          has_allergies?: boolean | null
          has_medical_conditions?: boolean | null
          has_special_needs?: boolean | null
          id?: string
          immunization_up_to_date?: boolean | null
          intended_start_date?: string | null
          is_first_time_enrollment?: boolean | null
          last_grade_completed?: string | null
          medical_authorization?: boolean | null
          medical_conditions?: string[] | null
          medical_conditions_details?: string | null
          pickup_location?: string | null
          previous_school_location?: string | null
          previous_school_name?: string | null
          program_level: string
          reason_for_change?: string | null
          reference_number: string
          residence_proof_url?: string | null
          special_needs_details?: string | null
          special_needs_types?: string[] | null
          status?: string
          student_dob: string
          student_first_name: string
          student_gender: string
          student_middle_name?: string | null
          student_nationality: string
          student_photo_url?: string | null
          student_place_of_birth?: string | null
          student_surname: string
          transportation_method?: string | null
          updated_at?: string
          vaccination_card_url?: string | null
        }
        Update: {
          academic_performance?: string | null
          academic_records_url?: string | null
          allergies?: Json | null
          authorized_persons?: Json | null
          birth_certificate_url?: string | null
          career_training_interests?: string[] | null
          consent_discipline?: boolean | null
          consent_emergency?: boolean | null
          consent_media?: boolean | null
          consent_records?: boolean | null
          consent_terms?: boolean | null
          consent_truthfulness?: boolean | null
          created_at?: string
          current_medications?: Json | null
          financial_acknowledgment?: boolean | null
          financial_assistance_interest?: boolean | null
          guardian1_address?: string
          guardian1_email?: string
          guardian1_employer?: string | null
          guardian1_full_name?: string
          guardian1_is_primary_contact?: boolean | null
          guardian1_landmark?: string | null
          guardian1_occupation?: string | null
          guardian1_phone_primary?: string
          guardian1_phone_secondary?: string | null
          guardian1_relationship?: string
          guardian1_workplace_address?: string | null
          guardian1_workplace_phone?: string | null
          guardian2_address?: string | null
          guardian2_email?: string | null
          guardian2_full_name?: string | null
          guardian2_is_emergency_contact?: boolean | null
          guardian2_phone_primary?: string | null
          guardian2_phone_secondary?: string | null
          guardian2_relationship?: string | null
          has_allergies?: boolean | null
          has_medical_conditions?: boolean | null
          has_special_needs?: boolean | null
          id?: string
          immunization_up_to_date?: boolean | null
          intended_start_date?: string | null
          is_first_time_enrollment?: boolean | null
          last_grade_completed?: string | null
          medical_authorization?: boolean | null
          medical_conditions?: string[] | null
          medical_conditions_details?: string | null
          pickup_location?: string | null
          previous_school_location?: string | null
          previous_school_name?: string | null
          program_level?: string
          reason_for_change?: string | null
          reference_number?: string
          residence_proof_url?: string | null
          special_needs_details?: string | null
          special_needs_types?: string[] | null
          status?: string
          student_dob?: string
          student_first_name?: string
          student_gender?: string
          student_middle_name?: string | null
          student_nationality?: string
          student_photo_url?: string | null
          student_place_of_birth?: string | null
          student_surname?: string
          transportation_method?: string | null
          updated_at?: string
          vaccination_card_url?: string | null
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          featured_image_url: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      school_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      sent_emails: {
        Row: {
          application_id: string | null
          body: string
          id: string
          recipient_email: string
          recipient_type: string | null
          sent_at: string
          sent_by: string | null
          subject: string
        }
        Insert: {
          application_id?: string | null
          body: string
          id?: string
          recipient_email: string
          recipient_type?: string | null
          sent_at?: string
          sent_by?: string | null
          subject: string
        }
        Update: {
          application_id?: string | null
          body?: string
          id?: string
          recipient_email?: string
          recipient_type?: string | null
          sent_at?: string
          sent_by?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "sent_emails_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "enrollment_applications"
            referencedColumns: ["id"]
          },
        ]
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
      website_content: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          page_slug: string
          page_title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          page_slug: string
          page_title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          page_slug?: string
          page_title?: string
          updated_at?: string
          updated_by?: string | null
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admissions_officer" | "content_manager"
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
      app_role: ["super_admin", "admissions_officer", "content_manager"],
    },
  },
} as const
