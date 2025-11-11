
export interface InitialAssessment {
  id: string;
  permit_id: string;
  assessed_by: string;
  assessment_status: 'pending' | 'passed' | 'failed' | 'requires_clarification';
  assessment_notes: string;
  assessment_date: string;
  feedback_provided: string | null;
  forwarded_to_compliance: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegistryStaff {
  id: string;
  email: string;
  full_name: string | null;
  staff_position: 'officer' | 'manager';
}

export interface PermitForAssessment {
  id: string;
  permit_number: string | null;
  title: string;
  permit_type: string;
  status: string;
  application_date: string;
  description?: string;
  commencement_date?: string | null;
  completion_date?: string | null;
  estimated_cost_kina?: number | null;
  activity_classification?: string | null;
  entity: {
    id?: string;
    name: string;
    entity_type: string;
  };
  assigned_officer_id?: string;
  assigned_officer?: {
    id: string;
    full_name: string | null;
    email: string;
  };
  assessment?: {
    id: string;
    assessment_status: string;
    assessment_notes: string;
    assessed_by: string;
    created_at: string;
  } | null;
  created_at: string;
  updated_at: string;
}
