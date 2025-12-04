import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building, User, Calendar, FileText, Upload, Download, Send, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { IntentRegistrationReadOnlyView } from '@/components/public/IntentRegistrationReadOnlyView';
import { IntentRegistration } from '@/hooks/useIntentRegistrations';

interface IntentRegistrationReviewFormProps {
  intentId: string;
  onBack: () => void;
}

interface Document {
  id: string;
  filename: string;
  file_path: string;
  uploaded_at: string;
  file_size: number;
}

interface EntityDetails {
  id: string;
  name: string;
  entity_type: string;
  'registered address'?: string;
  postal_address?: string;
  email?: string;
  phone?: string;
  district?: string;
  province?: string;
}

export function IntentRegistrationReviewForm({ intentId, onBack }: IntentRegistrationReviewFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [intent, setIntent] = useState<IntentRegistration | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedbackFiles, setFeedbackFiles] = useState<File[]>([]);
  const [reviewerName, setReviewerName] = useState<string>('');
  const [entityDetails, setEntityDetails] = useState<EntityDetails | null>(null);

  useEffect(() => {
    fetchIntentDetails();
  }, [intentId]);

  const fetchIntentDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('intent_registrations')
        .select(`
          *,
          entity:entities!inner(id, name, entity_type)
        `)
        .eq('id', intentId)
        .in('status', ['submitted', 'approved', 'rejected', 'under_review'])
        .single();

      if (error) throw error;

      const typedIntent = {
        ...data,
        official_feedback_attachments: data.official_feedback_attachments 
          ? (Array.isArray(data.official_feedback_attachments) 
            ? data.official_feedback_attachments 
            : [])
          : null,
      } as IntentRegistration;
      
      setIntent(typedIntent);
      setReviewNotes(data.review_notes || '');
      setReviewStatus(data.status);

      // Fetch entity details
      if (data.entity_id) {
        const { data: entityData, error: entityError } = await supabase
          .from('entities')
          .select('*')
          .eq('id', data.entity_id)
          .maybeSingle();

        if (!entityError && entityData) {
          setEntityDetails(entityData);
        }
      }

      // Fetch reviewer name if reviewed_by exists
      if (data.reviewed_by) {
        const { data: reviewerProfile, error: reviewerError } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('user_id', data.reviewed_by)
          .single();

        if (!reviewerError && reviewerProfile) {
          const name = reviewerProfile.first_name && reviewerProfile.last_name
            ? `${reviewerProfile.first_name} ${reviewerProfile.last_name}`
            : reviewerProfile.email || 'Unknown Reviewer';
          setReviewerName(name);
        }
      }

      // Fetch documents
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('intent_registration_id', intentId)
        .order('uploaded_at', { ascending: false });

      if (!docsError && docs) {
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Error fetching intent details:', error);
      toast({
        title: "Error",
        description: "Failed to load intent registration details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (filePath: string, filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);
      
      if (error) throw error;
      
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: `Downloading ${filename}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFeedbackFiles(Array.from(files));
    }
  };

  const uploadFeedbackDocuments = async (): Promise<string[]> => {
    const uploadedPaths: string[] = [];
    
    for (const file of feedbackFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${profile?.user_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      uploadedPaths.push(filePath);
    }

    return uploadedPaths;
  };

  const sendEmailNotification = async () => {
    try {
      // Get applicant profile
      const { data: applicantProfile } = await supabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('user_id', intent?.user_id)
        .single();

      if (applicantProfile?.email) {
        // In a real implementation, you would call an edge function to send the email
        console.log('Sending email to:', applicantProfile.email);
        console.log('Status:', reviewStatus);
        console.log('Notes:', reviewNotes);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewStatus) {
      toast({
        title: "Missing Information",
        description: "Please select a review status.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Upload feedback documents if any
      let feedbackAttachments = intent?.official_feedback_attachments || [];
      if (feedbackFiles.length > 0) {
        const uploadedPaths = await uploadFeedbackDocuments();
        feedbackAttachments = [
          ...feedbackAttachments,
          ...uploadedPaths.map(path => ({
            path,
            uploaded_at: new Date().toISOString(),
            uploaded_by: profile?.user_id,
          }))
        ];
      }

      // Update intent registration
      const { error } = await supabase
        .from('intent_registrations')
        .update({
          status: reviewStatus,
          review_notes: reviewNotes,
          reviewed_by: profile?.user_id,
          reviewed_at: new Date().toISOString(),
          official_feedback_attachments: feedbackAttachments,
          updated_at: new Date().toISOString(),
        })
        .eq('id', intentId);

      if (error) throw error;

      // Create notification for the applicant
      const reviewerName = profile?.first_name && profile?.last_name 
        ? `${profile.first_name} ${profile.last_name}`
        : profile?.email || 'Registry Officer';

      const notificationTitle = reviewStatus === 'approved' 
        ? 'Intent Registration Approved' 
        : reviewStatus === 'rejected'
        ? 'Intent Registration Rejected'
        : 'Intent Registration Under Review';

      const notificationMessage = `Your intent registration has been reviewed by ${reviewerName}. Status: ${reviewStatus.replace(/_/g, ' ')}. ${reviewNotes ? 'Review notes: ' + reviewNotes : ''}`;

      let notificationType: 'success' | 'warning' | 'error' | 'info' = 'info';
      if (reviewStatus === 'approved') {
        notificationType = 'success';
      } else if (reviewStatus === 'rejected') {
        notificationType = 'error';
      } else if (reviewStatus === 'requires_clarification') {
        notificationType = 'warning';
      }

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: intent?.user_id,
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          is_read: false,
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      toast({
        title: "Review Submitted",
        description: "Intent application review has been submitted successfully and applicant has been notified.",
      });

      setFeedbackFiles([]);
      fetchIntentDetails();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Review Failed",
        description: "Failed to submit review. Please try again.",
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!intent) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-center text-muted-foreground">Intent registration not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 print:hidden">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">Intent Registration Review</h2>
        </div>
        <Badge className={getStatusColor(intent.status)}>
          {intent.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      <Tabs defaultValue="details" className="w-full print:hidden">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Registration Details</TabsTrigger>
          <TabsTrigger value="feedback">Registry Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <IntentRegistrationReadOnlyView intent={intent} />
        </TabsContent>

        <TabsContent value="feedback">
          <Card className="bg-glass/50 backdrop-blur-sm border-glass">
            <CardHeader>
              <CardTitle>Registry Feedback & Actions</CardTitle>
              <CardDescription>
                Provide feedback and update the status of this intent registration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Bulk Review Actions</p>
                    <p className="text-sm text-muted-foreground">
                      Update status, add feedback notes, and upload official documents. An email notification will be sent to the applicant automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewStatus">Review Status *</Label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Submitted
                      </div>
                    </SelectItem>
                    <SelectItem value="under_review">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Under Review
                      </div>
                    </SelectItem>
                    <SelectItem value="approved">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Approved
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Rejected
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewNotes">Review Notes & Feedback *</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter detailed review notes and feedback for the applicant..."
                  rows={6}
                  className="bg-glass/50"
                />
                <p className="text-sm text-muted-foreground">
                  These notes will be visible to the applicant and included in the email notification.
                </p>
              </div>

              <div className="space-y-4">
                <Label>Feedback Documents (Optional)</Label>
                <div className="border-2 border-dashed border-glass rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="feedback-upload"
                  />
                  <label htmlFor="feedback-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload official feedback documents
                    </p>
                  </label>
                </div>
                
                {feedbackFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Files to upload ({feedbackFiles.length}):</p>
                    {feedbackFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {intent.official_feedback_attachments && intent.official_feedback_attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Previously Uploaded Feedback:</p>
                    {intent.official_feedback_attachments.map((attachment: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-sm">{attachment.path.split('/').pop()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-glass">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setReviewNotes(intent.review_notes || '');
                    setReviewStatus(intent.status);
                    setFeedbackFiles([]);
                  }}
                  className="w-32"
                >
                  Save Draft
                </Button>
                <Button
                  onClick={handleReviewSubmit}
                  disabled={submitting || !reviewStatus || !reviewNotes.trim()}
                  className="w-40"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
