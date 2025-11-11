import { useInitialAssessments } from './hooks/useInitialAssessments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, User, Building, ExternalLink, FileCheck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PermitAssessmentsList() {
  const { assessments, loading } = useInitialAssessments();
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_initial_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'initial_assessment_passed':
        return 'bg-green-100 text-green-800';
      case 'requires_clarification':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewApplication = (permitId: string) => {
    navigate(`/registry/applications/${permitId}`);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading assessments...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileCheck className="w-5 h-5 mr-2" />
          Initial Assessments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {assessments.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No applications pending assessment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <h3 className="font-medium">
                          {assessment.permit_application?.title || `Application ${assessment.permit_application?.application_number}`}
                        </h3>
                        <Badge className={getStatusColor(assessment.assessment_status)}>
                          {assessment.assessment_status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          <span>{assessment.permit_application?.entity_name || 'Unknown Entity'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>Initial Assessment</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(assessment.assessment_date).toLocaleDateString()}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewApplication(assessment.permit_application_id)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Review Application
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}