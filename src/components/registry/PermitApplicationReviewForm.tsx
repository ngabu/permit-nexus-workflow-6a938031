import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInitialAssessments } from './hooks/useInitialAssessments';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { RegistryActivityClassificationForm } from './RegistryActivityClassificationForm';
import { RegistryFeeCalculationForm } from './RegistryFeeCalculationForm';
import { EntityDetailsReadOnly } from '@/components/public/EntityDetailsReadOnly';
import { ComprehensiveProjectDetailsReadOnly } from './read-only/ComprehensiveProjectDetailsReadOnly';
import { LocationReadOnly } from './read-only/LocationReadOnly';
import { DocumentsReadOnly } from './read-only/DocumentsReadOnly';
import { ComplianceReadOnly } from './read-only/ComplianceReadOnly';
import { ComprehensivePermitDetailsReadOnly } from './read-only/ComprehensivePermitDetailsReadOnly';
import { createUserNotification } from '@/services/userNotificationsService';
import { 
  ArrowLeft,
  Save,
  FileText,
  Send,
  User,
  Activity,
  Building,
  MapPin,
  Users,
  Settings,
  Upload,
  DollarSign,
  CheckCircle2,
  FileCheck,
  History
} from 'lucide-react';
import { RegistryAuditTrail } from './RegistryAuditTrail';

// Assessment status mapping for better UX
const ASSESSMENT_STATUS_OPTIONS = {
  'pending': 'Pending',
  'passed': 'Pass - Ready for Technical Assessment', 
  'failed': 'Fail - Rejected',
  'requires_clarification': 'Requires Clarification from Applicant'
} as const;

const STATUS_DISPLAY_TO_VALUE = Object.entries(ASSESSMENT_STATUS_OPTIONS).reduce((acc, [value, display]) => {
  acc[display] = value as keyof typeof ASSESSMENT_STATUS_OPTIONS;
  return acc;
}, {} as Record<string, keyof typeof ASSESSMENT_STATUS_OPTIONS>);

interface PermitApplicationReviewFormProps {
  assessmentId?: string;
}

