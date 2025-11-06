
export interface ComplianceStaff {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  operational_unit: string | null;
  staff_position: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export interface PermitApplication {
  id: string;
  title: string;
  permit_type: string;
  status: string;
  application_date: string | null;
  application_number: string | null;
  permit_number: string | null;
  assigned_officer_id: string | null;
  assigned_compliance_officer_id: string | null;
  assigned_officer_name: string | null;
  assigned_officer_email: string | null;
  entity_name: string | null;
  entity_type: string | null;
  entity: {
    name: string;
    entity_type: string;
  };
  created_at: string;
  updated_at: string;
}
