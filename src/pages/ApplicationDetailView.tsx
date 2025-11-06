import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { PermitApplicationReadOnlyView } from '@/components/public/PermitApplicationReadOnlyView';

export default function ApplicationDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Invalid Application</h2>
            <p className="text-muted-foreground mb-4">No application ID provided.</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <PermitApplicationReadOnlyView applicationId={id} />
        </div>
      </div>
    </DashboardLayout>
  );
}