import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createUserNotification } from '@/services/userNotificationsService';
import {
  FileText,
  MapPin,
  Upload,
  Shield,
  Calculator,
  ArrowLeft,
  Save,
  Send,
  Building,
  User,
  CheckCircle,
  Clock
} from 'lucide-react';

interface RegistryPermitReviewTabsProps {
  assessmentId: string;
}

const ASSESSMENT_STATUS_OPTIONS = {
  'pending': 'Pending Review',
  'passed': 'Pass - Ready for Technical Assessment',
  'failed': 'Fail - Rejected',
  'requires_clarification': 'Requires Clarification from Applicant'
} as const;

export function RegistryPermitReviewTabs({ assessmentId }: RegistryPermitReviewTabsProps) {
  const { toast } = useToast();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [entityDetails, setEntityDetails] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [assessmentData, setAssessmentData] = useState({
    assessment_status: '' as keyof typeof ASSESSMENT_STATUS_OPTIONS | '',
    assessment_notes: '',
    feedback_provided: '',
    assessment_outcome: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assessment
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('initial_assessments')
          .select('*')
          .eq('id', assessmentId)
          .single();

        if (assessmentError) throw assessmentError;
        setAssessment(assessmentData);

        // Load existing assessment data
        if (assessmentData) {
          setAssessmentData({
            assessment_status: (assessmentData.assessment_status as keyof typeof ASSESSMENT_STATUS_OPTIONS) || '',
            assessment_notes: assessmentData.assessment_notes || '',
            feedback_provided: assessmentData.feedback_provided || '',
            assessment_outcome: assessmentData.assessment_outcome || ''
          });
        }

        // Fetch permit application
        const { data: appData, error: appError } = await supabase
          .from('permit_applications')
          .select('*')
          .eq('id', assessmentData.permit_application_id)
          .single();

        if (appError) throw appError;
        setApplication(appData);

        // Fetch entity details
        if (appData.entity_id) {
          const { data: entityData, error: entityError } = await supabase
            .from('entities')
            .select('*')
            .eq('id', appData.entity_id)
            .maybeSingle();

          if (!entityError && entityData) {
            setEntityDetails(entityData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error Loading Data",
          description: "Failed to load permit application details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assessmentId]);

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

    try {
      const { error } = await supabase
        .from('initial_assessments')
        .update({
          assessment_status: assessmentData.assessment_status,
          assessment_notes: assessmentData.assessment_notes,
          feedback_provided: assessmentData.feedback_provided,
          assessment_outcome: assessmentData.assessment_outcome,
          assessment_date: new Date().toISOString()
        })
        .eq('id', assessmentId);

      if (error) throw error;

      // Create user notification
      let notificationTitle = '';
      let notificationMessage = '';
      let notificationType = '';

      switch (assessmentData.assessment_status) {
        case 'passed':
          notificationTitle = 'Registry Assessment Passed';
          notificationMessage = `Your application "${application.title}" has successfully passed the initial registry assessment. It is now proceeding to technical review.`;
          notificationType = 'success';
          break;
        case 'failed':
          notificationTitle = 'Registry Assessment Failed';
          notificationMessage = `Your application "${application.title}" did not pass the initial registry assessment. Reason: ${assessmentData.assessment_notes}`;
          notificationType = 'error';
          break;
        case 'requires_clarification':
          notificationTitle = 'Application Requires Clarification';
          notificationMessage = `Your application "${application.title}" requires additional information. Please review the feedback: ${assessmentData.feedback_provided || assessmentData.assessment_notes}`;
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

      toast({
        title: "Assessment Submitted",
        description: "The assessment has been successfully submitted and the applicant has been notified.",
      });

      navigate('/RegistryDashboard');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting the assessment.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
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
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Application Not Found</h3>
          <p className="text-muted-foreground">The requested application could not be found.</p>
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
              Application Number: {application.application_number || 'Pending'}
            </p>
          </div>
        </div>
        <Badge variant={application.status === 'submitted' ? 'default' : 'secondary'}>
          {application.status?.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Application Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Applied</p>
                <p className="font-medium">{new Date(application.application_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Applicant</p>
                <p className="font-medium">{entityDetails?.name || application.entity_name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Permit Type</p>
                <p className="font-medium">{application.permit_type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Assessment Status</p>
                <Badge variant="outline">{assessment?.assessment_status || 'Pending'}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Tab Review Interface */}
      <Tabs defaultValue="project" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-muted/50">
          <TabsTrigger value="project" className="flex flex-col items-center gap-1 text-xs py-2">
            <FileText className="w-4 h-4" />
            <span>Project Details</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="flex flex-col items-center gap-1 text-xs py-2">
            <MapPin className="w-4 h-4" />
            <span>Location</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex flex-col items-center gap-1 text-xs py-2">
            <Upload className="w-4 h-4" />
            <span>Documents</span>
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex flex-col items-center gap-1 text-xs py-2">
            <Calculator className="w-4 h-4" />
            <span>Fees</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex flex-col items-center gap-1 text-xs py-2">
            <Shield className="w-4 h-4" />
            <span>Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex flex-col items-center gap-1 text-xs py-2">
            <CheckCircle className="w-4 h-4" />
            <span>Assessment</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Project Details */}
        <TabsContent value="project" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Project Description</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">
                  {application.proposed_works_description || application.description || 'No description provided'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Legal Description</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg">
                    {application.legal_description || 'Not specified'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Land Type</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg">
                    {application.land_type || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Commencement Date</Label>
                  <p className="font-medium">
                    {application.commencement_date 
                      ? new Date(application.commencement_date).toLocaleDateString()
                      : 'Not specified'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Completion Date</Label>
                  <p className="font-medium">
                    {application.completion_date 
                      ? new Date(application.completion_date).toLocaleDateString()
                      : 'Not specified'
                    }
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Estimated Cost (PGK)</Label>
                <p className="font-medium text-lg">
                  {application.estimated_cost_kina 
                    ? `PGK ${application.estimated_cost_kina.toLocaleString()}`
                    : 'Not specified'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Location */}
        <TabsContent value="location" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Activity Location</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">
                  {application.activity_location || 'Not specified'}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Existing Permits</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">
                  {application.existing_permits_details || 'None specified'}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Landowner Negotiation Status</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">
                  {application.landowner_negotiation_status || 'Not specified'}
                </p>
              </div>

              {application.coordinates && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Coordinates</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg font-mono text-sm">
                    Lat: {application.coordinates.lat}, Lng: {application.coordinates.lng}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Documents */}
        <TabsContent value="documents" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Supporting Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.uploaded_files && application.uploaded_files.length > 0 ? (
                <div className="space-y-2">
                  {application.uploaded_files.map((file: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{file.name || `Document ${index + 1}`}</span>
                      </div>
                      {file.size && (
                        <span className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No documents uploaded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Fees */}
        <TabsContent value="fees" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Fee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Application Fee</Label>
                  <p className="font-medium text-lg">
                    PGK {application.application_fee?.toLocaleString() || '0.00'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Fee</Label>
                  <p className="font-medium text-lg">
                    PGK {application.fee_amount?.toLocaleString() || '0.00'}
                  </p>
                </div>
              </div>

              {application.fee_breakdown && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fee Breakdown</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <pre className="text-xs">{JSON.stringify(application.fee_breakdown, null, 2)}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Compliance */}
        <TabsContent value="compliance" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Compliance Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Consulted Departments</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">
                  {application.consulted_departments || 'Not specified'}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Required Approvals</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">
                  {application.required_approvals || 'Not specified'}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Government Agreements</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">
                  {application.government_agreements_details || 'Not specified'}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Permit Period</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">
                  {application.permit_period || 'Not specified'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Assessment */}
        <TabsContent value="assessment" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Registry Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="assessment_status">Assessment Status *</Label>
                <Select
                  value={assessmentData.assessment_status}
                  onValueChange={(value: any) => 
                    setAssessmentData({ ...assessmentData, assessment_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assessment status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ASSESSMENT_STATUS_OPTIONS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assessment_outcome">Assessment Outcome *</Label>
                <Textarea
                  id="assessment_outcome"
                  value={assessmentData.assessment_outcome}
                  onChange={(e) => 
                    setAssessmentData({ ...assessmentData, assessment_outcome: e.target.value })
                  }
                  placeholder="Provide the overall assessment outcome"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="assessment_notes">Assessment Notes *</Label>
                <Textarea
                  id="assessment_notes"
                  value={assessmentData.assessment_notes}
                  onChange={(e) => 
                    setAssessmentData({ ...assessmentData, assessment_notes: e.target.value })
                  }
                  placeholder="Enter detailed assessment notes"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="feedback_provided">Feedback for Applicant</Label>
                <Textarea
                  id="feedback_provided"
                  value={assessmentData.feedback_provided}
                  onChange={(e) => 
                    setAssessmentData({ ...assessmentData, feedback_provided: e.target.value })
                  }
                  placeholder="Provide any feedback or clarifications needed from the applicant"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmitAssessment}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Assessment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/RegistryDashboard')}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
