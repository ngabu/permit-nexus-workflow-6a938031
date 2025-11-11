
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Forward } from 'lucide-react';

export function AssessmentSummaryCard() {
  const recentAssessments = [
    { 
      id: '1', 
      permitTitle: 'Mining License Application', 
      applicant: 'TropicMining Ltd', 
      status: 'passed', 
      assessedBy: 'John Smith',
      date: '2024-01-22',
      forwardedToCompliance: true
    },
    { 
      id: '2', 
      permitTitle: 'Logging Permit Request', 
      applicant: 'Timber Solutions', 
      status: 'requires_clarification', 
      assessedBy: 'Sarah Jones',
      date: '2024-01-21',
      forwardedToCompliance: false
    },
    { 
      id: '3', 
      permitTitle: 'Environmental Impact Study', 
      applicant: 'Green Mining Co', 
      status: 'failed', 
      assessedBy: 'Mike Wilson',
      date: '2024-01-20',
      forwardedToCompliance: false
    },
    { 
      id: '4', 
      permitTitle: 'Marine Survey Permit', 
      applicant: 'Coastal Resources', 
      status: 'passed', 
      assessedBy: 'Lisa Brown',
      date: '2024-01-19',
      forwardedToCompliance: true
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'requires_clarification':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      requires_clarification: 'bg-orange-100 text-orange-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-forest-800">Recent Assessments</CardTitle>
        <CardDescription>Latest initial assessments completed by registry officers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAssessments.map((assessment) => (
            <div key={assessment.id} className="flex items-center justify-between p-3 bg-forest-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-forest-800">{assessment.permitTitle}</p>
                <p className="text-sm text-forest-600">{assessment.applicant}</p>
                <p className="text-xs text-forest-500">
                  Assessed by {assessment.assessedBy} on {assessment.date}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {getStatusIcon(assessment.status)}
                  <Badge className={getStatusColor(assessment.status)}>
                    {assessment.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                {assessment.forwardedToCompliance && (
                  <div className="flex items-center text-green-600">
                    <Forward className="w-4 h-4 mr-1" />
                    <span className="text-xs">Forwarded</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