export function PermitApplicationReviewForm({ assessmentId: propAssessmentId }: PermitApplicationReviewFormProps) {
  const { id: paramAssessmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const { assessments, updateInitialAssessment, loading: assessmentLoading } = useInitialAssessments();
  
  const [application, setApplication] = useState<any>(null);
  const [entityDetails, setEntityDetails] = useState<any>(null);
  const [appLoading, setAppLoading] = useState(true);
  
  // Use prop assessment ID first, then param
  const assessmentId = propAssessmentId || paramAssessmentId;

  useEffect(() => {
    const fetchApplication = async () => {
      if (!assessmentId) {
        console.error('No assessment ID provided');
        setApplication(null);
        setAppLoading(false);
        return;
      }

      try {
        console.log('Fetching assessment and application for ID:', assessmentId);
        
        // Fetch the assessment to get the permit application ID
        const { data: assessment, error: assessmentError } = await supabase
          .from('initial_assessments')
          .select('permit_application_id')
          .eq('id', assessmentId)
          .single();
        
        if (assessmentError) throw assessmentError;
        
        if (!assessment?.permit_application_id) {
          throw new Error('Assessment has no linked permit application');
        }

        console.log('Found permit application ID:', assessment.permit_application_id);

        // Fetch the full permit application details
        const { data, error } = await supabase
          .from('permit_applications')
          .select('*')
          .eq('id', assessment.permit_application_id)
          .single();
          
        if (error) throw error;
        
        console.log('Successfully loaded application:', data?.title);
        setApplication(data);

        // Fetch entity details if entity_id exists
        if (data?.entity_id) {
          const { data: entityData, error: entityError } = await supabase
            .from('entities')
            .select('*')
            .eq('id', data.entity_id)
            .maybeSingle();
          
          if (!entityError && entityData) {
            setEntityDetails(entityData);
          }
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        toast({
          title: "Error Loading Application",
          description: "Failed to load the permit application details.",
          variant: "destructive",
        });
        setApplication(null);
      } finally {
        setAppLoading(false);
      }
    };
    
    fetchApplication();
  }, [assessmentId]);
  
  const [assessmentData, setAssessmentData] = useState({
    assessment_status: '' as 'pending' | 'passed' | 'failed' | 'requires_clarification' | '',
    assessment_notes: '',
    feedback_provided: '',
    assessment_outcome: ''
  });

  const assessment = assessments.find(a => a.id === assessmentId);
  const isManager = profile?.staff_position && ['manager', 'director', 'managing_director'].includes(profile.staff_position);

  // Load existing assessment data into form when assessment is found
  useEffect(() => {
    if (assessment) {
      setAssessmentData({
        assessment_status: assessment.assessment_status || '',
        assessment_notes: assessment.assessment_notes || '',
        feedback_provided: assessment.feedback_provided || '',
        assessment_outcome: assessment.assessment_outcome || ''
      });
    }
  }, [assessment]);

  const handleSubmitAssessment = async () => {
    if (!assessment || !application) return;

    if (!assessmentData.assessment_status || !assessmentData.assessment_notes || !assessmentData.assessment_outcome) {
      toast({
        title: "Missing Information",
        description: "Please provide assessment status, outcome, and notes.",
        variant: "destructive",
      });
      return;
    }

    const result = await updateInitialAssessment(assessment.id, {
      assessment_status: assessmentData.assessment_status as 'pending' | 'passed' | 'failed' | 'requires_clarification',
      assessment_notes: assessmentData.assessment_notes,
      feedback_provided: assessmentData.feedback_provided,
      assessment_outcome: assessmentData.assessment_outcome,
      assessment_date: new Date().toISOString()
    });

    if (result.success) {
      // Create additional user notification for direct feedback
      try {
        let notificationTitle = '';
        let notificationMessage = '';
        let notificationType = '';

        switch (assessmentData.assessment_status) {
          case 'passed':
            notificationTitle = 'Registry Assessment Passed';
            notificationMessage = `Your application "${application.title}" has successfully passed the initial registry assessment by ${profile?.first_name} ${profile?.last_name}. It is now proceeding to technical review.`;
            notificationType = 'success';
            break;
          case 'failed':
            notificationTitle = 'Registry Assessment Failed';
            notificationMessage = `Your application "${application.title}" did not pass the initial registry assessment. Reason: ${assessmentData.assessment_notes}. ${assessmentData.feedback_provided ? 'Additional feedback: ' + assessmentData.feedback_provided : ''}`;
            notificationType = 'error';
            break;
          case 'requires_clarification':
            notificationTitle = 'Application Requires Clarification';
            notificationMessage = `Your application "${application.title}" requires additional information before it can proceed. Please review the feedback: ${assessmentData.feedback_provided || assessmentData.assessment_notes}`;
            notificationType = 'warning';
            break;
        }

        if (notificationTitle && application.user_id) {
          await createUserNotification(
            application.user_id,
            notificationTitle,
            notificationMessage,
            notificationType,
            application.id
          );
        }
      } catch (notificationError) {
        console.error('Failed to create user notification:', notificationError);
        // Don't block the main process if notification fails
      }

      toast({
        title: "Assessment Updated",
        description: "The assessment has been successfully updated and the applicant has been notified.",
      });
      navigate('/RegistryDashboard');
    } else {
      toast({
        title: "Update Failed",
        description: "There was an error updating the assessment.",
        variant: "destructive",
      });
    }
  };

  if (appLoading || assessmentLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading application details...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Application Not Found</h3>
            <p className="text-muted-foreground">The requested application could not be found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/RegistryDashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registry
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{application.title}</h1>
            <p className="text-muted-foreground">
              Application #{application.application_number}
            </p>
          </div>
        </div>
        <Badge variant={application.status === 'submitted' ? 'default' : 'secondary'}>
          {application.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Registry Assessment Forms */}
        <div className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5 md:grid-cols-11 bg-muted/50 h-auto p-1">
              <TabsTrigger value="basic" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Basic Info</span>
                <span className="sm:hidden">Basic</span>
              </TabsTrigger>
              <TabsTrigger value="classification" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Classification</span>
                <span className="sm:hidden">Class</span>
              </TabsTrigger>
              <TabsTrigger value="project" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
                <Building className="w-4 h-4" />
                <span className="hidden sm:inline">Project</span>
                <span className="sm:hidden">Project</span>
              </TabsTrigger>
              <TabsTrigger value="location" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Location</span>
                <span className="sm:hidden">Location</span>
              </TabsTrigger>
              <TabsTrigger value="consultation" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Consultation</span>
                <span className="sm:hidden">Consult</span>
              </TabsTrigger>
              <TabsTrigger value="specific" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Specific</span>
                <span className="sm:hidden">Specific</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Documents</span>
                <span className="sm:hidden">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="fees" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Fees</span>
                <span className="sm:hidden">Fees</span>
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Compliance</span>
                <span className="sm:hidden">Comply</span>
              </TabsTrigger>
              <TabsTrigger value="assessment" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
                <FileCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Assessment</span>
                <span className="sm:hidden">Review</span>
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex flex-col items-center gap-1 text-xs h-auto py-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Audit Trail</span>
                <span className="sm:hidden">Audit</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              {entityDetails ? (
                <EntityDetailsReadOnly entity={entityDetails} />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No entity details available
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="classification">
              <RegistryActivityClassificationForm 
                data={application} 
                onChange={async (updates) => {
                  try {
                    const { error } = await supabase
                      .from('permit_applications')
                      .update(updates)
                      .eq('id', application.id);
                    
                    if (error) throw error;
                    setApplication({ ...application, ...updates });
                    toast({ title: "Classification Updated" });
                  } catch (error) {
                    console.error('Error updating classification:', error);
                    toast({ title: "Update Failed", variant: "destructive" });
                  }
                }}
              />
            </TabsContent>
            
            <TabsContent value="project">
              <ComprehensiveProjectDetailsReadOnly application={application} />
            </TabsContent>
            
            <TabsContent value="location">
              <LocationReadOnly permit={application as any} />
            </TabsContent>
            
            <TabsContent value="consultation">
              <Card>
                <CardHeader>
                  <CardTitle>Public Consultation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {application.public_consultation_proof && application.public_consultation_proof.length > 0 ? (
                      <div>
                        <Label>Consultation Proof Documents</Label>
                        <div className="text-sm text-muted-foreground">
                          {application.public_consultation_proof.length} documents uploaded
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No consultation documents provided</p>
                    )}
                    {application.consultation_period_start && (
                      <div>
                        <Label>Consultation Period</Label>
                        <p className="text-sm">
                          {new Date(application.consultation_period_start).toLocaleDateString()} - {application.consultation_period_end ? new Date(application.consultation_period_end).toLocaleDateString() : 'Ongoing'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specific">
              <ComprehensivePermitDetailsReadOnly application={application} />
            </TabsContent>
            
            <TabsContent value="documents">
              <DocumentsReadOnly permit={application as any} />
            </TabsContent>
            
            <TabsContent value="fees">
              <RegistryFeeCalculationForm 
                data={application} 
                onChange={async (updates) => {
                  try {
                    const { error } = await supabase
                      .from('permit_applications')
                      .update(updates)
                      .eq('id', application.id);
                    
                    if (error) throw error;
                    setApplication({ ...application, ...updates });
                    toast({ title: "Fees Updated" });
                  } catch (error) {
                    console.error('Error updating fees:', error);
                    toast({ title: "Update Failed", variant: "destructive" });
                  }
                }}
              />
            </TabsContent>
            
            <TabsContent value="compliance">
              <ComplianceReadOnly permit={application as any} />
            </TabsContent>
            
            <TabsContent value="assessment">
              {assessment ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Previous Assessment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Current Status</Label>
                        <Badge className="ml-2">
                          {ASSESSMENT_STATUS_OPTIONS[assessment.assessment_status as keyof typeof ASSESSMENT_STATUS_OPTIONS] || assessment.assessment_status}
                        </Badge>
                      </div>
                      {assessment.assessment_notes && (
                        <div>
                          <Label>Assessment Notes</Label>
                          <p className="text-sm mt-1 p-3 bg-muted rounded-md">{assessment.assessment_notes}</p>
                        </div>
                      )}
                      {assessment.feedback_provided && (
                        <div>
                          <Label>Feedback Provided to Applicant</Label>
                          <p className="text-sm mt-1 p-3 bg-muted rounded-md">{assessment.feedback_provided}</p>
                        </div>
                      )}
                      {assessment.assessment_outcome && (
                        <div>
                          <Label>Assessment Outcome</Label>
                          <p className="text-sm mt-1">{assessment.assessment_outcome}</p>
                        </div>
                      )}
                      {assessment.assessment_date && (
                        <div>
                          <Label>Assessment Date</Label>
                          <p className="text-sm mt-1">{new Date(assessment.assessment_date).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No assessment history available
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="audit">
              {application && (
                <RegistryAuditTrail permitApplicationId={application.id} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Registry Assessment Section - Always visible below the application form */}
      <Separator className="my-8" />
      
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center text-xl">
            <FileCheck className="w-6 h-6 mr-2" />
            Registry Review & Feedback
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Provide your professional assessment and feedback for this permit application
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {assessment ? (
            <>
              {/* Validation Checklist */}
              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Application Validation Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Document Completeness</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Supporting documents uploaded</span>
                        <Badge variant={application.uploaded_files && application.uploaded_files.length > 0 ? "default" : "destructive"}>
                          {application.uploaded_files && application.uploaded_files.length > 0 ? "✓ Yes" : "✗ No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Mandatory fields complete</span>
                        <Badge variant={application.mandatory_fields_complete ? "default" : "destructive"}>
                          {application.mandatory_fields_complete ? "✓ Yes" : "✗ No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Legal declarations accepted</span>
                        <Badge variant={application.legal_declaration_accepted ? "default" : "destructive"}>
                          {application.legal_declaration_accepted ? "✓ Yes" : "✗ No"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Technical Requirements</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Environmental impact assessment</span>
                        <Badge variant={application.environmental_impact ? "default" : "secondary"}>
                          {application.environmental_impact ? "Provided" : "Not Provided"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Activity classification</span>
                        <Badge variant={application.activity_classification ? "default" : "secondary"}>
                          {application.activity_classification || "Not Specified"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Estimated project cost</span>
                        <Badge variant={application.estimated_cost_kina ? "default" : "secondary"}>
                          {application.estimated_cost_kina ? `K${application.estimated_cost_kina.toLocaleString()}` : "Not Provided"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="assessment_status" className="text-base font-semibold">Assessment Decision *</Label>
                <Select
                  value={assessmentData.assessment_status}
                  onValueChange={(value) => {
                    setAssessmentData({ 
                      ...assessmentData, 
                      assessment_status: value as any,
                      assessment_outcome: value === 'passed' ? 'Approved for Next Stage' : 
                                        value === 'failed' ? 'Rejected' : 
                                        value === 'requires_clarification' ? 'Needs More Information' : ''
                    });
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your assessment decision..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ASSESSMENT_STATUS_OPTIONS).map(([value, display]) => (
                      <SelectItem key={value} value={value}>
                        {display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This determines the next step in the application workflow
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessment_outcome" className="text-base font-semibold">Assessment Outcome *</Label>
                <Select
                  value={assessmentData.assessment_outcome}
                  onValueChange={(value) => setAssessmentData({ ...assessmentData, assessment_outcome: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select outcome..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Approved for Next Stage">Approved for Next Stage (Technical Assessment)</SelectItem>
                    <SelectItem value="Rejected">Rejected - Does Not Meet Requirements</SelectItem>
                    <SelectItem value="Needs More Information">Needs More Information</SelectItem>
                    <SelectItem value="Pending Review">Pending Further Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessment_notes" className="text-base font-semibold">Internal Assessment Notes *</Label>
                <Textarea
                  id="assessment_notes"
                  placeholder="Enter detailed assessment notes, observations, compliance checks, and reasoning for your decision..."
                  value={assessmentData.assessment_notes}
                  onChange={(e) => setAssessmentData({ ...assessmentData, assessment_notes: e.target.value })}
                  className="min-h-32 resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  ℹ️ These notes are for internal record keeping and will NOT be shared with the applicant
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback_provided" className="text-base font-semibold">Feedback to Applicant</Label>
                <Textarea
                  id="feedback_provided"
                  placeholder="Enter professional feedback that will be shared with the applicant regarding their application..."
                  value={assessmentData.feedback_provided}
                  onChange={(e) => setAssessmentData({ ...assessmentData, feedback_provided: e.target.value })}
                  className="min-h-28 resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  📧 This feedback will be included in the notification sent to the applicant
                </p>
              </div>

              <Separator />

              <div className="flex gap-3 justify-end pt-2">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/RegistryDashboard')}
                  size="lg"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitAssessment}
                  className="gap-2"
                  size="lg"
                  disabled={!assessmentData.assessment_status || !assessmentData.assessment_notes || !assessmentData.assessment_outcome}
                >
                  <Send className="w-4 h-4" />
                  Submit Assessment & Notify Applicant
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No assessment record found for this application</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}