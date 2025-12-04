import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Shield, Upload, CheckCircle, Loader2, Lock } from 'lucide-react';

interface IntentComplianceReviewTabProps {
  intentId: string;
  currentStatus: string;
  onStatusUpdate: () => void;
}

export function IntentComplianceReviewTab({ intentId, currentStatus, onStatusUpdate }: IntentComplianceReviewTabProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState('');
  const [remarks, setRemarks] = useState('');
  const [proposedAction, setProposedAction] = useState('');
  const [status, setStatus] = useState(currentStatus);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; path: string }[]>([]);

  // Check if user can edit this tab (only compliance staff)
  const canEdit = profile?.staff_unit === 'compliance' || 
                  profile?.user_type === 'admin' || 
                  profile?.user_type === 'super_admin';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newFiles: { name: string; path: string }[] = [];
      
      for (const file of Array.from(files)) {
        const fileName = `${intentId}/compliance-review/${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        
        newFiles.push({ name: file.name, path: fileName });
      }
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast({ title: 'Success', description: 'Files uploaded successfully' });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({ title: 'Error', description: 'Failed to upload files', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!canEdit) {
      toast({ title: 'Error', description: 'You do not have permission to edit this section', variant: 'destructive' });
      return;
    }

    if (!assessment || !proposedAction) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        status,
        compliance_review_status: status,
        compliance_review_notes: JSON.stringify({
          assessment,
          remarks,
          proposed_action: proposedAction,
          documents: uploadedFiles,
        }),
        compliance_reviewed_by: profile?.user_id,
        compliance_reviewed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('intent_registrations')
        .update(reviewData)
        .eq('id', intentId);

      if (error) throw error;

      toast({ title: 'Success', description: 'Compliance review submitted successfully' });
      onStatusUpdate();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="bg-orange-500/10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-orange-600" />
          Compliance Review & Assessment
          {!canEdit && <Lock className="w-4 h-4 text-muted-foreground ml-auto" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {!canEdit && (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              This section is read-only. Only Compliance staff can edit this tab.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="compliance-assessment">Assessment *</Label>
          <Textarea
            id="compliance-assessment"
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            placeholder="Provide detailed compliance assessment..."
            rows={4}
            disabled={!canEdit}
            className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="compliance-remarks">Remarks</Label>
          <Textarea
            id="compliance-remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Additional compliance remarks or observations..."
            rows={3}
            disabled={!canEdit}
            className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="compliance-proposedAction">Proposed Action *</Label>
          <Textarea
            id="compliance-proposedAction"
            value={proposedAction}
            onChange={(e) => setProposedAction(e.target.value)}
            placeholder="Recommended compliance actions or next steps..."
            rows={3}
            disabled={!canEdit}
            className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="compliance-status">Update Status (for next workflow stage)</Label>
          <Select value={status} onValueChange={setStatus} disabled={!canEdit}>
            <SelectTrigger className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="compliance_approved">Compliance Approved - Forward to MD</SelectItem>
              <SelectItem value="compliance_issues">Compliance Issues Found</SelectItem>
              <SelectItem value="requires_clarification">Requires Clarification</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Supporting Documents</Label>
          <div className={`border-2 border-dashed border-border rounded-lg p-4 ${!canEdit ? 'bg-muted' : ''}`}>
            <Input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading || !canEdit}
              className={`cursor-pointer ${!canEdit ? 'cursor-not-allowed' : ''}`}
            />
            {uploading && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>
          {uploadedFiles.length > 0 && (
            <div className="mt-2 space-y-1">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="w-4 h-4" />
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {canEdit && (
          <div className="flex gap-4 pt-4">
            <Button onClick={handleSubmitReview} disabled={submitting} className="flex-1 bg-orange-600 hover:bg-orange-700">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Compliance Review
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}