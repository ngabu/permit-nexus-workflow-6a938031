export type StaffUnit = 'registry' | 'compliance' | 'revenue';

export interface StaffMember {
  id: string;
  email: string;
  full_name: string | null;
  staff_position: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export interface UnitTask {
  id: string;
  task_type: string;
  title: string;
  description: string | null;
  assigned_to: string;
  assigned_by: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  due_date: string | null;
  completed_at: string | null;
  notes: string | null;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  assignee?: {
    full_name: string;
    email: string;
  };
}

export interface StaffPerformanceMetrics {
  staffId: string;
  staffName: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  avgCompletionTime: number; // in days
  onTimeRate: number; // percentage of tasks completed on time
}

export const TASK_TYPES: Record<StaffUnit, { value: string; label: string }[]> = {
  registry: [
    { value: 'document_review', label: 'Document Review' },
    { value: 'application_processing', label: 'Application Processing' },
    { value: 'permit_issuance', label: 'Permit Issuance' },
    { value: 'data_entry', label: 'Data Entry' },
    { value: 'verification', label: 'Verification' },
  ],
  compliance: [
    { value: 'site_inspection', label: 'Site Inspection' },
    { value: 'compliance_review', label: 'Compliance Review' },
    { value: 'report_assessment', label: 'Report Assessment' },
    { value: 'enforcement_action', label: 'Enforcement Action' },
    { value: 'follow_up', label: 'Follow Up' },
  ],
  revenue: [
    { value: 'invoice_processing', label: 'Invoice Processing' },
    { value: 'payment_verification', label: 'Payment Verification' },
    { value: 'collection_followup', label: 'Collection Follow-up' },
    { value: 'reconciliation', label: 'Reconciliation' },
    { value: 'reporting', label: 'Reporting' },
  ],
};

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-muted-foreground' },
  { value: 'normal', label: 'Normal', color: 'text-foreground' },
  { value: 'high', label: 'High', color: 'text-amber-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-destructive' },
];

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-muted text-muted-foreground' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' },
  { value: 'overdue', label: 'Overdue', color: 'bg-destructive/10 text-destructive' },
];
