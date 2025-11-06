import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Clock, User, AlertCircle, CheckCircle, MessageSquare, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PermitApplicationReadOnlyView } from '@/components/public/PermitApplicationReadOnlyView';

interface ApplicationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permitApplicationId: string;
}

interface ApplicationDetails {
  id: string;
  title: string;
  permit_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  application_number: string | null;
  entity_name: string | null;
}

interface InitialAssessment {
  id: string;
  assessment_status: string;
  assessment_outcome: string;
  assessment_notes: string | null;
  feedback_provided: string | null;
  assessed_by: string | null;
  created_at: string;
  updated_at: string;
  assessor_name: string | null;
}

interface ComplianceAssessment {
  id: string;
  assessment_status: string;
  assessment_notes: string | null;
  compliance_score: number | null;
  recommendations: string | null;
  violations_found: any | null;
  next_review_date: string | null;
  assessed_by: string | null;
  created_at: string;
  updated_at: string;
  assessor_name: string | null;
}

export function ApplicationDetailDialog({ open, onOpenChange, permitApplicationId }: ApplicationDetailDialogProps) {
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [initialAssessment, setInitialAssessment] = useState<InitialAssessment | null>(null);
  const [complianceAssessment, setComplianceAssessment] = useState<ComplianceAssessment | null>(null);
  const [showFullApplication, setShowFullApplication] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (open && permitApplicationId) {
      fetchApplicationDetails();
    }
  }, [open, permitApplicationId]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);

      // Fetch application details
      const { data: appData, error: appError } = await supabase
        .from('permit_applications')
        .select(`
          id,
          title,
          permit_type,
          status,
          created_at,
          updated_at,
          application_number,
          entity_name
        `)
        .eq('id', permitApplicationId)
        .single();

      if (appError) {
        console.error('Error fetching application:', appError);
        throw appError;
      }
      setApplication(appData);

      // Fetch initial assessment with better error handling
      const { data: initialData, error: initialError } = await supabase
        .from('initial_assessments')
        .select(`
          id,
          assessment_status,
          assessment_outcome,
          assessment_notes,
          feedback_provided,
          assessed_by,
          created_at,
          updated_at
        `)
        .eq('permit_application_id', permitApplicationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (initialError) {
        console.error('Error fetching initial assessment:', initialError);
      } else if (initialData) {
        // Fetch assessor profile separately to avoid foreign key issues
        let assessorName = null;
        if (initialData.assessed_by && initialData.assessed_by !== '00000000-0000-0000-0000-000000000000') {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', initialData.assessed_by)
            .single();
          
          if (profileData) {
            assessorName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
          }
        }

        setInitialAssessment({
          ...initialData,
          assessor_name: assessorName
        });
      }

      // Fetch compliance assessment with better error handling
      const { data: complianceData, error: complianceError } = await supabase
        .from('compliance_assessments')
        .select(`
          id,
          assessment_status,
          assessment_notes,
          compliance_score,
          recommendations,
          violations_found,
          next_review_date,
          assessed_by,
          created_at,
          updated_at
        `)
        .eq('permit_application_id', permitApplicationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (complianceError) {
        console.error('Error fetching compliance assessment:', complianceError);
      } else if (complianceData) {
        // Fetch assessor profile separately
        let assessorName = null;
        if (complianceData.assessed_by && complianceData.assessed_by !== '00000000-0000-0000-0000-000000000000') {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', complianceData.assessed_by)
            .single();
          
          if (profileData) {
            assessorName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
          }
        }

        setComplianceAssessment({
          id: complianceData.id,
          assessment_status: complianceData.assessment_status,
          assessment_notes: complianceData.assessment_notes,
          compliance_score: complianceData.compliance_score,
          recommendations: complianceData.recommendations,
          violations_found: complianceData.violations_found,
          next_review_date: complianceData.next_review_date,
          assessed_by: complianceData.assessed_by,
          created_at: complianceData.created_at,
          updated_at: complianceData.updated_at,
          assessor_name: assessorName
        });
      }

    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'under_initial_review':
      case 'under_technical_review': return 'secondary';
      case 'requires_clarification': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      case 'under_initial_review':
      case 'under_technical_review': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center py-8">
            <div className="text-muted-foreground">Loading application details...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!application) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center py-8">
            <div className="text-muted-foreground">Application not found</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {application.title || 'Permit Application'}
          </DialogTitle>
          <DialogDescription>
            {application.application_number && `Application #${application.application_number} • `}
            {application.permit_type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Status</span>
                <Badge variant={getStatusBadgeVariant(application.status)} className="flex items-center gap-1">
                  {getStatusIcon(application.status)}
                  {application.status.replace(/_/g, ' ')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Submitted:</span>
                  <p className="text-muted-foreground">
                    {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <p className="text-muted-foreground">
                    {formatDistanceToNow(new Date(application.updated_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Details */}
          <Tabs defaultValue="registry" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="registry" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Registry Assessment
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Technical Assessment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="registry" className="space-y-4">
              {initialAssessment ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Registry Assessment</span>
                      <Badge variant={getStatusBadgeVariant(initialAssessment.assessment_status)}>
                        {initialAssessment.assessment_status.replace(/_/g, ' ')}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Initial assessment by registry team
                      {initialAssessment.assessor_name && ` • Assessed by ${initialAssessment.assessor_name}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {initialAssessment.assessment_outcome && (
                      <div>
                        <h4 className="font-medium mb-2">Assessment Outcome</h4>
                        <p className="text-sm bg-sidebar p-3 rounded-lg">
                          {initialAssessment.assessment_outcome}
                        </p>
                      </div>
                    )}
                    
                    {initialAssessment.assessment_notes && (
                      <div>
                        <h4 className="font-medium mb-2">Assessment Notes</h4>
                        <p className="text-sm bg-sidebar p-3 rounded-lg">
                          {initialAssessment.assessment_notes}
                        </p>
                      </div>
                    )}
                    
                    {initialAssessment.feedback_provided && (
                      <div>
                        <h4 className="font-medium mb-2 text-blue-700">Registry Feedback</h4>
                        <p className="text-sm bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-800">
                          {initialAssessment.feedback_provided}
                        </p>
                      </div>
                    )}
                    
                    <Separator />
                    <div className="text-xs text-muted-foreground">
                      Last updated: {formatDistanceToNow(new Date(initialAssessment.updated_at), { addSuffix: true })}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No registry assessment available yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              {complianceAssessment ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Technical Assessment</span>
                      <Badge variant={getStatusBadgeVariant(complianceAssessment.assessment_status)}>
                        {complianceAssessment.assessment_status.replace(/_/g, ' ')}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Technical assessment by compliance team
                      {complianceAssessment.assessor_name && ` • Assessed by ${complianceAssessment.assessor_name}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {complianceAssessment.compliance_score !== null && (
                      <div>
                        <h4 className="font-medium mb-2">Compliance Score</h4>
                        <div className="flex items-center gap-2">
                          <div className={`text-lg font-semibold px-3 py-1 rounded-lg ${
                            complianceAssessment.compliance_score >= 80 ? 'bg-green-100 text-green-800' :
                            complianceAssessment.compliance_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {complianceAssessment.compliance_score}/100
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {complianceAssessment.assessment_notes && (
                      <div>
                        <h4 className="font-medium mb-2">Assessment Notes</h4>
                        <p className="text-sm bg-sidebar p-3 rounded-lg">
                          {complianceAssessment.assessment_notes}
                        </p>
                      </div>
                    )}
                    
                    {complianceAssessment.violations_found && (
                      <div>
                        <h4 className="font-medium mb-2">Violations Found</h4>
                        <div className="text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
                          <pre className="whitespace-pre-wrap text-red-800">
                            {JSON.stringify(complianceAssessment.violations_found, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {complianceAssessment.recommendations && (
                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <p className="text-sm bg-blue-50 border border-blue-200 p-3 rounded-lg">
                          {complianceAssessment.recommendations}
                        </p>
                      </div>
                    )}
                    
                    {complianceAssessment.next_review_date && (
                      <div>
                        <h4 className="font-medium mb-2">Next Review Date</h4>
                        <p className="text-sm bg-amber-50 border border-amber-200 p-3 rounded-lg">
                          {new Date(complianceAssessment.next_review_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    <Separator />
                    <div className="text-xs text-muted-foreground">
                      Last updated: {formatDistanceToNow(new Date(complianceAssessment.updated_at), { addSuffix: true })}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No technical assessment available yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setShowFullApplication(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Full Application
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Full Application Dialog */}
      <Dialog open={showFullApplication} onOpenChange={setShowFullApplication}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Full Application Details
            </DialogTitle>
            <DialogDescription>
              Complete view of {application?.title || 'permit application'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <PermitApplicationReadOnlyView applicationId={permitApplicationId} />
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}