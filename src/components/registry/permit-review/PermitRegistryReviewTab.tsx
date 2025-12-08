import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, CheckCircle, Loader2, Lock } from 'lucide-react';

interface PermitRegistryReviewTabProps {
  applicationId: string;
  currentStatus: string;
  onStatusUpdate: () => void;
}

export function PermitRegistryReviewTab({ applicationId, currentStatus, onStatusUpdate }: PermitRegistryReviewTabProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState('');
  const [remarks, setRemarks] = useState('');
  const [proposedAction, setProposedAction] = useState('');
  const [status, setStatus] = useState(currentStatus);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; path: string }[]>([]);
  
  // Validation checkboxes
  const [entityIPAValidated, setEntityIPAValidated] = useState(false);
  const [projectSiteMapValidated, setProjectSiteMapValidated] = useState(false);
  const [documentsComplete, setDocumentsComplete] = useState(false);
  const [feeCalculated, setFeeCalculated] = useState(false);

  // Check if user can edit this tab (only registry staff)
  const canEdit = profile?.staff_unit === 'registry' || 
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
        const fileName = `${applicationId}/registry-review/${Date.now()}-${file.name}`;
        
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
      // Prepare assessment data to store in permit application
      const assessmentData = {
        assessment,
        remarks,
        proposed_action: proposedAction,
        documents: uploadedFiles,
        validation: {
          entityIPAValidated,
          projectSiteMapValidated,
          documentsComplete,
          feeCalculated
        },
        assessed_by: profile?.user_id,
        assessed_at: new Date().toISOString()
      };

      // Update permit application status and store assessment in compliance_checks field
      const { error: appError } = await supabase
        .from('permit_applications')
        .update({ 
          status,
          compliance_checks: assessmentData
        })
        .eq('id', applicationId);

      if (appError) throw appError;

      toast({ title: 'Success', description: 'Registry review submitted successfully' });
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
      <CardHeader className="bg-muted/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-primary" />
          Registry Review & Assessment
          {!canEdit && <Lock className="w-4 h-4 text-muted-foreground ml-auto" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Validation Checkboxes */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
          <Label className="text-sm font-semibold">Validation Checklist</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="entityIPAValidated"
                checked={entityIPAValidated}
                onCheckedChange={(checked) => setEntityIPAValidated(!!checked)}
                disabled={!canEdit}
              />
              <Label htmlFor="entityIPAValidated" className="text-sm font-normal cursor-pointer">
                Entity IPA Registration validated
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="projectSiteMapValidated"
                checked={projectSiteMapValidated}
                onCheckedChange={(checked) => setProjectSiteMapValidated(!!checked)}
                disabled={!canEdit}
              />
              <Label htmlFor="projectSiteMapValidated" className="text-sm font-normal cursor-pointer">
                Project site map validation
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="documentsComplete"
                checked={documentsComplete}
                onCheckedChange={(checked) => setDocumentsComplete(!!checked)}
                disabled={!canEdit}
              />
              <Label htmlFor="documentsComplete" className="text-sm font-normal cursor-pointer">
                All required documents uploaded
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="feeCalculated"
                checked={feeCalculated}
                onCheckedChange={(checked) => setFeeCalculated(!!checked)}
                disabled={!canEdit}
              />
              <Label htmlFor="feeCalculated" className="text-sm font-normal cursor-pointer">
                Application fee calculated and verified
              </Label>
            </div>
          </div>
        </div>

        {!canEdit && (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              This section is read-only. Only Registry staff can edit this tab.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="assessment">Assessment *</Label>
          <Textarea
            id="assessment"
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            placeholder="Provide detailed assessment of the permit application..."
            rows={4}
            disabled={!canEdit}
            className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Additional remarks or observations..."
            rows={3}
            disabled={!canEdit}
            className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposedAction">Proposed Action *</Label>
          <Textarea
            id="proposedAction"
            value={proposedAction}
            onChange={(e) => setProposedAction(e.target.value)}
            placeholder="Recommended actions or next steps..."
            rows={3}
            disabled={!canEdit}
            className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Update Status (for next workflow stage)</Label>
          <Select value={status} onValueChange={setStatus} disabled={!canEdit}>
            <SelectTrigger className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="submitted">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="registry_approved">Registry Approved - Forward to Compliance</SelectItem>
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
            <Button onClick={handleSubmitReview} disabled={submitting} className="flex-1">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Registry Review
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
