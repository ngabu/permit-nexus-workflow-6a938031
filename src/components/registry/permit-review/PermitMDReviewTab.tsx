import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Upload, CheckCircle, Loader2, AlertCircle, Lock, FileSignature } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PermitMDReviewTabProps {
  applicationId: string;
  currentStatus: string;
  onStatusUpdate: () => void;
}

export function PermitMDReviewTab({ applicationId, currentStatus, onStatusUpdate }: PermitMDReviewTabProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [decision, setDecision] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [status, setStatus] = useState(currentStatus);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendingDocuSign, setSendingDocuSign] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; path: string }[]>([]);

  // Check if user can edit this tab (only managing director)
  const canEdit = profile?.staff_position === 'managing_director' || 
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
        const fileName = `${applicationId}/md-review/${Date.now()}-${file.name}`;
        
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

  const handleSubmitDecision = async () => {
    if (!canEdit) {
      toast({ title: 'Error', description: 'You do not have permission to edit this section', variant: 'destructive' });
      return;
    }

    if (!decision) {
      toast({ title: 'Error', description: 'Please select a decision', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      // Update permit application status
      const { error } = await supabase
        .from('permit_applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;

      toast({ title: 'Success', description: 'MD decision submitted successfully' });
      onStatusUpdate();
    } catch (error) {
      console.error('Error submitting decision:', error);
      toast({ title: 'Error', description: 'Failed to submit decision', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="bg-green-500/10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserCheck className="w-5 h-5 text-green-600" />
          Managing Director Review & Approval
          {!canEdit && <Lock className="w-4 h-4 text-muted-foreground ml-auto" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {!canEdit && (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              This section is read-only. Only the Managing Director can edit this tab.
            </AlertDescription>
          </Alert>
        )}

        {canEdit && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is the final approval stage. The Managing Director's decision will determine the outcome of this permit application.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="md-decision">Final Decision *</Label>
          <Select value={decision} onValueChange={setDecision} disabled={!canEdit}>
            <SelectTrigger className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}>
              <SelectValue placeholder="Select final decision" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approved">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">Approve</Badge>
                  <span>Permit Application Approved</span>
                </div>
              </SelectItem>
              <SelectItem value="approved_with_conditions">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-500">Conditional</Badge>
                  <span>Approved with Conditions</span>
                </div>
              </SelectItem>
              <SelectItem value="deferred">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-500">Deferred</Badge>
                  <span>Decision Deferred</span>
                </div>
              </SelectItem>
              <SelectItem value="rejected">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500">Reject</Badge>
                  <span>Permit Application Rejected</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="md-notes">Decision Notes & Conditions</Label>
          <Textarea
            id="md-notes"
            value={decisionNotes}
            onChange={(e) => setDecisionNotes(e.target.value)}
            placeholder="Provide decision rationale, conditions, or additional notes..."
            rows={5}
            disabled={!canEdit}
            className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="md-status">Update Application Status</Label>
          <Select value={status} onValueChange={setStatus} disabled={!canEdit}>
            <SelectTrigger className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}>
              <SelectValue placeholder="Select final status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="approved_with_conditions">Approved with Conditions</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="deferred">Deferred for Further Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Signed Documents / Attachments</Label>
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

        {/* DocuSign Integration */}
        <div className="space-y-2">
          <Label>DocuSign Electronic Signature</Label>
          <div className="p-4 border rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground mb-3">
              Send the permit documents for electronic signature via DocuSign.
            </p>
            <Button
              variant="outline"
              onClick={async () => {
                if (!canEdit) return;
                
                setSendingDocuSign(true);
                try {
                  const signerEmail = profile?.email || 'md@cepa.gov.pg';
                  const signerName = profile?.first_name && profile?.last_name 
                    ? `${profile.first_name} ${profile.last_name}` 
                    : 'Managing Director';

                  const { data, error } = await supabase.functions.invoke('docusign-send', {
                    body: {
                      applicationId,
                      signerEmail,
                      signerName,
                      documentName: 'Permit Application Approval Letter',
                      documentPath: uploadedFiles.length > 0 ? uploadedFiles[0].path : null
                    }
                  });

                  if (error) throw error;

                  toast({
                    title: 'DocuSign Request Sent',
                    description: data.message || 'Document sent for electronic signature',
                  });
                } catch (error) {
                  console.error('DocuSign error:', error);
                  toast({
                    title: 'Error',
                    description: 'Failed to send document to DocuSign',
                    variant: 'destructive'
                  });
                } finally {
                  setSendingDocuSign(false);
                }
              }}
              disabled={!canEdit || sendingDocuSign}
              className={`w-full ${!canEdit ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {sendingDocuSign ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending to DocuSign...
                </>
              ) : (
                <>
                  <FileSignature className="w-4 h-4 mr-2" />
                  Send to DocuSign for Signature
                </>
              )}
            </Button>
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-4 pt-4">
            <Button onClick={handleSubmitDecision} disabled={submitting} className="flex-1 bg-green-600 hover:bg-green-700">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Final Decision
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
