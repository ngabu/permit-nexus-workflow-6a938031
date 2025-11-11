import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, XCircle, AlertCircle, Activity, Clock, Calculator } from 'lucide-react';
import { PermitForAssessment } from '../types';

interface ComplianceReadOnlyProps {
  permit: PermitForAssessment;
}

export function ComplianceReadOnly({ permit }: ComplianceReadOnlyProps) {
  // Mock compliance data - in real implementation, fetch from permit application details
  const complianceChecks = {
    environmentalAssessment: true,
    publicConsultation: false,
    technicalReview: true,
    legalCompliance: true
  };

  const complianceItems = [
    {
      id: 'environmentalAssessment',
      label: 'Environmental Assessment Completed',
      description: 'Environmental assessment has been conducted for this project.',
      required: true,
      status: complianceChecks.environmentalAssessment
    },
    {
      id: 'publicConsultation',
      label: 'Public Consultation Undertaken',
      description: 'Public consultation has been carried out as required.',
      required: true,
      status: complianceChecks.publicConsultation
    },
    {
      id: 'technicalReview',
      label: 'Technical Review Completed',
      description: 'All technical aspects have been reviewed by qualified professionals.',
      required: true,
      status: complianceChecks.technicalReview
    },
    {
      id: 'legalCompliance',
      label: 'Legal Compliance Verified',
      description: 'This project complies with all applicable laws and regulations.',
      required: true,
      status: complianceChecks.legalCompliance
    }
  ];

  // Determine activity level based on permit type
  const getActivityLevel = (permitType: string) => {
    const levelMap = {
      'Level 1': 'Level 1',
      'Level 2': 'Level 2',
      'Level 3': 'Level 3'
    };
    return levelMap[permitType] || 'Level 1';
  };

  const getLevelDescription = (level: string) => {
    const descriptions = {
      'Level 1': 'Simple activities with minimal environmental impact',
      'Level 2': 'Moderate to complex activities requiring environmental assessment and review',
      'Level 3': 'High-impact activities requiring comprehensive EIA'
    };
    return descriptions[level] || '';
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'Level 1': 'bg-green-100 text-green-800',
      'Level 2': 'bg-yellow-100 text-yellow-800',
      'Level 3': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const activityLevel = getActivityLevel(permit.permit_type);
  const completedItems = complianceItems.filter(item => item.status).length;
  const totalItems = complianceItems.length;
  const completionPercentage = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="space-y-6">
      {/* Activity Level Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Activity Level Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium">Assessed Activity Level</h4>
                <p className="text-sm text-muted-foreground">
                  Based on permit type: {permit.permit_type}
                </p>
              </div>
              <Badge className={getLevelColor(activityLevel)}>
                {activityLevel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {getLevelDescription(activityLevel)}
            </p>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Assessment Requirements:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {activityLevel === 'Level 1' && (
                <>
                  <li>• Basic environmental screening</li>
                  <li>• Standard compliance documentation</li>
                  <li>• Estimated processing: 30-45 days</li>
                </>
              )}
              {activityLevel === 'Level 2' && (
                <>
                  <li>• Environmental impact assessment</li>
                  <li>• Public consultation requirements</li>
                  <li>• Technical review and analysis</li>
                  <li>• Estimated processing: 60-120 days</li>
                </>
              )}
              {activityLevel === 'Level 3' && (
                <>
                  <li>• Full Environmental Impact Statement (EIS)</li>
                  <li>• Extensive public consultation process</li>
                  <li>• Multiple specialist assessments</li>
                  <li>• Independent technical review</li>
                  <li>• Estimated processing: 120-180 days</li>
                </>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Compliance Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium">Overall Compliance</h4>
              <p className="text-sm text-muted-foreground">
                {completedItems} of {totalItems} requirements completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>

          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Compliance Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Compliance Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {complianceItems.map((item) => (
            <div key={item.id} className="flex items-start space-x-3 p-4 border rounded-lg">
              <div className="mt-0.5">
                {item.status ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{item.label}</span>
                  {item.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                  <Badge variant={item.status ? 'default' : 'secondary'} className="text-xs">
                    {item.status ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Assessment Summary */}
      {permit.assessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Registry Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Assessment Status:</span>
              <Badge className={
                permit.assessment.assessment_status === 'passed' ? 'bg-green-100 text-green-800' :
                permit.assessment.assessment_status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }>
                {permit.assessment.assessment_status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Assessment Notes</label>
              <p className="mt-1 p-3 bg-muted rounded-lg">
                {permit.assessment.assessment_notes || 'No notes provided'}
              </p>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <Clock className="w-4 h-4 inline mr-1" />
              Assessed on: {new Date(permit.assessment.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}