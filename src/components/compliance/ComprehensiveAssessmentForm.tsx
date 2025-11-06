import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAssessmentDetail } from './hooks/useAssessmentDetail';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Building,
  MapPin,
  Calendar,
  User,
  Save,
  Send
} from 'lucide-react';
import { ApplicationDetailView } from './ApplicationDetailView';
import { EnhancedComplianceAssessmentForm } from './EnhancedComplianceAssessmentForm';

interface AssessmentData {
  id: string;
  permit_application_id: string;
  assessed_by: string;
  assigned_by: string;
  assessment_status: string;
  assessment_notes: string | null;
  compliance_score: number | null;
  recommendations: string | null;
  violations_found: any;
  next_review_date: string | null;
  created_at: string;
  updated_at: string;
  permit_application?: {
    id: string;
    title: string;
    application_number: string | null;
    entity_name: string | null;
    entity_type: string | null;
    status: string;
    activity_classification: string;
    activity_level: string;
    permit_type: string;
    description: string | null;
    activity_location: string | null;
    coordinates: any;
    environmental_impact: string | null;
    mitigation_measures: string | null;
    compliance_checks: any;
    uploaded_files: any;
    application_date: string;
    user_id: string;
  };
  initial_assessment?: {
    id: string;
    assessment_status: string;
    assessment_notes: string;
    assessment_outcome: string;
    feedback_provided: string | null;
    assessed_by: string;
    created_at: string;
  };
}

interface AssessmentFormData {
  assessment_status: string;
  assessment_notes: string;
  compliance_score: number;
  recommendations: string;
  violations_found: string[];
  next_review_date: string;
  environmental_compliance: boolean;
  technical_compliance: boolean;
  legal_compliance: boolean;
  safety_compliance: boolean;
  waste_management_compliance: boolean;
  emission_compliance: boolean;
  water_quality_compliance: boolean;
  soil_protection_compliance: boolean;
  biodiversity_compliance: boolean;
  public_consultation_compliance: boolean;
}

interface ComprehensiveAssessmentFormProps {
  assessmentId: string;
  onComplete?: () => void;
}

export function ComprehensiveAssessmentForm({ assessmentId, onComplete }: ComprehensiveAssessmentFormProps) {
  // Redirect to enhanced version
  return <EnhancedComplianceAssessmentForm assessmentId={assessmentId} onComplete={onComplete} />;
}

