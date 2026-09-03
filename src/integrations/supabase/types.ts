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
      admin_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      announcement_acknowledgments: {
        Row: {
          acknowledged_at: string
          announcement_id: string
          id: string
          parent_account_id: string
        }
        Insert: {
          acknowledged_at?: string
          announcement_id: string
          id?: string
          parent_account_id: string
        }
        Update: {
          acknowledged_at?: string
          announcement_id?: string
          id?: string
          parent_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_acknowledgments_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "portal_announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_acknowledgments_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "parent_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          academic_year: string | null
          attachment_url: string | null
          class_name: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          teacher_id: string | null
          term: string | null
          title: string
        }
        Insert: {
          academic_year?: string | null
          attachment_url?: string | null
          class_name: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          teacher_id?: string | null
          term?: string | null
          title: string
        }
        Update: {
          academic_year?: string | null
          attachment_url?: string | null
          class_name?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          teacher_id?: string | null
          term?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          is_excused: boolean | null
          reason: string | null
          recorded_by: string | null
          status: string
          student_id: string
          time_in: string | null
          time_out: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_excused?: boolean | null
          reason?: string | null
          recorded_by?: string | null
          status: string
          student_id: string
          time_in?: string | null
          time_out?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_excused?: boolean | null
          reason?: string | null
          recorded_by?: string | null
          status?: string
          student_id?: string
          time_in?: string | null
          time_out?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      class_teachers: {
        Row: {
          academic_year: string
          class_name: string
          created_at: string
          id: string
          is_active: boolean
          teacher_id: string
        }
        Insert: {
          academic_year: string
          class_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          teacher_id: string
        }
        Update: {
          academic_year?: string
          class_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
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
          fee_payment_plan: string | null
          financial_acknowledgment: boolean | null
          financial_assistance_interest: boolean | null
          guardian1_address: string
          guardian1_children_classes: string | null
          guardian1_children_in_home: number | null
          guardian1_educational_qualification: string | null
          guardian1_email: string
          guardian1_employer: string | null
          guardian1_full_name: string
          guardian1_house_no: string | null
          guardian1_how_many_children: string | null
          guardian1_is_primary_contact: boolean | null
          guardian1_landmark: string | null
          guardian1_location: string | null
          guardian1_marital_status: string | null
          guardian1_occupation: string | null
          guardian1_other_children_in_school: boolean | null
          guardian1_phone_primary: string
          guardian1_phone_secondary: string | null
          guardian1_pupil_lives_with: boolean | null
          guardian1_relationship: string
          guardian1_religion: string | null
          guardian1_responsible_for_fees: boolean | null
          guardian1_workplace_address: string | null
          guardian1_workplace_phone: string | null
          guardian2_address: string | null
          guardian2_children_classes: string | null
          guardian2_children_in_home: number | null
          guardian2_educational_qualification: string | null
          guardian2_email: string | null
          guardian2_full_name: string | null
          guardian2_house_no: string | null
          guardian2_how_many_children: string | null
          guardian2_is_emergency_contact: boolean | null
          guardian2_location: string | null
          guardian2_marital_status: string | null
          guardian2_occupation: string | null
          guardian2_other_children_in_school: boolean | null
          guardian2_phone_primary: string | null
          guardian2_phone_secondary: string | null
          guardian2_pupil_lives_with: boolean | null
          guardian2_relationship: string | null
          guardian2_religion: string | null
          guardian2_responsible_for_fees: boolean | null
          guardian2_tel_no: string | null
          guardian3_address: string | null
          guardian3_children_in_home: number | null
          guardian3_educational_qualification: string | null
          guardian3_house_no: string | null
          guardian3_location: string | null
          guardian3_marital_status: string | null
          guardian3_name: string | null
          guardian3_occupation: string | null
          guardian3_pupil_lives_with: boolean | null
          guardian3_religion: string | null
          guardian3_responsible_for_fees: boolean | null
          guardian3_tel_no: string | null
          has_allergies: boolean | null
          has_medical_conditions: boolean | null
          has_special_needs: boolean | null
          id: string
          immunization_bcg: boolean | null
          immunization_dtp: boolean | null
          immunization_hepatitis_b: boolean | null
          immunization_hib: boolean | null
          immunization_measles: boolean | null
          immunization_poliomyelitis: boolean | null
          immunization_tetanus: boolean | null
          immunization_up_to_date: boolean | null
          immunization_whooping_cough: boolean | null
          immunization_yellow_fever: boolean | null
          intended_start_date: string | null
          is_first_time_enrollment: boolean | null
          last_grade_completed: string | null
          medical_authorization: boolean | null
          medical_conditions: string[] | null
          medical_conditions_details: string | null
          pickup_location: string | null
          portal_email: string | null
          portal_password_hash: string | null
          previous_school_date_attended: string | null
          previous_school_last_class: string | null
          previous_school_location: string | null
          previous_school_name: string | null
          program_level: string
          reason_for_change: string | null
          reference_number: string
          residence_proof_url: string | null
          security_answer: string | null
          security_question: string | null
          special_needs_details: string | null
          special_needs_types: string[] | null
          status: string
          student_dob: string
          student_first_name: string
          student_gender: string
          student_hometown: string | null
          student_languages_spoken: string | null
          student_middle_name: string | null
          student_nationality: string
          student_photo_url: string | null
          student_place_of_birth: string | null
          student_religion: string | null
          student_surname: string
          subjects_studied: string[] | null
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
          fee_payment_plan?: string | null
          financial_acknowledgment?: boolean | null
          financial_assistance_interest?: boolean | null
          guardian1_address: string
          guardian1_children_classes?: string | null
          guardian1_children_in_home?: number | null
          guardian1_educational_qualification?: string | null
          guardian1_email: string
          guardian1_employer?: string | null
          guardian1_full_name: string
          guardian1_house_no?: string | null
          guardian1_how_many_children?: string | null
          guardian1_is_primary_contact?: boolean | null
          guardian1_landmark?: string | null
          guardian1_location?: string | null
          guardian1_marital_status?: string | null
          guardian1_occupation?: string | null
          guardian1_other_children_in_school?: boolean | null
          guardian1_phone_primary: string
          guardian1_phone_secondary?: string | null
          guardian1_pupil_lives_with?: boolean | null
          guardian1_relationship: string
          guardian1_religion?: string | null
          guardian1_responsible_for_fees?: boolean | null
          guardian1_workplace_address?: string | null
          guardian1_workplace_phone?: string | null
          guardian2_address?: string | null
          guardian2_children_classes?: string | null
          guardian2_children_in_home?: number | null
          guardian2_educational_qualification?: string | null
          guardian2_email?: string | null
          guardian2_full_name?: string | null
          guardian2_house_no?: string | null
          guardian2_how_many_children?: string | null
          guardian2_is_emergency_contact?: boolean | null
          guardian2_location?: string | null
          guardian2_marital_status?: string | null
          guardian2_occupation?: string | null
          guardian2_other_children_in_school?: boolean | null
          guardian2_phone_primary?: string | null
          guardian2_phone_secondary?: string | null
          guardian2_pupil_lives_with?: boolean | null
          guardian2_relationship?: string | null
          guardian2_religion?: string | null
          guardian2_responsible_for_fees?: boolean | null
          guardian2_tel_no?: string | null
          guardian3_address?: string | null
          guardian3_children_in_home?: number | null
          guardian3_educational_qualification?: string | null
          guardian3_house_no?: string | null
          guardian3_location?: string | null
          guardian3_marital_status?: string | null
          guardian3_name?: string | null
          guardian3_occupation?: string | null
          guardian3_pupil_lives_with?: boolean | null
          guardian3_religion?: string | null
          guardian3_responsible_for_fees?: boolean | null
          guardian3_tel_no?: string | null
          has_allergies?: boolean | null
          has_medical_conditions?: boolean | null
          has_special_needs?: boolean | null
          id?: string
          immunization_bcg?: boolean | null
          immunization_dtp?: boolean | null
          immunization_hepatitis_b?: boolean | null
          immunization_hib?: boolean | null
          immunization_measles?: boolean | null
          immunization_poliomyelitis?: boolean | null
          immunization_tetanus?: boolean | null
          immunization_up_to_date?: boolean | null
          immunization_whooping_cough?: boolean | null
          immunization_yellow_fever?: boolean | null
          intended_start_date?: string | null
          is_first_time_enrollment?: boolean | null
          last_grade_completed?: string | null
          medical_authorization?: boolean | null
          medical_conditions?: string[] | null
          medical_conditions_details?: string | null
          pickup_location?: string | null
          portal_email?: string | null
          portal_password_hash?: string | null
          previous_school_date_attended?: string | null
          previous_school_last_class?: string | null
          previous_school_location?: string | null
          previous_school_name?: string | null
          program_level: string
          reason_for_change?: string | null
          reference_number: string
          residence_proof_url?: string | null
          security_answer?: string | null
          security_question?: string | null
          special_needs_details?: string | null
          special_needs_types?: string[] | null
          status?: string
          student_dob: string
          student_first_name: string
          student_gender: string
          student_hometown?: string | null
          student_languages_spoken?: string | null
          student_middle_name?: string | null
          student_nationality: string
          student_photo_url?: string | null
          student_place_of_birth?: string | null
          student_religion?: string | null
          student_surname: string
          subjects_studied?: string[] | null
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
          fee_payment_plan?: string | null
          financial_acknowledgment?: boolean | null
          financial_assistance_interest?: boolean | null
          guardian1_address?: string
          guardian1_children_classes?: string | null
          guardian1_children_in_home?: number | null
          guardian1_educational_qualification?: string | null
          guardian1_email?: string
          guardian1_employer?: string | null
          guardian1_full_name?: string
          guardian1_house_no?: string | null
          guardian1_how_many_children?: string | null
          guardian1_is_primary_contact?: boolean | null
          guardian1_landmark?: string | null
          guardian1_location?: string | null
          guardian1_marital_status?: string | null
          guardian1_occupation?: string | null
          guardian1_other_children_in_school?: boolean | null
          guardian1_phone_primary?: string
          guardian1_phone_secondary?: string | null
          guardian1_pupil_lives_with?: boolean | null
          guardian1_relationship?: string
          guardian1_religion?: string | null
          guardian1_responsible_for_fees?: boolean | null
          guardian1_workplace_address?: string | null
          guardian1_workplace_phone?: string | null
          guardian2_address?: string | null
          guardian2_children_classes?: string | null
          guardian2_children_in_home?: number | null
          guardian2_educational_qualification?: string | null
          guardian2_email?: string | null
          guardian2_full_name?: string | null
          guardian2_house_no?: string | null
          guardian2_how_many_children?: string | null
          guardian2_is_emergency_contact?: boolean | null
          guardian2_location?: string | null
          guardian2_marital_status?: string | null
          guardian2_occupation?: string | null
          guardian2_other_children_in_school?: boolean | null
          guardian2_phone_primary?: string | null
          guardian2_phone_secondary?: string | null
          guardian2_pupil_lives_with?: boolean | null
          guardian2_relationship?: string | null
          guardian2_religion?: string | null
          guardian2_responsible_for_fees?: boolean | null
          guardian2_tel_no?: string | null
          guardian3_address?: string | null
          guardian3_children_in_home?: number | null
          guardian3_educational_qualification?: string | null
          guardian3_house_no?: string | null
          guardian3_location?: string | null
          guardian3_marital_status?: string | null
          guardian3_name?: string | null
          guardian3_occupation?: string | null
          guardian3_pupil_lives_with?: boolean | null
          guardian3_religion?: string | null
          guardian3_responsible_for_fees?: boolean | null
          guardian3_tel_no?: string | null
          has_allergies?: boolean | null
          has_medical_conditions?: boolean | null
          has_special_needs?: boolean | null
          id?: string
          immunization_bcg?: boolean | null
          immunization_dtp?: boolean | null
          immunization_hepatitis_b?: boolean | null
          immunization_hib?: boolean | null
          immunization_measles?: boolean | null
          immunization_poliomyelitis?: boolean | null
          immunization_tetanus?: boolean | null
          immunization_up_to_date?: boolean | null
          immunization_whooping_cough?: boolean | null
          immunization_yellow_fever?: boolean | null
          intended_start_date?: string | null
          is_first_time_enrollment?: boolean | null
          last_grade_completed?: string | null
          medical_authorization?: boolean | null
          medical_conditions?: string[] | null
          medical_conditions_details?: string | null
          pickup_location?: string | null
          portal_email?: string | null
          portal_password_hash?: string | null
          previous_school_date_attended?: string | null
          previous_school_last_class?: string | null
          previous_school_location?: string | null
          previous_school_name?: string | null
          program_level?: string
          reason_for_change?: string | null
          reference_number?: string
          residence_proof_url?: string | null
          security_answer?: string | null
          security_question?: string | null
          special_needs_details?: string | null
          special_needs_types?: string[] | null
          status?: string
          student_dob?: string
          student_first_name?: string
          student_gender?: string
          student_hometown?: string | null
          student_languages_spoken?: string | null
          student_middle_name?: string | null
          student_nationality?: string
          student_photo_url?: string | null
          student_place_of_birth?: string | null
          student_religion?: string | null
          student_surname?: string
          subjects_studied?: string[] | null
          transportation_method?: string | null
          updated_at?: string
          vaccination_card_url?: string | null
        }
        Relationships: []
      }
      fees: {
        Row: {
          academic_year: string
          amount: number
          created_at: string
          description: string | null
          due_date: string | null
          fee_type: string
          id: string
          is_paid: boolean
          payment_date: string | null
          payment_method: string | null
          receipt_number: string | null
          student_id: string
          term: string | null
          updated_at: string
        }
        Insert: {
          academic_year: string
          amount: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          fee_type: string
          id?: string
          is_paid?: boolean
          payment_date?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          student_id: string
          term?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          amount?: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          fee_type?: string
          id?: string
          is_paid?: boolean
          payment_date?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          student_id?: string
          term?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          caption: string | null
          category: string
          created_at: string
          display_order: number | null
          file_name: string
          file_url: string
          id: string
          is_active: boolean | null
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          category: string
          created_at?: string
          display_order?: number | null
          file_name: string
          file_url: string
          id?: string
          is_active?: boolean | null
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          category?: string
          created_at?: string
          display_order?: number | null
          file_name?: string
          file_url?: string
          id?: string
          is_active?: boolean | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      grades: {
        Row: {
          academic_year: string
          assignment_score: number | null
          class_average: number | null
          class_work_score: number | null
          created_at: string
          endterm_score: number | null
          etes_score: number | null
          grade_description: string | null
          grade_letter: string | null
          ias_score: number | null
          id: string
          midterm_score: number | null
          position_in_class: number | null
          position_in_subject: number | null
          posted_at: string | null
          posted_by: string | null
          proficiency_level: number | null
          student_id: string
          subject_id: string
          teacher_comment: string | null
          term: string
          total_score: number | null
          updated_at: string
        }
        Insert: {
          academic_year: string
          assignment_score?: number | null
          class_average?: number | null
          class_work_score?: number | null
          created_at?: string
          endterm_score?: number | null
          etes_score?: number | null
          grade_description?: string | null
          grade_letter?: string | null
          ias_score?: number | null
          id?: string
          midterm_score?: number | null
          position_in_class?: number | null
          position_in_subject?: number | null
          posted_at?: string | null
          posted_by?: string | null
          proficiency_level?: number | null
          student_id: string
          subject_id: string
          teacher_comment?: string | null
          term: string
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          assignment_score?: number | null
          class_average?: number | null
          class_work_score?: number | null
          created_at?: string
          endterm_score?: number | null
          etes_score?: number | null
          grade_description?: string | null
          grade_letter?: string | null
          ias_score?: number | null
          id?: string
          midterm_score?: number | null
          position_in_class?: number | null
          position_in_subject?: number | null
          posted_at?: string | null
          posted_by?: string | null
          proficiency_level?: number | null
          student_id?: string
          subject_id?: string
          teacher_comment?: string | null
          term?: string
          total_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
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
      parent_accounts: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          last_login_at: string | null
          notification_announcements: boolean | null
          notification_attendance: boolean | null
          notification_email: boolean | null
          notification_fees: boolean | null
          notification_grades: boolean | null
          notification_sms: boolean | null
          parent_name: string
          phone_primary: string | null
          phone_secondary: string | null
          relationship: string
          role: Database["public"]["Enums"]["parent_role"]
          student_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          notification_announcements?: boolean | null
          notification_attendance?: boolean | null
          notification_email?: boolean | null
          notification_fees?: boolean | null
          notification_grades?: boolean | null
          notification_sms?: boolean | null
          parent_name: string
          phone_primary?: string | null
          phone_secondary?: string | null
          relationship: string
          role?: Database["public"]["Enums"]["parent_role"]
          student_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          notification_announcements?: boolean | null
          notification_attendance?: boolean | null
          notification_email?: boolean | null
          notification_fees?: boolean | null
          notification_grades?: boolean | null
          notification_sms?: boolean | null
          parent_name?: string
          phone_primary?: string | null
          phone_secondary?: string | null
          relationship?: string
          role?: Database["public"]["Enums"]["parent_role"]
          student_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_accounts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_messages: {
        Row: {
          attachment_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          parent_account_id: string | null
          read_at: string | null
          recipient_type: string
          sender_id: string | null
          sender_type: string
          student_id: string
          subject: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          parent_account_id?: string | null
          read_at?: string | null
          recipient_type: string
          sender_id?: string | null
          sender_type: string
          student_id: string
          subject: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          parent_account_id?: string | null
          read_at?: string | null
          recipient_type?: string
          sender_id?: string | null
          sender_type?: string
          student_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_messages_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "parent_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_announcements: {
        Row: {
          attachment_url: string | null
          category: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          published_at: string | null
          requires_acknowledgment: boolean
          target_audience: string
          target_class: string | null
          target_student_id: string | null
          title: string
          visibility: string
        }
        Insert: {
          attachment_url?: string | null
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          requires_acknowledgment?: boolean
          target_audience?: string
          target_class?: string | null
          target_student_id?: string | null
          title: string
          visibility?: string
        }
        Update: {
          attachment_url?: string | null
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          requires_acknowledgment?: boolean
          target_audience?: string
          target_class?: string | null
          target_student_id?: string | null
          title?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_announcements_target_student_id_fkey"
            columns: ["target_student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      report_cards: {
        Row: {
          academic_year: string
          attendance_present: number | null
          attendance_total: number | null
          attitude: string | null
          class_average: number | null
          class_name: string
          conduct: string | null
          created_at: string
          cumulated_score: number | null
          form_teacher_name: string | null
          form_teacher_remark: string | null
          headteacher_name: string | null
          headteacher_remark: string | null
          id: string
          interest: string | null
          is_published: boolean
          learner_average: number | null
          max_possible_score: number | null
          next_term_begins: string | null
          number_on_roll: number | null
          position_in_class: number | null
          promoted_to: string | null
          student_id: string
          term: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          attendance_present?: number | null
          attendance_total?: number | null
          attitude?: string | null
          class_average?: number | null
          class_name: string
          conduct?: string | null
          created_at?: string
          cumulated_score?: number | null
          form_teacher_name?: string | null
          form_teacher_remark?: string | null
          headteacher_name?: string | null
          headteacher_remark?: string | null
          id?: string
          interest?: string | null
          is_published?: boolean
          learner_average?: number | null
          max_possible_score?: number | null
          next_term_begins?: string | null
          number_on_roll?: number | null
          position_in_class?: number | null
          promoted_to?: string | null
          student_id: string
          term: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          attendance_present?: number | null
          attendance_total?: number | null
          attitude?: string | null
          class_average?: number | null
          class_name?: string
          conduct?: string | null
          created_at?: string
          cumulated_score?: number | null
          form_teacher_name?: string | null
          form_teacher_remark?: string | null
          headteacher_name?: string | null
          headteacher_remark?: string | null
          id?: string
          interest?: string | null
          is_published?: boolean
          learner_average?: number | null
          max_possible_score?: number | null
          next_term_begins?: string | null
          number_on_roll?: number | null
          position_in_class?: number | null
          promoted_to?: string | null
          student_id?: string
          term?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
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
      student_documents: {
        Row: {
          academic_year: string | null
          created_at: string
          document_name: string
          document_type: string
          file_size: number | null
          file_url: string
          id: string
          student_id: string
          term: string | null
          uploaded_by: string | null
        }
        Insert: {
          academic_year?: string | null
          created_at?: string
          document_name: string
          document_type: string
          file_size?: number | null
          file_url: string
          id?: string
          student_id: string
          term?: string | null
          uploaded_by?: string | null
        }
        Update: {
          academic_year?: string | null
          created_at?: string
          document_name?: string
          document_type?: string
          file_size?: number | null
          file_url?: string
          id?: string
          student_id?: string
          term?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academic_year: string
          created_at: string
          current_class: string
          date_of_birth: string
          enrollment_application_id: string | null
          first_name: string
          gender: string
          id: string
          middle_name: string | null
          nationality: string | null
          photo_url: string | null
          status: string
          student_id: string
          surname: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          created_at?: string
          current_class: string
          date_of_birth: string
          enrollment_application_id?: string | null
          first_name: string
          gender: string
          id?: string
          middle_name?: string | null
          nationality?: string | null
          photo_url?: string | null
          status?: string
          student_id: string
          surname: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          current_class?: string
          date_of_birth?: string
          enrollment_application_id?: string | null
          first_name?: string
          gender?: string
          id?: string
          middle_name?: string | null
          nationality?: string | null
          photo_url?: string | null
          status?: string
          student_id?: string
          surname?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_enrollment_application_id_fkey"
            columns: ["enrollment_application_id"]
            isOneToOne: false
            referencedRelation: "enrollment_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          class_level: string | null
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          class_level?: string | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          class_level?: string | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      teacher_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      timetables: {
        Row: {
          class_name: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          room_number: string | null
          start_time: string
          subject_id: string | null
          teacher_name: string | null
        }
        Insert: {
          class_name: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          room_number?: string | null
          start_time: string
          subject_id?: string | null
          teacher_name?: string | null
        }
        Update: {
          class_name?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          room_number?: string | null
          start_time?: string
          subject_id?: string | null
          teacher_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetables_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
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
      generate_student_id: { Args: never; Returns: string }
      get_teacher_profile_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_teacher: { Args: { _user_id: string }; Returns: boolean }
      teacher_has_class: {
        Args: { _class_name: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admissions_officer"
        | "content_manager"
        | "teacher"
      parent_role: "primary" | "secondary"
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
      app_role: [
        "super_admin",
        "admissions_officer",
        "content_manager",
        "teacher",
      ],
      parent_role: ["primary", "secondary"],
    },
  },
} as const
