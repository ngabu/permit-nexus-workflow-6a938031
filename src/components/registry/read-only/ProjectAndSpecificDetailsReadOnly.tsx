import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar, Activity, Settings } from 'lucide-react';
import { PermitForAssessment } from '../types';

interface ProjectAndSpecificDetailsReadOnlyProps {
  permit: PermitForAssessment;
}

export function ProjectAndSpecificDetailsReadOnly({ permit }: ProjectAndSpecificDetailsReadOnlyProps) {
  // Extract project details from permit
  const projectDetails = {
    description: permit.description || 'No description provided',
    startDate: permit.commencement_date || null,
    endDate: permit.completion_date || null,
    estimatedCost: permit.estimated_cost_kina || 0,
    activityClassification: permit.activity_classification || 'Not specified',
    environmentalImpact: permit.environmental_impact || 'Not specified',
    mitigationMeasures: permit.mitigation_measures || 'Not specified'
  };

  // Extract permit-specific fields from JSONB
  const specificFields = permit.permit_specific_fields || {};
  const hasSpecificFields = Object.keys(specificFields).length > 0;

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Project Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Project Description</label>
            <p className="mt-1 p-3 bg-muted rounded-lg">
              {projectDetails.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Activity Classification</label>
              <Badge variant="outline" className="mt-1">
                {projectDetails.activityClassification}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Permit Type</label>
              <Badge variant="secondary" className="mt-1">
                {permit.permit_type}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Project Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Start Date</label>
              <p className="font-medium">
                {projectDetails.startDate 
                  ? new Date(projectDetails.startDate).toLocaleDateString()
                  : 'Not specified'
                }
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">End Date</label>
              <p className="font-medium">
                {projectDetails.endDate 
                  ? new Date(projectDetails.endDate).toLocaleDateString()
                  : 'Not specified'
                }
              </p>
            </div>
          </div>
          {projectDetails.estimatedCost > 0 && (
            <div className="mt-4">
              <label className="text-sm font-medium text-muted-foreground">Estimated Project Cost</label>
              <p className="font-medium text-lg">
                PGK {projectDetails.estimatedCost.toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environmental Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Environmental Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Environmental Impact</label>
            <p className="mt-1 p-3 bg-muted rounded-lg">
              {projectDetails.environmentalImpact}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Mitigation Measures</label>
            <p className="mt-1 p-3 bg-muted rounded-lg">
              {projectDetails.mitigationMeasures}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Permit-Specific Fields */}
      {hasSpecificFields && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Permit-Specific Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(specificFields).map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-muted-foreground">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </label>
                  <p className="mt-1 p-3 bg-muted rounded-lg">
                    {typeof value === 'boolean' 
                      ? (value ? 'Yes' : 'No')
                      : String(value || 'Not specified')
                    }
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
