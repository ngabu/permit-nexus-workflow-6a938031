import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileCheck, Clock, User, TrendingUp } from 'lucide-react';
import { useComplianceAssessments } from './hooks/useComplianceAssessments';

export function TechnicalAssessmentDashboard() {
  const { assessments, loading } = useComplianceAssessments();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technical Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentAssessments = assessments.slice(0, 5);
  const completedCount = assessments.filter(a => a.assessment_status === 'completed').length;
  const inProgressCount = assessments.filter(a => a.assessment_status === 'in_progress').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'requires_revision':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-forest-800 flex items-center">
          <FileCheck className="w-5 h-5 mr-2" />
          Technical Assessments
        </CardTitle>
        <CardDescription>Recent technical assessment activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-lg font-semibold text-forest-800">{assessments.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-lg font-semibold text-blue-600">{inProgressCount}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-lg font-semibold text-green-600">{completedCount}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="space-y-3">
          {recentAssessments.length === 0 ? (
            <div className="text-center py-8">
              <FileCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No technical assessments found</p>
            </div>
          ) : (
            recentAssessments.map((assessment) => (
              <div key={assessment.id} className="p-3 bg-forest-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-forest-800">
                    {assessment.permit_application?.title || 'Assessment'}
                  </p>
                  <Badge className={getStatusColor(assessment.assessment_status)}>
                    {assessment.assessment_status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-forest-600">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Assigned Officer
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(assessment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {assessment.compliance_score && (
                    <span className="flex items-center gap-1 font-medium">
                      <TrendingUp className="w-3 h-3" />
                      {assessment.compliance_score}/100
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {assessments.length > 5 && (
          <Button variant="outline" className="w-full mt-4">
            View All Assessments
          </Button>
        )}
      </CardContent>
    </Card>
  );
}