function OriginalComprehensiveAssessmentForm({ assessmentId, onComplete }: ComprehensiveAssessmentFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { assessment: assessmentData, loading, error, updateAssessment } = useAssessmentDetail(assessmentId);
  const [saving, setSaving] = useState(false);
  const [customViolation, setCustomViolation] = useState('');

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<AssessmentFormData>({
    defaultValues: {
      assessment_status: 'in_progress',
      assessment_notes: '',
      compliance_score: 0,
      recommendations: '',
      violations_found: [],
      next_review_date: '',
      environmental_compliance: false,
      technical_compliance: false,
      legal_compliance: false,
      safety_compliance: false,
      waste_management_compliance: false,
      emission_compliance: false,
      water_quality_compliance: false,
      soil_protection_compliance: false,
      biodiversity_compliance: false,
      public_consultation_compliance: false,
    }
  });

  const watchedViolations = watch('violations_found') || [];
  const complianceChecks = [
    { key: 'environmental_compliance', label: 'Environmental Impact Assessment', icon: '🌍' },
    { key: 'technical_compliance', label: 'Technical Specifications', icon: '⚙️' },
    { key: 'legal_compliance', label: 'Legal & Regulatory Requirements', icon: '⚖️' },
    { key: 'safety_compliance', label: 'Health & Safety Standards', icon: '🦺' },
    { key: 'waste_management_compliance', label: 'Waste Management Plan', icon: '♻️' },
    { key: 'emission_compliance', label: 'Emission Controls', icon: '💨' },
    { key: 'water_quality_compliance', label: 'Water Quality Standards', icon: '💧' },
    { key: 'soil_protection_compliance', label: 'Soil Protection Measures', icon: '🌱' },
    { key: 'biodiversity_compliance', label: 'Biodiversity Conservation', icon: '🦋' },
    { key: 'public_consultation_compliance', label: 'Public Consultation', icon: '👥' },
  ];

  const commonViolations = [
    'Incomplete Environmental Impact Assessment',
    'Missing Technical Documentation',
    'Inadequate Waste Management Plan',
    'Insufficient Emission Control Measures',
    'Non-compliance with Water Quality Standards',
    'Lack of Public Consultation Evidence',
    'Missing Safety Protocols',
    'Inadequate Biodiversity Protection Measures',
    'Incomplete Financial Guarantees',
    'Non-compliance with Zoning Regulations'
  ];

  useEffect(() => {
    if (assessmentData) {
      // Pre-populate form with existing data
      reset({
        assessment_status: assessmentData.assessment_status || 'in_progress',
        assessment_notes: assessmentData.assessment_notes || '',
        compliance_score: assessmentData.compliance_score || 0,
        recommendations: assessmentData.recommendations || '',
        violations_found: Array.isArray(assessmentData.violations_found) 
          ? assessmentData.violations_found.map(v => String(v))
          : [],
        next_review_date: assessmentData.next_review_date ? assessmentData.next_review_date.split('T')[0] : '',
        environmental_compliance: false,
        technical_compliance: false,
        legal_compliance: false,
        safety_compliance: false,
        waste_management_compliance: false,
        emission_compliance: false,
        water_quality_compliance: false,
        soil_protection_compliance: false,
        biodiversity_compliance: false,
        public_consultation_compliance: false,
      });
    }
  }, [assessmentData, reset]);

  const addViolation = (violation: string) => {
    const currentViolations = watchedViolations;
    if (!currentViolations.includes(violation)) {
      setValue('violations_found', [...currentViolations, violation]);
    }
  };

  const removeViolation = (violation: string) => {
    const currentViolations = watchedViolations;
    setValue('violations_found', currentViolations.filter(v => v !== violation));
  };

  const addCustomViolation = () => {
    if (customViolation.trim() && !watchedViolations.includes(customViolation.trim())) {
      addViolation(customViolation.trim());
      setCustomViolation('');
    }
  };

  const calculateComplianceScore = () => {
    const totalChecks = complianceChecks.length;
    const passedChecks = complianceChecks.filter(check => 
      watch(check.key as keyof AssessmentFormData)
    ).length;
    
    const baseScore = (passedChecks / totalChecks) * 100;
    const violationPenalty = watchedViolations.length * 5; // 5 points per violation
    
    return Math.max(0, Math.round(baseScore - violationPenalty));
  };

  const onSubmit = async (data: AssessmentFormData, isSubmission = false) => {
    try {
      setSaving(true);
      
      const finalComplianceScore = calculateComplianceScore();
      
      const updateData = {
        assessment_status: isSubmission ? data.assessment_status : 'in_progress',
        assessment_notes: data.assessment_notes,
        compliance_score: finalComplianceScore,
        recommendations: data.recommendations,
        violations_found: data.violations_found,
        next_review_date: data.next_review_date || null,
      };

      const result = await updateAssessment(updateData);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: isSubmission ? "Assessment Submitted" : "Assessment Saved",
        description: isSubmission 
          ? "The compliance assessment has been submitted successfully."
          : "Assessment progress has been saved.",
      });

      if (isSubmission && onComplete) {
        onComplete();
      }

    } catch (error: any) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save assessment.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center items-center">
            <Clock className="w-6 h-6 mr-2 animate-spin" />
            Loading assessment data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !assessmentData) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-medium mb-2">Assessment Not Found</h3>
            <p className="text-muted-foreground">
              {error || "The requested assessment could not be found."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
      <div className="space-y-6">
        {/* Assessment Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-xl">
                    {assessmentData.permit_application?.title || 'Assessment Review'}
                  </CardTitle>
                  <CardDescription>
                    Application #{assessmentData.permit_application?.application_number} - {assessmentData.permit_application?.permit_type}
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-2">
                  Compliance Score: {calculateComplianceScore()}%
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Status: <span className="font-medium">{assessmentData.assessment_status}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Application Details */}
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Application Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="registry">Registry Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Application Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ApplicationDetailView 
                  application={assessmentData.permit_application}
                  initialAssessment={assessmentData.initial_assessment}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Uploaded Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessmentData.permit_application?.uploaded_files ? (
                  <div className="space-y-2">
                    {Array.isArray(assessmentData.permit_application.uploaded_files) && 
                     assessmentData.permit_application.uploaded_files.length > 0 ? (
                      assessmentData.permit_application.uploaded_files.map((file: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{file.name || `Document ${index + 1}`}</p>
                              <p className="text-xs text-muted-foreground">
                                {file.type || 'Unknown type'} • {file.size ? `${Math.round(file.size / 1024)}KB` : 'Unknown size'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No documents uploaded with this application
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No documents available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registry">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Registry Assessment & Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessmentData.initial_assessment ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {assessmentData.initial_assessment.assessment_status === 'passed' ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-warning" />
                        )}
                        <span className="font-medium">
                          Status: {assessmentData.initial_assessment.assessment_status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(assessmentData.initial_assessment.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <Label className="text-sm font-medium">Assessment Outcome</Label>
                        <p className="text-sm mt-1">{assessmentData.initial_assessment.assessment_outcome}</p>
                      </div>

                      <div className="p-3 bg-muted/50 rounded-lg">
                        <Label className="text-sm font-medium">Registry Assessment Notes</Label>
                        <p className="text-sm mt-1">{assessmentData.initial_assessment.assessment_notes}</p>
                      </div>

                      {assessmentData.initial_assessment.feedback_provided && (
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                          <Label className="text-sm font-medium text-blue-800">
                            Specific Requirements for Compliance Assessment
                          </Label>
                          <p className="text-sm mt-2 text-blue-700 leading-relaxed">
                            {assessmentData.initial_assessment.feedback_provided}
                          </p>
                          <div className="mt-3 text-xs text-blue-600">
                            💡 This feedback guides your technical assessment focus areas
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No registry assessment feedback available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Assessment Tabs */}
        <Tabs defaultValue="compliance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="compliance">Compliance Checks</TabsTrigger>
            <TabsTrigger value="violations">Violations & Issues</TabsTrigger>
            <TabsTrigger value="assessment">Assessment Notes</TabsTrigger>
            <TabsTrigger value="decision">Final Decision</TabsTrigger>
          </TabsList>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Verification</CardTitle>
                <CardDescription>
                  Review each compliance area and mark as compliant or non-compliant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {complianceChecks.map((check) => (
                    <div key={check.key} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={check.key}
                        {...register(check.key as keyof AssessmentFormData)}
                        onCheckedChange={(checked) => {
                          setValue(check.key as keyof AssessmentFormData, checked as boolean);
                        }}
                      />
                      <Label htmlFor={check.key} className="flex items-center gap-2 cursor-pointer">
                        <span>{check.icon}</span>
                        <span className="text-sm">{check.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="violations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Violations & Issues Identified</CardTitle>
                <CardDescription>
                  Select applicable violations or add custom issues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {commonViolations.map((violation) => (
                    <Button
                      key={violation}
                      type="button"
                      variant={watchedViolations.includes(violation) ? "default" : "outline"}
                      size="sm"
                      onClick={() => 
                        watchedViolations.includes(violation) 
                          ? removeViolation(violation)
                          : addViolation(violation)
                      }
                      className="justify-start text-left h-auto p-3"
                    >
                      {violation}
                    </Button>
                  ))}
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom violation or issue..."
                    value={customViolation}
                    onChange={(e) => setCustomViolation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomViolation()}
                  />
                  <Button type="button" onClick={addCustomViolation}>
                    Add
                  </Button>
                </div>

                {watchedViolations.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Selected Violations:</Label>
                    <div className="flex flex-wrap gap-2">
                      {watchedViolations.map((violation) => (
                        <Badge key={violation} variant="destructive" className="flex items-center gap-1">
                          {violation}
                          <button
                            type="button"
                            onClick={() => removeViolation(violation)}
                            className="ml-1 hover:bg-destructive-foreground/20 rounded-full p-0.5"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Notes & Recommendations</CardTitle>
                <CardDescription>
                  Provide detailed assessment notes and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="assessment_notes">Assessment Notes</Label>
                  <Textarea
                    id="assessment_notes"
                    {...register('assessment_notes', { required: 'Assessment notes are required' })}
                    placeholder="Provide detailed assessment notes, findings, and observations..."
                    rows={6}
                    className="mt-1"
                  />
                  {errors.assessment_notes && (
                    <p className="text-sm text-destructive mt-1">{errors.assessment_notes.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="recommendations">Recommendations</Label>
                  <Textarea
                    id="recommendations"
                    {...register('recommendations')}
                    placeholder="Provide recommendations for compliance, improvements, or additional requirements..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="next_review_date">Next Review Date (if applicable)</Label>
                  <Input
                    id="next_review_date"
                    type="date"
                    {...register('next_review_date')}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decision" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Final Assessment Decision</CardTitle>
                <CardDescription>
                  Make the final decision on this compliance assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="assessment_status">Assessment Status</Label>
                  <Select
                    value={watch('assessment_status')}
                    onValueChange={(value) => setValue('assessment_status', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select assessment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="passed">Passed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="requires_clarification">Requires Clarification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Calculated Compliance Score:</span>
                    <Badge variant={calculateComplianceScore() >= 70 ? "default" : "destructive"}>
                      {calculateComplianceScore()}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on compliance checks and identified violations
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    variant="outline"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Draft'}
                  </Button>
                  
                  <Button 
                    type="button"
                    onClick={handleSubmit((data) => onSubmit(data, true))}
                    disabled={saving || !watch('assessment_notes')}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {saving ? 'Submitting...' : 'Submit Assessment'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </form>
  );
}