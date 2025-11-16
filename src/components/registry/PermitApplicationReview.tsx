import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, Building, Clock, Search, Filter, CheckCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { PermitApplicationReadOnlyView } from './read-only/PermitApplicationReadOnlyView';

interface PermitApplication {
  id: string;
  user_id: string;
  entity_id: string;
  title: string;
  description: string;
  permit_type: string;
  status: string;
  application_number: string | null;
  created_at: string;
  updated_at: string;
  activity_location: string | null;
  estimated_cost_kina: number | null;
  activity_classification: string | null;
  activity_category: string | null;
  activity_subcategory: string | null;
  permit_period: string | null;
  commencement_date: string | null;
  completion_date: string | null;
  entity_name: string | null;
  entity_type: string | null;
  coordinates: any;
  environmental_impact: string | null;
  mitigation_measures: string | null;
  compliance_checks: any;
  uploaded_files: any;
  entity?: {
    id: string;
    name: string;
    entity_type: string;
  };
}

export function PermitApplicationReview() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<PermitApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isManager = profile?.staff_position && ['manager', 'director', 'managing_director'].includes(profile.staff_position);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('permit_applications')
        .select(`
          *,
          entity:entities!inner(id, name, entity_type)
        `)
        .in('status', ['submitted', 'under_initial_review', 'under_review', 'approved', 'rejected', 'requires_clarification'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map data to include entity name and type directly on application
      const mappedApplications: PermitApplication[] = (data || []).map(app => ({
        ...app,
        entity_name: app.entity?.name || null,
        entity_type: app.entity?.entity_type || null,
      }));
      
      setApplications(mappedApplications);
    } catch (error) {
      console.error('Error fetching permit applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch permit applications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedApplicationId || !reviewStatus) {
      toast({
        title: "Error",
        description: "Please select a review decision.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Update the permit application status
      const { error: appError } = await supabase
        .from('permit_applications')
        .update({
          status: reviewStatus,
        })
        .eq('id', selectedApplicationId);

      if (appError) throw appError;

      // Create or update initial assessment
      const { data: existingAssessment } = await supabase
        .from('initial_assessments')
        .select('id')
        .eq('permit_application_id', selectedApplicationId)
        .maybeSingle();

      if (existingAssessment) {
        const { error: assessmentError } = await supabase
          .from('initial_assessments')
          .update({
            assessment_notes: reviewNotes,
            assessment_status: reviewStatus === 'approved' ? 'completed' : 'pending',
            assessment_outcome: reviewStatus,
            assessed_by: profile?.user_id || '00000000-0000-0000-0000-000000000000',
          })
          .eq('id', existingAssessment.id);

        if (assessmentError) throw assessmentError;
      } else {
        const { error: assessmentError } = await supabase
          .from('initial_assessments')
          .insert({
            permit_application_id: selectedApplicationId,
            assessed_by: profile?.user_id || '00000000-0000-0000-0000-000000000000',
            assessment_notes: reviewNotes,
            assessment_status: reviewStatus === 'approved' ? 'completed' : 'pending',
            assessment_outcome: reviewStatus,
            permit_activity_type: 'new_application'
          });

        if (assessmentError) throw assessmentError;
      }

      toast({
        title: "Success",
        description: "Registry review submitted successfully.",
      });

      setSelectedApplicationId(null);
      setReviewStatus('');
      setReviewNotes('');
      fetchApplications();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'under_initial_review':
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'requires_clarification':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm || 
      app.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.entity?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.application_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedApplication = applications.find(app => app.id === selectedApplicationId);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center items-center">
            <Clock className="w-6 h-6 mr-2 animate-spin" />
            Loading permit applications...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Permit Application Reviews ({filteredApplications.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Review and process permit applications submitted by applicants
              </p>
            </div>
            {selectedApplicationId && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedApplicationId(null);
                  setReviewStatus('');
                  setReviewNotes('');
                }}
              >
                Back to List
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedApplicationId && (
            <>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_initial_review">Under Initial Review</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="requires_clarification">Requires Clarification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="w-full"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* Applications List */}
              {filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No permit applications found</h3>
                  <p className="text-muted-foreground">
                    {applications.length === 0 
                      ? "No permit applications have been submitted yet."
                      : "Try adjusting your filters to see more results."
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredApplications.map((app) => (
                    <Card 
                      key={app.id} 
                      className={`border-l-4 ${
                        app.status === 'submitted' 
                          ? 'border-l-blue-500' 
                          : app.status === 'approved'
                          ? 'border-l-green-500'
                          : app.status === 'rejected'
                          ? 'border-l-red-500'
                          : 'border-l-orange-500'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <h3 className="font-medium">
                                {app.title}
                              </h3>
                              <Badge className={getStatusColor(app.status)}>
                                {app.status.replace(/_/g, ' ')}
                              </Badge>
                              {app.application_number && (
                                <Badge variant="outline">
                                  {app.application_number}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Building className="w-4 h-4" />
                                <span>{app.entity?.name || 'Unknown Entity'}</span>
                                <span className="text-xs px-1 py-0.5 bg-muted rounded">
                                  {app.entity?.entity_type}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Submitted: {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                <span>Type: {app.permit_type}</span>
                              </div>
                            </div>

                            {app.description && (
                              <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                                <strong>Description:</strong> {app.description}
                              </div>
                            )}
                          </div>
                          
                          <div className="ml-4">
                            <Button 
                              size="sm" 
                              variant={selectedApplicationId === app.id ? "default" : "outline"}
                              onClick={() => {
                                setSelectedApplicationId(app.id);
                                setReviewStatus(app.status);
                                setReviewNotes('');
                              }}
                            >
                              {app.status === 'submitted' ? 'Review' : 'View/Update'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Read-Only Permit Application Details + Registry Review Section */}
      {selectedApplication && (
        <>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Review the permit application details below. Provide your assessment and update the status accordingly.
            </AlertDescription>
          </Alert>

          {/* Read-Only Permit Application Details */}
          {selectedApplication && <PermitApplicationReadOnlyView application={selectedApplication} />}

          {/* Registry Review Section */}
          <Card className="bg-accent/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Registry Review & Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reviewStatus">Review Decision</Label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select review decision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve Application</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="requires_clarification">Requires Clarification</SelectItem>
                    <SelectItem value="rejected">Reject Application</SelectItem>
                    <SelectItem value="under_initial_review">Move to Initial Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewNotes">Registry Review Notes</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Provide detailed review notes, assessment findings, and recommendations..."
                  rows={6}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleSubmitReview} 
                  className="flex-1"
                  disabled={submitting}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedApplicationId(null);
                    setReviewStatus('');
                    setReviewNotes('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
