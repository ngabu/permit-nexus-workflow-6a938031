import React from 'react';
import { ComprehensivePermitApplicationView } from './ComprehensivePermitApplicationView';

interface ApplicationDetail {
  id: string;
  title: string;
  application_number: string | null;
  entity_name: string | null;
  entity_type: string | null;
  status: string;
  permit_type: string;
  activity_classification: string;
  activity_level: string;
  description: string | null;
  activity_location: string | null;
  environmental_impact: string | null;
  mitigation_measures: string | null;
  application_date: string;
  uploaded_files: any;
  fee_amount?: number;
  estimated_cost_kina?: number;
  commencement_date?: string;
  completion_date?: string;
}

interface InitialAssessment {
  id: string;
  assessment_status: string;
  assessment_notes: string;
  assessment_outcome: string;
  feedback_provided: string | null;
  assessed_by: string;
  created_at: string;
}

interface ApplicationDetailViewProps {
  application: ApplicationDetail | null;
  initialAssessment?: InitialAssessment;
}

export function ApplicationDetailView({ application, initialAssessment }: ApplicationDetailViewProps) {
  return (
    <ComprehensivePermitApplicationView 
      application={application} 
      initialAssessment={initialAssessment} 
    />
  );
}