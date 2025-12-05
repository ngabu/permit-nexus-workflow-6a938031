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

import { FileText, Calendar, User, Building, Clock, Search, Filter, CheckCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { IntentRegistrationReadOnlyView } from '@/components/public/IntentRegistrationReadOnlyView';

interface IntentRegistration {
  id: string;
  user_id: string;
  entity_id: string;
  activity_level: string;
  activity_description: string;
  preparatory_work_description: string;
  commencement_date: string;
  completion_date: string;
  status: string;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  official_feedback_attachments: any[] | null;
  project_site_address: string | null;
  district: string | null;
  province: string | null;
  llg: string | null;
  project_site_description: string | null;
  site_ownership_details: string | null;
  government_agreement: string | null;
  departments_approached: string | null;
  approvals_required: string | null;
  landowner_negotiation_status: string | null;
  estimated_cost_kina: number | null;
  prescribed_activity_id: string | null;
  existing_permit_id: string | null;
  project_boundary: any | null;
  total_area_sqkm: number | null;
  entity?: {
    id: string;
    name: string;
    entity_type: string;
  };
}

export function IntentApplicationReview() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [intents, setIntents] = useState<IntentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIntentId, setSelectedIntentId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isManager = profile?.staff_position && ['manager', 'director', 'managing_director'].includes(profile.staff_position);

  useEffect(() => {
    fetchIntents();
  }, []);

  const fetchIntents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('intent_registrations')
        .select(`
          *,
          entity:entities!inner(id, name, entity_type)
        `)
        .in('status', ['pending', 'under_review', 'approved', 'rejected', 'requires_clarification'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to ensure types are correct
      const mappedIntents: IntentRegistration[] = (data || []).map(item => ({
        ...item,
        official_feedback_attachments: item.official_feedback_attachments 
          ? (Array.isArray(item.official_feedback_attachments) 
            ? item.official_feedback_attachments 
            : [])
          : null,
        project_boundary: item.project_boundary || null,
      }));
      
      setIntents(mappedIntents);
    } catch (error) {
      console.error('Error fetching intent registrations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch intent registrations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedIntentId || !reviewStatus) {
      toast({
        title: "Error",
        description: "Please select a review decision.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('intent_registrations')
        .update({
          status: reviewStatus,
          review_notes: reviewNotes,
          reviewed_by: profile?.user_id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedIntentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Registry review submitted successfully.",
      });

      setSelectedIntentId(null);
      setReviewStatus('');
      setReviewNotes('');
      fetchIntents();
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
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const filteredIntents = intents.filter(intent => {
    const matchesSearch = !searchTerm || 
      intent.entity?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intent.activity_description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || intent.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedIntent = intents.find(intent => intent.id === selectedIntentId);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center items-center">
            <Clock className="w-6 h-6 mr-2 animate-spin" />
            Loading intent registrations...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="print:border-none print:shadow-none">
        <CardHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Intent Application Reviews ({filteredIntents.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Review and process intent registrations submitted by applicants
              </p>
            </div>
            {selectedIntentId && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedIntentId(null);
                  setReviewStatus('');
                  setReviewNotes('');
                }}
              >
                Back to List
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 print:p-0">
          {!selectedIntentId && (
            <>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search intents..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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

        {/* Intents List */}
        {filteredIntents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No intent registrations found</h3>
            <p className="text-muted-foreground">
              {intents.length === 0 
                ? "No intent registrations have been submitted yet."
                : "Try adjusting your filters to see more results."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIntents.map((intent) => (
              <Card 
                key={intent.id} 
                className={`border-l-4 ${
                  intent.status === 'pending' 
                    ? 'border-l-blue-500' 
                    : intent.status === 'approved'
                    ? 'border-l-green-500'
                    : intent.status === 'rejected'
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
                          Intent Registration
                        </h3>
                        <Badge className={getStatusColor(intent.status)}>
                          {intent.status.replace(/_/g, ' ')}
                        </Badge>
                        {intent.activity_level && (
                          <Badge variant="outline">
                            Level {intent.activity_level}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          <span>{intent.entity?.name || 'Unknown Entity'}</span>
                          <span className="text-xs px-1 py-0.5 bg-muted rounded">
                            {intent.entity?.entity_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Submitted: {formatDistanceToNow(new Date(intent.created_at), { addSuffix: true })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Period: {new Date(intent.commencement_date).toLocaleDateString()} - {new Date(intent.completion_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {intent.activity_description && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                          <strong>Activity:</strong> {intent.activity_description}
                        </div>
                      )}

                      {intent.review_notes && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-sm border-l-2 border-primary">
                          <strong>Review Notes:</strong> {intent.review_notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <Button 
                        size="sm" 
                        variant={selectedIntentId === intent.id ? "default" : "outline"}
                        onClick={() => {
                          setSelectedIntentId(intent.id);
                          setReviewStatus(intent.status);
                          setReviewNotes(intent.review_notes || '');
                        }}
                      >
                        {intent.status === 'pending' ? 'Review' : 'View/Update'}
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

      {/* Read-Only Intent Details + Registry Review Section */}
      {selectedIntent && (
        <>
          <Alert className="print:hidden">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Review the intent registration details below. Provide your assessment and update the status accordingly.
            </AlertDescription>
          </Alert>

          {/* Read-Only Intent Registration Details */}
          <IntentRegistrationReadOnlyView intent={selectedIntent} />

          {/* Registry Review Section */}
          <Card className="bg-accent/50 print:hidden">
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
                    <SelectItem value="approved">Approve Intent</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="requires_clarification">Requires Clarification</SelectItem>
                    <SelectItem value="rejected">Reject Intent</SelectItem>
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
                    setSelectedIntentId(null);
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
    </div>
  );
}
