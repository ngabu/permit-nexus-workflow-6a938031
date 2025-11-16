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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_document_mapping: {
        Row: {
          conditional_trigger: string | null
          id: string
          level_override: number | null
          prescribed_activity_id: string
          required_document_id: string
        }
        Insert: {
          conditional_trigger?: string | null
          id?: string
          level_override?: number | null
          prescribed_activity_id: string
          required_document_id: string
        }
        Update: {
          conditional_trigger?: string | null
          id?: string
          level_override?: number | null
          prescribed_activity_id?: string
          required_document_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_document_mapping_level_override_fkey"
            columns: ["level_override"]
            isOneToOne: false
            referencedRelation: "activity_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_document_mapping_prescribed_activity_id_fkey"
            columns: ["prescribed_activity_id"]
            isOneToOne: false
            referencedRelation: "activity_fee_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "activity_document_mapping_prescribed_activity_id_fkey"
            columns: ["prescribed_activity_id"]
            isOneToOne: false
            referencedRelation: "prescribed_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_document_mapping_prescribed_activity_id_fkey"
            columns: ["prescribed_activity_id"]
            isOneToOne: false
            referencedRelation: "vw_activity_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_document_mapping_prescribed_activity_id_fkey"
            columns: ["prescribed_activity_id"]
            isOneToOne: false
            referencedRelation: "vw_activity_requirements"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "activity_document_mapping_required_document_id_fkey"
            columns: ["required_document_id"]
            isOneToOne: false
            referencedRelation: "required_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_document_requirements: {
        Row: {
          activity_classification: string | null
          activity_level: number
          created_at: string
          description: string | null
          document_name: string
          id: string
          is_mandatory: boolean
          prescribed_activity_id: string | null
          template_path: string | null
          trigger_condition: string | null
          updated_at: string
        }
        Insert: {
          activity_classification?: string | null
          activity_level: number
          created_at?: string
          description?: string | null
          document_name: string
          id?: string
          is_mandatory?: boolean
          prescribed_activity_id?: string | null
          template_path?: string | null
          trigger_condition?: string | null
          updated_at?: string
        }
        Update: {
          activity_classification?: string | null
          activity_level?: number
          created_at?: string
          description?: string | null
          document_name?: string
          id?: string
          is_mandatory?: boolean
          prescribed_activity_id?: string | null
          template_path?: string | null
          trigger_condition?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_document_requirements_prescribed_activity_id_fkey"
            columns: ["prescribed_activity_id"]
            isOneToOne: false
            referencedRelation: "activity_fee_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "activity_document_requirements_prescribed_activity_id_fkey"
            columns: ["prescribed_activity_id"]
            isOneToOne: false
            referencedRelation: "prescribed_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_document_requirements_prescribed_activity_id_fkey"
            columns: ["prescribed_activity_id"]
            isOneToOne: false
            referencedRelation: "vw_activity_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_document_requirements_prescribed_activity_id_fkey"
            columns: ["prescribed_activity_id"]
            isOneToOne: false
            referencedRelation: "vw_activity_requirements"
            referencedColumns: ["activity_id"]
          },
        ]
      }
      activity_fee_mapping: {
        Row: {
          activity_id: string
          created_at: string
          fee_structure_id: string
          id: string
          is_default: boolean
          updated_at: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          fee_structure_id: string
          id?: string
          is_default?: boolean
          updated_at?: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          fee_structure_id?: string
          id?: string
          is_default?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_fee_mapping_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activity_fee_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "activity_fee_mapping_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "prescribed_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_fee_mapping_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "vw_activity_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_fee_mapping_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "vw_activity_requirements"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "activity_fee_mapping_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "activity_fee_view"
            referencedColumns: ["fee_structure_id"]
          },
          {
            foreignKeyName: "activity_fee_mapping_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_levels: {
        Row: {
          description: string
          id: number
          name: string
          public_review_required: boolean
        }
        Insert: {
          description: string
          id?: never
          name: string
          public_review_required?: boolean
        }
        Update: {
          description?: string
          id?: never
          name?: string
          public_review_required?: boolean
        }
        Relationships: []
      }
      application_required_docs: {
        Row: {
          application_id: string
          document_type: string
          file_path: string | null
          id: string
          notes: string | null
          requirement_id: string
          status: string
          uploaded_at: string | null
        }
        Insert: {
          application_id: string
          document_type: string
          file_path?: string | null
          id?: string
          notes?: string | null
          requirement_id: string
          status?: string
          uploaded_at?: string | null
        }
        Update: {
          application_id?: string
          document_type?: string
          file_path?: string | null
          id?: string
          notes?: string | null
          requirement_id?: string
          status?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_required_docs_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "permit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          changed_at: string | null
          id: string
          operation: string
          row_data: Json | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          changed_at?: string | null
          id?: string
          operation: string
          row_data?: Json | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          changed_at?: string | null
          id?: string
          operation?: string
          row_data?: Json | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          target_id: string | null
          target_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      base_document_requirements: {
        Row: {
          applies_to_entities: string[]
          description: string | null
          id: string
          is_mandatory: boolean | null
          name: string
          template_path: string | null
        }
        Insert: {
          applies_to_entities?: string[]
          description?: string | null
          id?: string
          is_mandatory?: boolean | null
          name: string
          template_path?: string | null
        }
        Update: {
          applies_to_entities?: string[]
          description?: string | null
          id?: string
          is_mandatory?: boolean | null
          name?: string
          template_path?: string | null
        }
        Relationships: []
      }
      compliance_assessments: {
        Row: {
          activity_level: string | null
          activity_type: string | null
          administration_form: string | null
          assessed_by: string
          assessment_notes: string | null
          assessment_status: string
          assigned_by: string
          calculated_administration_fee: number | null
          calculated_technical_fee: number | null
          compliance_score: number | null
          created_at: string
          fee_category: string | null
          final_fee_amount: number | null
          id: string
          next_review_date: string | null
          permit_application_id: string
          permit_type_selected: string | null
          processing_days: number | null
          recommendations: string | null
          technical_form: string | null
          updated_at: string
          violations_found: Json | null
        }
        Insert: {
          activity_level?: string | null
          activity_type?: string | null
          administration_form?: string | null
          assessed_by: string
          assessment_notes?: string | null
          assessment_status?: string
          assigned_by: string
          calculated_administration_fee?: number | null
          calculated_technical_fee?: number | null
          compliance_score?: number | null
          created_at?: string
          fee_category?: string | null
          final_fee_amount?: number | null
          id?: string
          next_review_date?: string | null
          permit_application_id: string
          permit_type_selected?: string | null
          processing_days?: number | null
          recommendations?: string | null
          technical_form?: string | null
          updated_at?: string
          violations_found?: Json | null
        }
        Update: {
          activity_level?: string | null
          activity_type?: string | null
          administration_form?: string | null
          assessed_by?: string
          assessment_notes?: string | null
          assessment_status?: string
          assigned_by?: string
          calculated_administration_fee?: number | null
          calculated_technical_fee?: number | null
          compliance_score?: number | null
          created_at?: string
          fee_category?: string | null
          final_fee_amount?: number | null
          id?: string
          next_review_date?: string | null
          permit_application_id?: string
          permit_type_selected?: string | null
          processing_days?: number | null
          recommendations?: string | null
          technical_form?: string | null
          updated_at?: string
          violations_found?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_assessments_permit_application_id_fkey"
            columns: ["permit_application_id"]
            isOneToOne: false
            referencedRelation: "permit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          activity_id: string | null
          document_type: string | null
          entity_id: string | null
          file_path: string
          file_size: number | null
          filename: string
          id: string
          intent_registration_draft_id: string | null
          intent_registration_id: string | null
          mime_type: string | null
          permit_id: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          document_type?: string | null
          entity_id?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          intent_registration_draft_id?: string | null
          intent_registration_id?: string | null
          mime_type?: string | null
          permit_id?: string | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string | null
          document_type?: string | null
          entity_id?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          intent_registration_draft_id?: string | null
          intent_registration_id?: string | null
          mime_type?: string | null
          permit_id?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "permit_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_intent_registration_draft_id_fkey"
            columns: ["intent_registration_draft_id"]
            isOneToOne: false
            referencedRelation: "intent_registration_drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_intent_registration_id_fkey"
            columns: ["intent_registration_id"]
            isOneToOne: false
            referencedRelation: "intent_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          contact_person: string | null
          contact_person_email: string | null
          contact_person_phone: number | null
          created_at: string
          email: string | null
          entity_type: string
          id: string
          is_suspended: boolean | null
          name: string
          phone: string | null
          postal_address: string | null
          "registered address": string | null
          registration_number: string | null
          tax_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_person?: string | null
          contact_person_email?: string | null
          contact_person_phone?: number | null
          created_at?: string
          email?: string | null
          entity_type: string
          id?: string
          is_suspended?: boolean | null
          name: string
          phone?: string | null
          postal_address?: string | null
          "registered address"?: string | null
          registration_number?: string | null
          tax_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_person?: string | null
          contact_person_email?: string | null
          contact_person_phone?: number | null
          created_at?: string
          email?: string | null
          entity_type?: string
          id?: string
          is_suspended?: boolean | null
          name?: string
          phone?: string | null
          postal_address?: string | null
          "registered address"?: string | null
          registration_number?: string | null
          tax_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fee_calculation_audit: {
        Row: {
          administration_fee: number
          calculated_by: string | null
          calculation_method: string
          created_at: string
          id: string
          is_official: boolean
          notes: string | null
          parameters: Json
          permit_application_id: string
          technical_fee: number
          total_fee: number
        }
        Insert: {
          administration_fee: number
          calculated_by?: string | null
          calculation_method: string
          created_at?: string
          id?: string
          is_official?: boolean
          notes?: string | null
          parameters: Json
          permit_application_id: string
          technical_fee: number
          total_fee: number
        }
        Update: {
          administration_fee?: number
          calculated_by?: string | null
          calculation_method?: string
          created_at?: string
          id?: string
          is_official?: boolean
          notes?: string | null
          parameters?: Json
          permit_application_id?: string
          technical_fee?: number
          total_fee?: number
        }
        Relationships: [
          {
            foreignKeyName: "fee_calculation_audit_permit_application_id_fkey"
            columns: ["permit_application_id"]
            isOneToOne: false
            referencedRelation: "permit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_calculation_methods: {
        Row: {
          created_at: string
          description: string | null
          formula: string
          id: string
          is_active: boolean
          method_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          formula: string
          id?: string
          is_active?: boolean
          method_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          formula?: string
          id?: string
          is_active?: boolean
          method_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      fee_payments: {
        Row: {
          administration_fee: number
          amount_paid: number
          approved_by: string | null
          calculated_by: string | null
          created_at: string
          id: string
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string
          permit_application_id: string
          receipt_number: string | null
          technical_fee: number
          total_fee: number
          updated_at: string
        }
        Insert: {
          administration_fee?: number
          amount_paid?: number
          approved_by?: string | null
          calculated_by?: string | null
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          permit_application_id: string
          receipt_number?: string | null
          technical_fee?: number
          total_fee?: number
          updated_at?: string
        }
        Update: {
          administration_fee?: number
          amount_paid?: number
          approved_by?: string | null
          calculated_by?: string | null
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          permit_application_id?: string
          receipt_number?: string | null
          technical_fee?: number
          total_fee?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_permit_application_id_fkey"
            columns: ["permit_application_id"]
            isOneToOne: false
            referencedRelation: "permit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          activity_type: string
          administration_form: string
          annual_recurrent_fee: number | null
          base_processing_days: number
          basic_charge: number | null
          calculation_method_id: string | null
          calculation_params: Json | null
          category_multiplier: number
          created_at: string
          fee_category: string
          fee_type: string
          id: string
          is_active: boolean
          max_cost: number | null
          min_cost: number | null
          permit_operation: string
          permit_type: string | null
          technical_form: string
          treatment_factor: number | null
          updated_at: string
          use_factor: number | null
          work_plan_amount: number
        }
        Insert: {
          activity_type: string
          administration_form: string
          annual_recurrent_fee?: number | null
          base_processing_days: number
          basic_charge?: number | null
          calculation_method_id?: string | null
          calculation_params?: Json | null
          category_multiplier?: number
          created_at?: string
          fee_category: string
          fee_type?: string
          id?: string
          is_active?: boolean
          max_cost?: number | null
          min_cost?: number | null
          permit_operation: string
          permit_type?: string | null
          technical_form: string
          treatment_factor?: number | null
          updated_at?: string
          use_factor?: number | null
          work_plan_amount?: number
        }
        Update: {
          activity_type?: string
          administration_form?: string
          annual_recurrent_fee?: number | null
          base_processing_days?: number
          basic_charge?: number | null
          calculation_method_id?: string | null
          calculation_params?: Json | null
          category_multiplier?: number
          created_at?: string
          fee_category?: string
          fee_type?: string
          id?: string
          is_active?: boolean
          max_cost?: number | null
          min_cost?: number | null
          permit_operation?: string
          permit_type?: string | null
          technical_form?: string
          treatment_factor?: number | null
          updated_at?: string
          use_factor?: number | null
          work_plan_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_calculation_method_id_fkey"
            columns: ["calculation_method_id"]
            isOneToOne: false
            referencedRelation: "fee_calculation_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          application_id: string | null
          created_at: string
          currency: string
          due_date: string | null
          follow_up_notes: string | null
          follow_up_required: boolean | null
          id: string
          last_follow_up_date: string | null
          myob_reference: string | null
          paid_date: string | null
          payment_method: string | null
          payment_reference: string | null
          permit_id: string | null
          status: string
          transaction_number: string
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          application_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          last_follow_up_date?: string | null
          myob_reference?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          permit_id?: string | null
          status?: string
          transaction_number: string
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          application_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          last_follow_up_date?: string | null
          myob_reference?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          permit_id?: string | null
          status?: string
          transaction_number?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      initial_assessments: {
        Row: {
          assessed_by: string
          assessment_date: string
          assessment_notes: string
          assessment_outcome: string
          assessment_status: string
          created_at: string
          feedback_provided: string | null
          id: string
          permit_activity_type: string | null
          permit_application_id: string
          updated_at: string
        }
        Insert: {
          assessed_by: string
          assessment_date?: string
          assessment_notes: string
          assessment_outcome: string
          assessment_status?: string
          created_at?: string
          feedback_provided?: string | null
          id?: string
          permit_activity_type?: string | null
          permit_application_id: string
          updated_at?: string
        }
        Update: {
          assessed_by?: string
          assessment_date?: string
          assessment_notes?: string
          assessment_outcome?: string
          assessment_status?: string
          created_at?: string
          feedback_provided?: string | null
          id?: string
          permit_activity_type?: string | null
          permit_application_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "initial_assessments_permit_application_id_fkey"
            columns: ["permit_application_id"]
            isOneToOne: false
            referencedRelation: "permit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          accommodation_cost: number | null
          completed_date: string | null
          created_at: string
          created_by: string | null
          daily_allowance: number | null
          findings: string | null
          id: string
          inspection_type: string
          inspector_id: string | null
          notes: string | null
          number_of_days: number | null
          permit_application_id: string
          permit_category: string | null
          province: string | null
          scheduled_date: string
          status: string
          total_travel_cost: number | null
          transportation_cost: number | null
          updated_at: string
        }
        Insert: {
          accommodation_cost?: number | null
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          daily_allowance?: number | null
          findings?: string | null
          id?: string
          inspection_type: string
          inspector_id?: string | null
          notes?: string | null
          number_of_days?: number | null
          permit_application_id: string
          permit_category?: string | null
          province?: string | null
          scheduled_date: string
          status?: string
          total_travel_cost?: number | null
          transportation_cost?: number | null
          updated_at?: string
        }
        Update: {
          accommodation_cost?: number | null
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          daily_allowance?: number | null
          findings?: string | null
          id?: string
          inspection_type?: string
          inspector_id?: string | null
          notes?: string | null
          number_of_days?: number | null
          permit_application_id?: string
          permit_category?: string | null
          province?: string | null
          scheduled_date?: string
          status?: string
          total_travel_cost?: number | null
          transportation_cost?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      intent_registration_drafts: {
        Row: {
          activity_description: string | null
          activity_level: string | null
          approvals_required: string | null
          commencement_date: string | null
          completion_date: string | null
          created_at: string
          departments_approached: string | null
          draft_name: string | null
          entity_id: string | null
          estimated_cost_kina: number | null
          existing_permit_id: string | null
          government_agreement: string | null
          id: string
          landowner_negotiation_status: string | null
          preparatory_work_description: string | null
          prescribed_activity_id: string | null
          project_site_address: string | null
          project_site_description: string | null
          site_ownership_details: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_description?: string | null
          activity_level?: string | null
          approvals_required?: string | null
          commencement_date?: string | null
          completion_date?: string | null
          created_at?: string
          departments_approached?: string | null
          draft_name?: string | null
          entity_id?: string | null
          estimated_cost_kina?: number | null
          existing_permit_id?: string | null
          government_agreement?: string | null
          id?: string
          landowner_negotiation_status?: string | null
          preparatory_work_description?: string | null
          prescribed_activity_id?: string | null
          project_site_address?: string | null
          project_site_description?: string | null
          site_ownership_details?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_description?: string | null
          activity_level?: string | null
          approvals_required?: string | null
          commencement_date?: string | null
          completion_date?: string | null
          created_at?: string
          departments_approached?: string | null
          draft_name?: string | null
          entity_id?: string | null
          estimated_cost_kina?: number | null
          existing_permit_id?: string | null
          government_agreement?: string | null
          id?: string
          landowner_negotiation_status?: string | null
          preparatory_work_description?: string | null
          prescribed_activity_id?: string | null
          project_site_address?: string | null
          project_site_description?: string | null
          site_ownership_details?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intent_registration_drafts_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intent_registration_drafts_existing_permit_id_fkey"
            columns: ["existing_permit_id"]
            isOneToOne: false
            referencedRelation: "permit_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intent_registration_drafts_prescribed_activity_id_fkey"
            columns: ["prescribed_activity_id"]
            isOneToOne: false
            referencedRelation: "activity_fee_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "intent_registration_drafts_prescribed_activity_id_fkey"
            columns: ["prescribed_activity_id"]
            isOneToOne: false
            referencedRelation: "prescribed_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intent_registration_drafts_prescribed_activity_id_fkey"
            columns: ["prescribed_activity_id"]
            isOneToOne: false
            referencedRelation: "vw_activity_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intent_registration_drafts_prescribed_activity_id_fkey"
            columns: ["prescribed_activity_id"]
            isOneToOne: false
            referencedRelation: "vw_activity_requirements"
            referencedColumns: ["activity_id"]
          },
        ]
      }
      intent_registrations: {
        Row: {
          activity_description: string
          activity_level: string
          approvals_required: string | null
          commencement_date: string
          completion_date: string
          created_at: string
          departments_approached: string | null
          entity_id: string
          estimated_cost_kina: number | null
          existing_permit_id: string | null
          government_agreement: string | null
          id: string
          landowner_negotiation_status: string | null
          official_feedback_attachments: Json | null
          preparatory_work_description: string
          prescribed_activity_id: string | null
          project_site_address: string | null
          project_site_description: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          site_ownership_details: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_description: string
          activity_level: string
          approvals_required?: string | null
          commencement_date: string
          completion_date: string
          created_at?: string
          departments_approached?: string | null
          entity_id: string
          estimated_cost_kina?: number | null
          existing_permit_id?: string | null
          government_agreement?: string | null
          id?: string
          landowner_negotiation_status?: string | null
          official_feedback_attachments?: Json | null
          preparatory_work_description: string
          prescribed_activity_id?: string | null
          project_site_address?: string | null
          project_site_description?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          site_ownership_details?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_description?: string
          activity_level?: string
          approvals_required?: string | null
          commencement_date?: string
          completion_date?: string
          created_at?: string
          departments_approached?: string | null
          entity_id?: string
          estimated_cost_kina?: number | null
          existing_permit_id?: string | null
          government_agreement?: string | null
          id?: string
          landowner_negotiation_status?: string | null
          official_feedback_attachments?: Json | null
          preparatory_work_description?: string
          prescribed_activity_id?: string | null
          project_site_address?: string | null
          project_site_description?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          site_ownership_details?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intent_registrations_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intent_registrations_existing_permit_id_fkey"
            columns: ["existing_permit_id"]
            isOneToOne: false
            referencedRelation: "permit_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intent_registrations_prescribed_activity_id_fkey"
            columns: ["prescribed_activity_id"]
            isOneToOne: false
            referencedRelation: "activity_fee_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "intent_registrations_prescribed_activity_id_fkey"
            columns: ["prescribed_activity_id"]
            isOneToOne: false
            referencedRelation: "prescribed_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intent_registrations_prescribed_activity_id_fkey"
            columns: ["prescribed_activity_id"]
            isOneToOne: false
            referencedRelation: "vw_activity_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intent_registrations_prescribed_activity_id_fkey"
            columns: ["prescribed_activity_id"]
            isOneToOne: false
            referencedRelation: "vw_activity_requirements"
            referencedColumns: ["activity_id"]
          },
        ]
      }
      invoices: {
        Row: {
          activity_id: string | null
          amount: number
          assigned_officer_id: string | null
          created_at: string
          currency: string
          due_date: string
          follow_up_date: string | null
          follow_up_notes: string | null
          id: string
          invoice_number: string
          paid_date: string | null
          payment_status: string | null
          permit_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          amount: number
          assigned_officer_id?: string | null
          created_at?: string
          currency?: string
          due_date: string
          follow_up_date?: string | null
          follow_up_notes?: string | null
          id?: string
          invoice_number: string
          paid_date?: string | null
          payment_status?: string | null
          permit_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string | null
          amount?: number
          assigned_officer_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string
          follow_up_date?: string | null
          follow_up_notes?: string | null
          id?: string
          invoice_number?: string
          paid_date?: string | null
          payment_status?: string | null
          permit_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "permit_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          related_id: string
          target_position: Database["public"]["Enums"]["staff_position"] | null
          target_unit: Database["public"]["Enums"]["staff_unit"]
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          related_id: string
          target_position?: Database["public"]["Enums"]["staff_position"] | null
          target_unit: Database["public"]["Enums"]["staff_unit"]
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          related_id?: string
          target_position?: Database["public"]["Enums"]["staff_position"] | null
          target_unit?: Database["public"]["Enums"]["staff_unit"]
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_related_id"
            columns: ["related_id"]
            isOneToOne: false
            referencedRelation: "permit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_activity_id: string | null
          related_permit_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_activity_id?: string | null
          related_permit_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_activity_id?: string | null
          related_permit_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_activity_id_fkey"
            columns: ["related_activity_id"]
            isOneToOne: false
            referencedRelation: "permit_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      permit_activities: {
        Row: {
          activity_type: string
          created_at: string
          details: Json | null
          id: string
          permit_id: string
          status: string
          updated_at: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          details?: Json | null
          id?: string
          permit_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          permit_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      permit_applications: {
        Row: {
          activity_category: string | null
          activity_classification: string | null
          activity_id: string | null
          activity_level: string | null
          activity_location: string | null
          activity_subcategory: string | null
          air_emission_details: Json | null
          application_date: string | null
          application_fee: number | null
          application_number: string | null
          approval_date: string | null
          aquaculture_details: Json | null
          assigned_compliance_officer_id: string | null
          assigned_officer_email: string | null
          assigned_officer_id: string | null
          assigned_officer_name: string | null
          biodiversity_abs_details: Json | null
          carbon_offset_details: Json | null
          chemical_storage_details: Json | null
          commencement_date: string | null
          completed_steps: Json | null
          completion_date: string | null
          compliance_checks: Json | null
          compliance_commitment: boolean | null
          consultation_period_end: string | null
          consultation_period_start: string | null
          consulted_departments: string | null
          coordinates: Json | null
          created_at: string
          current_step: number | null
          description: string | null
          dredging_details: Json | null
          effluent_discharge_details: Json | null
          eia_required: boolean | null
          eis_required: boolean | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string | null
          environmental_impact: string | null
          estimated_cost_kina: number | null
          existing_permit_id: string | null
          existing_permits_details: string | null
          expiry_date: string | null
          fee_amount: number | null
          fee_breakdown: Json | null
          forest_product_details: Json | null
          frozen_reason: string | null
          fuel_storage_details: Json | null
          ghg_emission_details: Json | null
          government_agreements_details: string | null
          hazardous_material_details: Json | null
          hazardous_waste_details: Json | null
          id: string
          infrastructure_details: Json | null
          is_draft: boolean | null
          is_frozen: boolean | null
          land_clearing_details: Json | null
          landowner_negotiation_status: string | null
          legal_declaration_accepted: boolean | null
          mandatory_fields_complete: boolean | null
          marine_dumping_details: Json | null
          mining_chemical_details: Json | null
          mining_permit_details: Json | null
          mitigation_measures: string | null
          monitoring_license_details: Json | null
          noise_emission_details: Json | null
          ods_details: Json | null
          ods_quota_allocation: string | null
          operating_hours: string | null
          operational_capacity: string | null
          operational_details: string | null
          payment_status: string | null
          permit_category: string | null
          permit_number: string | null
          permit_period: string | null
          permit_type: string
          permit_type_id: string | null
          permit_type_specific: string | null
          pesticide_details: Json | null
          project_description: string | null
          project_end_date: string | null
          project_start_date: string | null
          public_consultation_proof: Json | null
          rehabilitation_details: Json | null
          renewable_energy_details: Json | null
          required_approvals: string | null
          research_details: Json | null
          soil_extraction_details: Json | null
          solid_waste_details: Json | null
          status: string
          stormwater_details: Json | null
          title: string
          updated_at: string
          uploaded_files: Json | null
          user_id: string
          waste_contaminant_details: Json | null
          water_extraction_details: Json | null
          wildlife_trade_details: Json | null
        }
        Insert: {
          activity_category?: string | null
          activity_classification?: string | null
          activity_id?: string | null
          activity_level?: string | null
          activity_location?: string | null
          activity_subcategory?: string | null
          air_emission_details?: Json | null
          application_date?: string | null
          application_fee?: number | null
          application_number?: string | null
          approval_date?: string | null
          aquaculture_details?: Json | null
          assigned_compliance_officer_id?: string | null
          assigned_officer_email?: string | null
          assigned_officer_id?: string | null
          assigned_officer_name?: string | null
          biodiversity_abs_details?: Json | null
          carbon_offset_details?: Json | null
          chemical_storage_details?: Json | null
          commencement_date?: string | null
          completed_steps?: Json | null
          completion_date?: string | null
          compliance_checks?: Json | null
          compliance_commitment?: boolean | null
          consultation_period_end?: string | null
          consultation_period_start?: string | null
          consulted_departments?: string | null
          coordinates?: Json | null
          created_at?: string
          current_step?: number | null
          description?: string | null
          dredging_details?: Json | null
          effluent_discharge_details?: Json | null
          eia_required?: boolean | null
          eis_required?: boolean | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          environmental_impact?: string | null
          estimated_cost_kina?: number | null
          existing_permit_id?: string | null
          existing_permits_details?: string | null
          expiry_date?: string | null
          fee_amount?: number | null
          fee_breakdown?: Json | null
          forest_product_details?: Json | null
          frozen_reason?: string | null
          fuel_storage_details?: Json | null
          ghg_emission_details?: Json | null
          government_agreements_details?: string | null
          hazardous_material_details?: Json | null
          hazardous_waste_details?: Json | null
          id?: string
          infrastructure_details?: Json | null
          is_draft?: boolean | null
          is_frozen?: boolean | null
          land_clearing_details?: Json | null
          landowner_negotiation_status?: string | null
          legal_declaration_accepted?: boolean | null
          mandatory_fields_complete?: boolean | null
          marine_dumping_details?: Json | null
          mining_chemical_details?: Json | null
          mining_permit_details?: Json | null
          mitigation_measures?: string | null
          monitoring_license_details?: Json | null
          noise_emission_details?: Json | null
          ods_details?: Json | null
          ods_quota_allocation?: string | null
          operating_hours?: string | null
          operational_capacity?: string | null
          operational_details?: string | null
          payment_status?: string | null
          permit_category?: string | null
          permit_number?: string | null
          permit_period?: string | null
          permit_type: string
          permit_type_id?: string | null
          permit_type_specific?: string | null
          pesticide_details?: Json | null
          project_description?: string | null
          project_end_date?: string | null
          project_start_date?: string | null
          public_consultation_proof?: Json | null
          rehabilitation_details?: Json | null
          renewable_energy_details?: Json | null
          required_approvals?: string | null
          research_details?: Json | null
          soil_extraction_details?: Json | null
          solid_waste_details?: Json | null
          status?: string
          stormwater_details?: Json | null
          title: string
          updated_at?: string
          uploaded_files?: Json | null
          user_id: string
          waste_contaminant_details?: Json | null
          water_extraction_details?: Json | null
          wildlife_trade_details?: Json | null
        }
        Update: {
          activity_category?: string | null
          activity_classification?: string | null
          activity_id?: string | null
          activity_level?: string | null
          activity_location?: string | null
          activity_subcategory?: string | null
          air_emission_details?: Json | null
          application_date?: string | null
          application_fee?: number | null
          application_number?: string | null
          approval_date?: string | null
          aquaculture_details?: Json | null
          assigned_compliance_officer_id?: string | null
          assigned_officer_email?: string | null
          assigned_officer_id?: string | null
          assigned_officer_name?: string | null
          biodiversity_abs_details?: Json | null
          carbon_offset_details?: Json | null
          chemical_storage_details?: Json | null
          commencement_date?: string | null
          completed_steps?: Json | null
          completion_date?: string | null
          compliance_checks?: Json | null
          compliance_commitment?: boolean | null
          consultation_period_end?: string | null
          consultation_period_start?: string | null
          consulted_departments?: string | null
          coordinates?: Json | null
          created_at?: string
          current_step?: number | null
          description?: string | null
          dredging_details?: Json | null
          effluent_discharge_details?: Json | null
          eia_required?: boolean | null
          eis_required?: boolean | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          environmental_impact?: string | null
          estimated_cost_kina?: number | null
          existing_permit_id?: string | null
          existing_permits_details?: string | null
          expiry_date?: string | null
          fee_amount?: number | null
          fee_breakdown?: Json | null
          forest_product_details?: Json | null
          frozen_reason?: string | null
          fuel_storage_details?: Json | null
          ghg_emission_details?: Json | null
          government_agreements_details?: string | null
          hazardous_material_details?: Json | null
          hazardous_waste_details?: Json | null
          id?: string
          infrastructure_details?: Json | null
          is_draft?: boolean | null
          is_frozen?: boolean | null
          land_clearing_details?: Json | null
          landowner_negotiation_status?: string | null
          legal_declaration_accepted?: boolean | null
          mandatory_fields_complete?: boolean | null
          marine_dumping_details?: Json | null
          mining_chemical_details?: Json | null
          mining_permit_details?: Json | null
          mitigation_measures?: string | null
          monitoring_license_details?: Json | null
          noise_emission_details?: Json | null
          ods_details?: Json | null
          ods_quota_allocation?: string | null
          operating_hours?: string | null
          operational_capacity?: string | null
          operational_details?: string | null
          payment_status?: string | null
          permit_category?: string | null
          permit_number?: string | null
          permit_period?: string | null
          permit_type?: string
          permit_type_id?: string | null
          permit_type_specific?: string | null
          pesticide_details?: Json | null
          project_description?: string | null
          project_end_date?: string | null
          project_start_date?: string | null
          public_consultation_proof?: Json | null
          rehabilitation_details?: Json | null
          renewable_energy_details?: Json | null
          required_approvals?: string | null
          research_details?: Json | null
          soil_extraction_details?: Json | null
          solid_waste_details?: Json | null
          status?: string
          stormwater_details?: Json | null
          title?: string
          updated_at?: string
          uploaded_files?: Json | null
          user_id?: string
          waste_contaminant_details?: Json | null
          water_extraction_details?: Json | null
          wildlife_trade_details?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "permit_applications_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activity_fee_view"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "permit_applications_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "prescribed_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permit_applications_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "vw_activity_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permit_applications_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "vw_activity_requirements"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "permit_applications_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permit_applications_existing_permit_id_fkey"
            columns: ["existing_permit_id"]
            isOneToOne: false
            referencedRelation: "permit_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permit_applications_permit_type_id_fkey"
            columns: ["permit_type_id"]
            isOneToOne: false
            referencedRelation: "permit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      permit_assessments: {
        Row: {
          additional_requirements: Json | null
          assessed_by: string
          assessment_date: string
          assessment_notes: string
          assessment_status: string
          created_at: string
          eia_due_date: string | null
          feedback_provided: string | null
          forwarded_to_compliance: boolean
          id: string
          permit_application_id: string
          recommendations: string | null
          requires_eia: boolean
          requires_workplan: boolean
          updated_at: string
          workplan_due_date: string | null
        }
        Insert: {
          additional_requirements?: Json | null
          assessed_by: string
          assessment_date?: string
          assessment_notes?: string
          assessment_status?: string
          created_at?: string
          eia_due_date?: string | null
          feedback_provided?: string | null
          forwarded_to_compliance?: boolean
          id?: string
          permit_application_id: string
          recommendations?: string | null
          requires_eia?: boolean
          requires_workplan?: boolean
          updated_at?: string
          workplan_due_date?: string | null
        }
        Update: {
          additional_requirements?: Json | null
          assessed_by?: string
          assessment_date?: string
          assessment_notes?: string
          assessment_status?: string
          created_at?: string
          eia_due_date?: string | null
          feedback_provided?: string | null
          forwarded_to_compliance?: boolean
          id?: string
          permit_application_id?: string
          recommendations?: string | null
          requires_eia?: boolean
          requires_workplan?: boolean
          updated_at?: string
          workplan_due_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permit_assessments_permit_application_id_fkey"
            columns: ["permit_application_id"]
            isOneToOne: false
            referencedRelation: "permit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      permit_type_fields: {
        Row: {
          created_at: string | null
          field_label: string
          field_name: string
          field_options: Json | null
          field_type: string
          help_text: string | null
          id: string
          is_active: boolean
          is_mandatory: boolean | null
          permit_type_id: string
          placeholder: string | null
          sort_order: number | null
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string | null
          field_label: string
          field_name: string
          field_options?: Json | null
          field_type: string
          help_text?: string | null
          id?: string
          is_active?: boolean
          is_mandatory?: boolean | null
          permit_type_id: string
          placeholder?: string | null
          sort_order?: number | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string | null
          field_label?: string
          field_name?: string
          field_options?: Json | null
          field_type?: string
          help_text?: string | null
          id?: string
          is_active?: boolean
          is_mandatory?: boolean | null
          permit_type_id?: string
          placeholder?: string | null
          sort_order?: number | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "permit_type_fields_permit_type_id_fkey"
            columns: ["permit_type_id"]
            isOneToOne: false
            referencedRelation: "permit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      permit_types: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          display_name: string
          icon_name: string | null
          id: string
          is_active: boolean | null
          jsonb_column_name: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          display_name: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          jsonb_column_name: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          jsonb_column_name?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      prescribed_activities: {
        Row: {
          activity_description: string
          category_number: string
          category_type: string
          created_at: string
          fee_category: string | null
          id: string
          level: number
          sub_category: string
        }
        Insert: {
          activity_description: string
          category_number: string
          category_type: string
          created_at?: string
          fee_category?: string | null
          id?: string
          level: number
          sub_category: string
        }
        Update: {
          activity_description?: string
          category_number?: string
          category_type?: string
          created_at?: string
          fee_category?: string | null
          id?: string
          level?: number
          sub_category?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          is_suspended: boolean | null
          last_name: string | null
          must_change_password: boolean | null
          organization: string | null
          password_changed_at: string | null
          phone: string | null
          staff_position: Database["public"]["Enums"]["staff_position"] | null
          staff_unit: Database["public"]["Enums"]["staff_unit"] | null
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          two_fa_enabled: boolean
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          is_suspended?: boolean | null
          last_name?: string | null
          must_change_password?: boolean | null
          organization?: string | null
          password_changed_at?: string | null
          phone?: string | null
          staff_position?: Database["public"]["Enums"]["staff_position"] | null
          staff_unit?: Database["public"]["Enums"]["staff_unit"] | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          two_fa_enabled?: boolean
          updated_at?: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          is_suspended?: boolean | null
          last_name?: string | null
          must_change_password?: boolean | null
          organization?: string | null
          password_changed_at?: string | null
          phone?: string | null
          staff_position?: Database["public"]["Enums"]["staff_position"] | null
          staff_unit?: Database["public"]["Enums"]["staff_unit"] | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          two_fa_enabled?: boolean
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      registry_audit_trail: {
        Row: {
          action_type: string
          assessment_id: string | null
          assessment_notes: string | null
          changes_made: Json | null
          created_at: string
          feedback_provided: string | null
          id: string
          metadata: Json | null
          new_outcome: string | null
          new_status: string | null
          officer_email: string | null
          officer_id: string
          officer_name: string | null
          permit_application_id: string
          previous_outcome: string | null
          previous_status: string | null
        }
        Insert: {
          action_type: string
          assessment_id?: string | null
          assessment_notes?: string | null
          changes_made?: Json | null
          created_at?: string
          feedback_provided?: string | null
          id?: string
          metadata?: Json | null
          new_outcome?: string | null
          new_status?: string | null
          officer_email?: string | null
          officer_id: string
          officer_name?: string | null
          permit_application_id: string
          previous_outcome?: string | null
          previous_status?: string | null
        }
        Update: {
          action_type?: string
          assessment_id?: string | null
          assessment_notes?: string | null
          changes_made?: Json | null
          created_at?: string
          feedback_provided?: string | null
          id?: string
          metadata?: Json | null
          new_outcome?: string | null
          new_status?: string | null
          officer_email?: string | null
          officer_id?: string
          officer_name?: string | null
          permit_application_id?: string
          previous_outcome?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registry_audit_trail_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "initial_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registry_audit_trail_permit_application_id_fkey"
            columns: ["permit_application_id"]
            isOneToOne: false
            referencedRelation: "permit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      required_documents: {
        Row: {
          created_at: string
          document_name: string
          id: string
          is_mandatory: boolean
          reference: string
        }
        Insert: {
          created_at?: string
          document_name: string
          id?: string
          is_mandatory?: boolean
          reference: string
        }
        Update: {
          created_at?: string
          document_name?: string
          id?: string
          is_mandatory?: boolean
          reference?: string
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          id: string
          metric_data: Json | null
          metric_name: string
          metric_value: number | null
          recorded_at: string | null
        }
        Insert: {
          id?: string
          metric_data?: Json | null
          metric_name: string
          metric_value?: number | null
          recorded_at?: string | null
        }
        Update: {
          id?: string
          metric_data?: Json | null
          metric_name?: string
          metric_value?: number | null
          recorded_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      activity_fee_view: {
        Row: {
          activity_description: string | null
          activity_id: string | null
          administration_form: string | null
          annual_recurrent_fee: number | null
          base_processing_days: number | null
          calculation_method: string | null
          category_number: string | null
          category_type: string | null
          fee_structure_id: string | null
          formula: string | null
          fs_fee_category: string | null
          is_default: boolean | null
          level: number | null
          pa_fee_category: string | null
          permit_type: string | null
          technical_form: string | null
          work_plan_amount: number | null
        }
        Relationships: []
      }
      vw_activity_options: {
        Row: {
          display_name: string | null
          id: string | null
          level: number | null
        }
        Insert: {
          display_name?: never
          id?: string | null
          level?: number | null
        }
        Update: {
          display_name?: never
          id?: string | null
          level?: number | null
        }
        Relationships: []
      }
      vw_activity_requirements: {
        Row: {
          activity_description: string | null
          activity_id: string | null
          activity_level: string | null
          conditional_trigger: string | null
          document_name: string | null
          is_mandatory: boolean | null
          reference: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_application_fee: {
        Args: {
          p_activity_id: string
          p_custom_processing_days?: number
          p_permit_type?: string
        }
        Returns: number
      }
      calculate_fee: { Args: never; Returns: undefined }
      calculate_permit_fee_complete: {
        Args: {
          p_activity_level: string
          p_activity_subcategory: string
          p_activity_type: string
          p_duration_years?: number
          p_land_area?: number
          p_ods_details?: Json
          p_permit_type: string
          p_project_cost?: number
          p_waste_details?: Json
        }
        Returns: {
          base_amount: number
          calculated_amount: number
          calculation_method: string
          component_id: string
          component_name: string
          fee_category: string
          formula_used: string
          is_mandatory: boolean
          notes: string
        }[]
      }
      can_update_user_role: {
        Args: { new_role: string; target_user_id: string }
        Returns: boolean
      }
      freeze_entity_records: {
        Args: {
          entity_id_param: string
          freeze_reason?: string
          should_freeze: boolean
        }
        Returns: undefined
      }
      generate_secure_password: { Args: never; Returns: string }
      generate_secure_password_v2: { Args: never; Returns: string }
      get_activities: { Args: never; Returns: Json }
      get_applicable_fee_structures: {
        Args: { p_activity_id: string }
        Returns: {
          annual_recurrent_fee: number
          calculation_method: string
          fee_category: string
          fee_structure_id: string
          formula: string
          is_default: boolean
          permit_type: string
        }[]
      }
      get_current_user_staff_unit: { Args: never; Returns: string }
      get_intent_registrations_with_reviewer: {
        Args: { requesting_user_id: string }
        Returns: {
          activity_description: string
          activity_level: string
          approvals_required: string
          commencement_date: string
          completion_date: string
          created_at: string
          departments_approached: string
          entity_id: string
          estimated_cost_kina: number
          government_agreement: string
          id: string
          landowner_negotiation_status: string
          official_feedback_attachments: Json
          preparatory_work_description: string
          prescribed_activity_id: string
          project_site_address: string
          project_site_description: string
          review_notes: string
          reviewed_at: string
          reviewed_by: string
          reviewer_email: string
          reviewer_first_name: string
          reviewer_last_name: string
          site_ownership_details: string
          status: string
          updated_at: string
          user_id: string
        }[]
      }
      get_prescribed_activities: { Args: never; Returns: Json }
      get_user_staff_position: { Args: never; Returns: string }
      get_user_staff_unit: { Args: never; Returns: string }
      get_user_type: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_super_admin: { Args: never; Returns: boolean }
      is_admin_or_super_admin_user: { Args: never; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_public_user: { Args: never; Returns: boolean }
      is_registry_staff: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      log_audit_event: {
        Args: {
          p_action: string
          p_details?: Json
          p_ip_address?: unknown
          p_target_id?: string
          p_target_type?: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      log_fee_calculation: {
        Args: {
          p_administration_fee: number
          p_calculation_method: string
          p_is_official?: boolean
          p_notes?: string
          p_parameters: Json
          p_permit_application_id: string
          p_technical_fee: number
          p_total_fee: number
        }
        Returns: string
      }
      log_registry_action: {
        Args: {
          p_action_type: string
          p_assessment_id: string
          p_assessment_notes?: string
          p_changes_made?: Json
          p_feedback_provided?: string
          p_metadata?: Json
          p_new_outcome?: string
          p_new_status?: string
          p_officer_id: string
          p_permit_application_id: string
          p_previous_outcome?: string
          p_previous_status?: string
        }
        Returns: string
      }
      record_system_metric: {
        Args: {
          p_metric_data?: Json
          p_metric_name: string
          p_metric_value?: number
        }
        Returns: string
      }
      update_user_role_secure: {
        Args: {
          new_role: string
          new_staff_position?: string
          new_staff_unit?: string
          target_user_id: string
        }
        Returns: boolean
      }
      update_user_role_secure_v2: {
        Args: {
          new_role: string
          new_staff_position?: string
          new_staff_unit?: string
          target_user_id: string
        }
        Returns: boolean
      }
      validate_assessment_prerequisites: {
        Args: { p_permit_application_id: string }
        Returns: Json
      }
      validate_documents: {
        Args: { activity_id: string; uploaded_docs: Json }
        Returns: Json
      }
    }
    Enums: {
      staff_position: "officer" | "manager" | "director" | "managing_director"
      staff_unit:
        | "registry"
        | "revenue"
        | "compliance"
        | "finance"
        | "directorate"
        | "systems_admin"
      user_type: "public" | "staff" | "admin" | "super_admin"
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
      staff_position: ["officer", "manager", "director", "managing_director"],
      staff_unit: [
        "registry",
        "revenue",
        "compliance",
        "finance",
        "directorate",
        "systems_admin",
      ],
      user_type: ["public", "staff", "admin", "super_admin"],
    },
  },
} as const
