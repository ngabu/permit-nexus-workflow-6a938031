import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar, DollarSign, FileText, Activity } from 'lucide-react';
import { PermitForAssessment } from '../types';

interface ProjectDetailsReadOnlyProps {
  permit: PermitForAssessment;
}

export function ProjectDetailsReadOnly({ permit }: ProjectDetailsReadOnlyProps) {
  // Mock data for demonstration - in real implementation, fetch from permit application details
  const projectDetails = {
    description: permit.description || 'No description provided',
    estimatedCost: 0,
    startDate: null,
    endDate: null,
    activityClassification: 'Not specified',
    environmentalImpact: 'Not specified',
    mitigationMeasures: 'Not specified'
  };

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
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Financial Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Estimated Project Cost</label>
            <p className="font-medium text-lg">
              PGK {projectDetails.estimatedCost.toLocaleString() || 'Not specified'}
            </p>
          </div>
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
    </div>
  );
}