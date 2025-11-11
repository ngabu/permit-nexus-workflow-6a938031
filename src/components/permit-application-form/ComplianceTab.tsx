import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, CheckCircle, AlertCircle, Activity, Clock, Download, Upload, Settings } from 'lucide-react';
import { usePermitTypeFields } from '@/hooks/usePermitTypeFields';
import { useDocumentRequirements } from '@/hooks/useDocumentRequirements';

interface ComplianceTabProps {
  formData: any;
  handleComplianceChange: (field: string, checked: boolean) => void;
  handleInputChange?: (field: string, value: any) => void;
  onNavigateToTab?: (tab: string) => void;
}

const ComplianceTab: React.FC<ComplianceTabProps> = ({ formData, handleComplianceChange, handleInputChange, onNavigateToTab }) => {
  // Fetch dynamic permit type fields for assessments
  const { fields: permitTypeFields, loading: fieldsLoading } = usePermitTypeFields(formData.permit_type_specific);
  
  // Fetch document requirements based on activity level and entity type
  const { 
    requirements: documentRequirements, 
    uploadStatuses,
    loading: docsLoading,
    updateUploadStatus 
  } = useDocumentRequirements(
    formData.entity_type,
    formData.activity_level,
    formData.prescribed_activity_id
  );

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
      'manufacturing': 'Level 2',
      'energy': 'Level 3',
      'waste_management': 'Level 2',
      'construction': 'Level 2',
      'tourism': 'Level 1',
      'agriculture': 'Level 1',
      'forestry': 'Level 2',
      'aquaculture': 'Level 2',
      'other': 'Level 1'
    };
    return levelMap[classification] || 'Level 1';
  };

  // Get permit type based on activity level for fee calculation
  const getPermitTypeFromLevel = (level: string) => {
    const typeMap = {
      'Level 1': 'Level 1',
      'Level 2': 'Level 2', 
      'Level 3': 'Level 3'
    };
    return typeMap[level] || 'Level 1';
  };

  // Function to get level description
  const getLevelDescription = (level: string) => {
    const descriptions = {
      'Level 1': 'Simple activities with minimal environmental impact',
      'Level 2': 'Moderate to complex activities requiring environmental assessment and review',
      'Level 3': 'High-impact activities requiring comprehensive EIA'
    };
    return descriptions[level] || '';
  };

  // Function to get level color
  const getLevelColor = (level: string) => {
    const colors = {
      'Level 1': 'bg-green-100 text-green-800',
      'Level 2': 'bg-yellow-100 text-yellow-800',
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

  const handleFieldChange = (fieldName: string, value: any) => {
    if (handleInputChange) {
      handleInputChange(`assessment_${fieldName}`, value);
    }
  };

  const renderDynamicField = (field: any) => {
    const fieldValue = formData[`assessment_${field.field_name}`] || '';

    switch (field.field_type) {
      case 'text':
      case 'number':
      case 'email':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_mandatory && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.field_name}
              type={field.field_type}
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
              placeholder={field.placeholder || ''}
              required={field.is_mandatory}
            />
            {field.help_text && (
              <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_mandatory && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={field.field_name}
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
              placeholder={field.placeholder || ''}
              required={field.is_mandatory}
              rows={4}
            />
            {field.help_text && (
              <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}
          </div>
        );

      case 'select':
      case 'dropdown':
        const options = field.field_options?.options || [];
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_mandatory && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={fieldValue}
              onValueChange={(value) => handleFieldChange(field.field_name, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.help_text && (
              <p className="text-sm text-muted-foreground">{field.help_text}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-start space-x-3 p-3 border rounded-lg">
            <Checkbox
              id={field.field_name}
              checked={!!fieldValue}
              onCheckedChange={(checked) => handleFieldChange(field.field_name, checked)}
            />
            <div className="flex-1">
              <Label htmlFor={field.field_name} className="cursor-pointer font-medium">
                {field.field_label}
                {field.is_mandatory && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.help_text && (
                <p className="text-sm text-muted-foreground mt-1">{field.help_text}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Check prerequisites completion
  const hasEntity = !!formData.entity_type;
  const hasPermitType = !!formData.permit_category && !!formData.permit_type_specific;
  const hasActivityLevel = !!formData.activity_level;
  const allPrerequisitesMet = hasEntity && hasPermitType && hasActivityLevel;

  return (
    <div className="space-y-6">
      {/* Prerequisite Summary Card */}
      {allPrerequisitesMet && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="w-5 h-5 text-primary" />
              Prerequisites Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Entity Type</p>
                <Badge variant="secondary" className="text-sm">
                  {formData.entity_type?.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Permit Information</p>
                <div className="flex flex-col gap-1">
                  <Badge variant="secondary" className="text-sm w-fit">
                    {formData.permit_category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formData.permit_type_specific}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Activity Classification</p>
                <Badge variant="secondary" className="text-sm">
                  {formData.activity_level}
                </Badge>
                {formData.activity_description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {formData.activity_description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prerequisite Check Messages with Navigation */}
      {!hasEntity && (
        <Card className="border-amber-500 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800">Entity Selection Required</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Please select an entity in the Project tab before viewing compliance requirements.
                  </p>
                </div>
              </div>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('project')}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  Go to Project
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {!hasPermitType && (
        <Card className="border-amber-500 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800">Permit Type Selection Required</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Please select a permit category and type in the Permit Details tab to view assessment fields.
                  </p>
                </div>
              </div>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('permitspecific')}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  Go to Permit Details
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {!hasActivityLevel && (
        <Card className="border-amber-500 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800">Activity Classification Required</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Please complete the Classification tab to view document requirements.
                  </p>
                </div>
              </div>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('classification')}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  Go to Classification
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamic Assessment Fields based on Permit Type */}
      {formData.permit_category && formData.permit_type_specific && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Permit Assessment Fields
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Category: <span className="font-medium">{formData.permit_category}</span> | 
              Type: <span className="font-medium">{formData.permit_type_specific}</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {fieldsLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading assessment fields...
              </div>
            ) : permitTypeFields.length > 0 ? (
              <div className="space-y-4">
                {permitTypeFields.map(field => renderDynamicField(field))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No specific assessment fields configured for this permit type.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Document Requirements Checklist based on Activity Level */}
      {formData.activity_level && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Required Documents
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Based on Activity Level: <Badge variant="outline">{formData.activity_level}</Badge>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {docsLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading document requirements...
              </div>
            ) : documentRequirements.length > 0 ? (
              <div className="space-y-3">
                {documentRequirements.map((doc) => {
                  const uploadStatus = uploadStatuses.find(s => s.requirement_id === doc.id);
                  return (
                    <div key={doc.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Checkbox
                        id={`doc-${doc.id}`}
                        checked={uploadStatus?.uploaded || false}
                        onCheckedChange={(checked) => updateUploadStatus(doc.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label 
                            htmlFor={`doc-${doc.id}`} 
                            className="font-medium cursor-pointer"
                          >
                            {doc.name}
                          </Label>
                          {doc.is_mandatory && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                          {doc.template_path && (
                            <button className="text-xs text-primary flex items-center gap-1 hover:underline">
                              <Download className="w-3 h-3" />
                              Template
                            </button>
                          )}
                        </div>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {doc.description}
                          </p>
                        )}
                        {uploadStatus?.file_name && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Uploaded: {uploadStatus.file_name}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">
                      {uploadStatuses.filter(s => s.uploaded).length} of {documentRequirements.length}
                    </span>
                    {' '}documents verified
                    {documentRequirements.some(d => d.is_mandatory) && (
                      <span className="text-muted-foreground ml-2">
                        ({documentRequirements.filter(d => d.is_mandatory).length} required)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No specific document requirements for this activity level.
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
