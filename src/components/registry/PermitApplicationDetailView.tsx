import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  FileText, 
  MapPin, 
  Building, 
  Calendar,
  DollarSign,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { InitialAssessmentForm } from './InitialAssessmentForm';
import { useInitialAssessments } from './hooks/useInitialAssessments';
import { useFeeCalculation } from '@/hooks/useFeeCalculation';
import { DocumentViewerCard } from '@/components/DocumentViewerCard';

interface PermitApplicationDetail {
  id: string;
  title: string;
  permit_type: string;
  status: string;
  application_number: string | null;
  entity_name: string | null;
  entity_type: string | null;
  description: string | null;
  created_at: string;
  application_date: string | null;
  activity_location: string | null;
  estimated_cost_kina: number | null;
  activity_classification: string | null;
  activity_category: string | null;
  activity_subcategory: string | null;
  permit_period: string | null;
  commencement_date: string | null;
  completion_date: string | null;
  coordinates: any;
  uploaded_files: any;
  compliance_checks: any;
  fee_amount: number | null;
  payment_status: string | null;
  activity_id: string | null;
}

interface DocumentFile {
  id: string;
  name: string;
  size: number;
  file_path: string;
}

export function PermitApplicationDetailView() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState<PermitApplicationDetail | null>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [prescribedActivity, setPrescribedActivity] = useState<any>(null);
  const { assessments, refetch: refetchAssessments } = useInitialAssessments();
  const { calculateFees } = useFeeCalculation();

  useEffect(() => {
    if (assessmentId) {
      fetchAssessmentAndApplicationDetails();
    }
  }, [assessmentId]);

  const fetchAssessmentAndApplicationDetails = async () => {
    try {
      setLoading(true);

      // Fetch the initial assessment with application details
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('initial_assessments')
        .select(`
          *,
          permit_applications:permit_application_id (*)
        `)
        .eq('id', assessmentId)
        .single();

      if (assessmentError) throw assessmentError;

      setAssessment(assessmentData);
      const appData = assessmentData.permit_applications;
      setApplication(appData);

      // Fetch documents if application has uploaded files
      if (appData?.uploaded_files && Array.isArray(appData.uploaded_files)) {
        const fileData = appData.uploaded_files.map((file: any, index: number) => ({
          id: `doc-${index}`,
          name: file.name || `Document ${index + 1}`,
          size: file.size || 0,
          file_path: file.path || file.file_path || ''
        }));
        setDocuments(fileData);
      }

      // Fetch prescribed activity details if activity_id exists
      if (appData?.activity_id) {
        const { data: activityData, error: activityError } = await supabase
          .from('prescribed_activities')
          .select('*')
          .eq('id', appData.activity_id)
          .single();

        if (!activityError && activityData) {
          setPrescribedActivity(activityData);
        }
      }

    } catch (error) {
      console.error('Error fetching assessment details:', error);
      toast({
        title: "Error",
        description: "Failed to load assessment details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'under_initial_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'passed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'requires_clarification':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const calculateApplicationFees = () => {
    if (!prescribedActivity || !application?.permit_type) return null;
    
    const activityType = 'new'; // This should be determined based on application type
    return calculateFees(activityType, application.permit_type);
  };

  const calculatedFees = calculateApplicationFees();

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <Clock className="w-6 h-6 mr-2 animate-spin" />
          Loading assessment details...
        </div>
      </div>
    );
  }

  if (!application || !assessment) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-medium mb-2">Assessment Not Found</h3>
          <p className="text-muted-foreground">
            The requested assessment could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/registry')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registry
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{application.title}</h1>
            <p className="text-muted-foreground">
              Application #{application.application_number || 'Pending'} • Assessment ID: {assessment.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(assessment.assessment_status)}>
            {assessment.assessment_status.replace(/_/g, ' ').toUpperCase()}
          </Badge>
          <Badge variant="outline">
            {application.status.replace(/_/g, ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <Building className="w-4 h-4 mr-2" />
              Entity Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">{application.entity_name || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">{application.entity_type || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <FileText className="w-4 h-4 mr-2" />
              Permit Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">{application.permit_type}</p>
              <p className="text-sm text-muted-foreground">
                {prescribedActivity ? `Level ${prescribedActivity.level}` : 'Level TBD'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              Location & Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium text-xs">{application.activity_location || 'Location TBD'}</p>
              <p className="text-sm text-muted-foreground">
                {application.estimated_cost_kina ? `K${application.estimated_cost_kina.toLocaleString()}` : 'Cost TBD'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Submitted: {new Date(application.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Period: {application.permit_period || 'TBD'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Content Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Application Details</TabsTrigger>
          <TabsTrigger value="activity">Activity Information</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="fees">Fees & Payment</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Title</h4>
                  <p>{application.title}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Description</h4>
                  <p className="text-sm">{application.description || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Activity Location</h4>
                  <p className="text-sm">{application.activity_location || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Start Date</h4>
                    <p className="text-sm">
                      {application.commencement_date ? new Date(application.commencement_date).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Completion Date</h4>
                    <p className="text-sm">
                      {application.completion_date ? new Date(application.completion_date).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Estimated Cost</h4>
                  <p className="text-sm">
                    {application.estimated_cost_kina ? `K${application.estimated_cost_kina.toLocaleString()}` : 'Not specified'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Prescribed Activity Details</CardTitle>
            </CardHeader>
            <CardContent>
              {prescribedActivity ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Category Number</h4>
                      <p>{prescribedActivity.category_number}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Level</h4>
                      <p>Level {prescribedActivity.level}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Category Type</h4>
                      <p>{prescribedActivity.category_type}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Activity Description</h4>
                    <p className="text-sm">{prescribedActivity.activity_description}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Sub Category</h4>
                    <p className="text-sm">{prescribedActivity.sub_category}</p>
                  </div>
                  {prescribedActivity.fee_category && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Fee Category</h4>
                      <Badge variant="secondary">{prescribedActivity.fee_category}</Badge>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>No prescribed activity information available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Documents</CardTitle>
              <p className="text-sm text-muted-foreground">
                Documents uploaded with this application for review and compliance verification
              </p>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <DocumentViewerCard key={doc.id} file={doc} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <p>No documents uploaded with this application</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Fee Calculation & Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calculatedFees ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Administration Fee</h4>
                      <p className="text-lg font-semibold">K{calculatedFees.administrationFee.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Form: {calculatedFees.administrationForm}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Technical Fee</h4>
                      <p className="text-lg font-semibold">K{calculatedFees.technicalFee.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Form: {calculatedFees.technicalForm}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Total Application Fee</h4>
                        <p className="text-2xl font-bold text-primary">K{calculatedFees.totalFee.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Processing Days</p>
                        <p className="font-semibold">{calculatedFees.processingDays} days</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Payment Status</h4>
                      <Badge variant={application.payment_status === 'paid' ? 'default' : 'secondary'}>
                        {application.payment_status === 'paid' ? 'Paid' : 'Pending Payment'}
                      </Badge>
                    </div>
                    {application.payment_status !== 'paid' && (
                      <Button size="sm">
                        Generate Invoice
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>Unable to calculate fees - missing activity or permit type information</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessment">
          <div className="space-y-4">
            {assessment.assessment_status === 'pending' ? (
              <InitialAssessmentForm
                permitId={application.id}
                assessmentId={assessment.id}
                onAssessmentComplete={() => {
                  refetchAssessments();
                  fetchAssessmentAndApplicationDetails();
                }}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {assessment.assessment_status === 'passed' ? (
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                    )}
                    Assessment Completed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                      <Badge className={getStatusColor(assessment.assessment_status)}>
                        {assessment.assessment_status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Assessment Date</h4>
                      <p>{new Date(assessment.assessment_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Assessment Outcome</h4>
                    <p>{assessment.assessment_outcome}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Assessment Notes</h4>
                    <p className="text-sm">{assessment.assessment_notes}</p>
                  </div>
                  {assessment.feedback_provided && (
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                      <h4 className="font-medium text-sm text-blue-800">Feedback for Compliance Team</h4>
                      <p className="text-sm text-blue-700 mt-1">{assessment.feedback_provided}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}