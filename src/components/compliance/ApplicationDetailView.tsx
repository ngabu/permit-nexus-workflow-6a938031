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
  application_date: string;
  uploaded_files: any;
  fee_amount?: number;
  estimated_cost_kina?: number;
  commencement_date?: string;
  completion_date?: string;
}

interface ApplicationDetailViewProps {
  application: ApplicationDetail | null;
}

export function ApplicationDetailView({ application }: ApplicationDetailViewProps) {
  return (
    <ComprehensivePermitApplicationView 
      application={application} 
    />
  );
}