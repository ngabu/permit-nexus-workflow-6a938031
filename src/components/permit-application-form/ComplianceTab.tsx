import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, AlertCircle, Activity, Clock } from 'lucide-react';

interface ComplianceTabProps {
  formData: any;
  handleComplianceChange: (field: string, checked: boolean) => void;
}

const ComplianceTab: React.FC<ComplianceTabProps> = ({ formData, handleComplianceChange }) => {
  const complianceItems = [
    {
      id: 'environmentalAssessment',
      label: 'Environmental Assessment Completed',
      description: 'I confirm that an environmental assessment has been conducted for this project.',
      required: true
    },
    {
      id: 'publicConsultation',
      label: 'Public Consultation Undertaken',
      description: 'I confirm that public consultation has been carried out as required.',
      required: true
    },
    {
      id: 'technicalReview',
      label: 'Technical Review Completed',
      description: 'I confirm that all technical aspects have been reviewed by qualified professionals.',
      required: true
    },
    {
      id: 'legalCompliance',
      label: 'Legal Compliance Verified',
      description: 'I confirm that this project complies with all applicable laws and regulations.',
      required: true
    }
  ];

  const allRequiredCompleted = complianceItems
    .filter(item => item.required)
    .every(item => formData.complianceChecks[item.id]);

  // Function to determine activity level based on classification
  const getActivityLevel = (classification: string) => {
    const levelMap = {
      'mining': 'Level 3',
      'manufacturing': 'Level 2B',
      'energy': 'Level 3',
      'waste_management': 'Level 2A',
      'construction': 'Level 2A',
      'tourism': 'Level 1',
      'agriculture': 'Level 1',
      'forestry': 'Level 2A',
      'aquaculture': 'Level 2A',
      'other': 'Level 1'
    };
    return levelMap[classification] || 'Level 1';
  };

  // Get permit type based on activity level for fee calculation
  const getPermitTypeFromLevel = (level: string) => {
    const typeMap = {
      'Level 1': 'Level 1',
      'Level 2A': 'Level 2A', 
      'Level 2B': 'Level 2B',
      'Level 3': 'Level 3'
    };
    return typeMap[level] || 'Level 1';
  };

  // Function to get level description
  const getLevelDescription = (level: string) => {
    const descriptions = {
      'Level 1': 'Simple activities with minimal environmental impact',
      'Level 2A': 'Moderate activities requiring standard assessment',
      'Level 2B': 'Complex activities requiring detailed assessment',
      'Level 3': 'High-impact activities requiring comprehensive EIA'
    };
    return descriptions[level] || '';
  };

  // Function to get level color
  const getLevelColor = (level: string) => {
    const colors = {
      'Level 1': 'bg-green-100 text-green-800',
      'Level 2A': 'bg-yellow-100 text-yellow-800',
      'Level 2B': 'bg-orange-100 text-orange-800',
      'Level 3': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const activityLevel = useMemo(() => {
    return formData.prescribedActivity ? getActivityLevel(formData.prescribedActivity) : null;
  }, [formData.prescribedActivity]);

  const permitType = useMemo(() => {
    return activityLevel ? getPermitTypeFromLevel(activityLevel) : null;
  }, [activityLevel]);

  return (
    <div className="space-y-6">
      {/* Activity Level Assessment */}
      {formData.prescribedActivity && (
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
                  <h4 className="font-medium">Assessed Activity Classification</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {formData.prescribedActivity.replace('_', ' ')}
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
                {activityLevel === 'Level 2A' && (
                  <>
                    <li>• Environmental impact assessment</li>
                    <li>• Public consultation requirements</li>
                    <li>• Technical review and analysis</li>
                    <li>• Estimated processing: 60-90 days</li>
                  </>
                )}
                {activityLevel === 'Level 2B' && (
                  <>
                    <li>• Detailed environmental impact assessment</li>
                    <li>• Extended public consultation</li>
                    <li>• Comprehensive technical review</li>
                    <li>• Specialist assessments may be required</li>
                    <li>• Estimated processing: 90-120 days</li>
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
      )}


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Compliance Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Important Notice</h4>
                <p className="text-sm text-amber-700 mt-1">
                  All compliance items must be completed before submitting your application. 
                  Providing false information may result in rejection of your application.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {complianceItems.map((item) => (
              <div key={item.id} className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                <Checkbox
                  id={item.id}
                  checked={formData.complianceChecks[item.id] || false}
                  onCheckedChange={(checked) => handleComplianceChange(item.id, checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label 
                    htmlFor={item.id} 
                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    {item.label}
                    {item.required && <span className="text-destructive">*</span>}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            allRequiredCompleted 
              ? 'bg-green-50 border-green-200' 
              : 'bg-muted/30 border-border'
          }`}>
            <CheckCircle className={`w-5 h-5 ${
              allRequiredCompleted ? 'text-green-600' : 'text-muted-foreground'
            }`} />
            <div>
              <p className={`font-medium ${
                allRequiredCompleted ? 'text-green-800' : 'text-muted-foreground'
              }`}>
                {allRequiredCompleted 
                  ? 'All compliance requirements completed' 
                  : 'Complete all compliance requirements to proceed'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {complianceItems.filter(item => formData.complianceChecks[item.id]).length} of {complianceItems.length} items completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceTab;
