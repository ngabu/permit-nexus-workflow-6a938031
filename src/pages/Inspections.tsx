
import React from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { InspectionsManagement } from '@/components/compliance/InspectionsManagement';

const Inspections = () => {
  return (
    <DashboardLayout>
      <InspectionsManagement />
    </DashboardLayout>
  );
};

export default Inspections;
