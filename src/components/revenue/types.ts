
export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  permit_id?: string;
  activity_id?: string;
  amount: number;
  currency: string;
  due_date: string;
  paid_date?: string;
  payment_status: string; // Changed from union type to string to match database
  status: string;
  follow_up_date?: string;
  follow_up_notes?: string;
  assigned_officer_id?: string;
  created_at: string;
  updated_at: string;
  assigned_officer?: {
    full_name: string | null;
    email: string;
  };
  permit?: {
    title: string;
    permit_number: string | null;
    permit_type: string;
  };
  entity?: {
    name: string;
    entity_type: string;
  };
}

export interface RevenueStaff {
  id: string;
  email: string;
  full_name: string | null;
  staff_position: 'officer' | 'manager';
}

export interface FinancialTransaction {
  id: string;
  transaction_number: string;
  user_id: string;
  permit_id?: string;
  application_id?: string;
  amount: number;
  currency: string;
  transaction_type: string;
  status: string;
  due_date?: string;
  paid_date?: string;
  payment_method?: string;
  payment_reference?: string;
  myob_reference?: string;
  follow_up_required: boolean;
  last_follow_up_date?: string;
  follow_up_notes?: string;
  created_at: string;
  updated_at: string;
}
