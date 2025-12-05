import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Entity } from '@/hooks/useEntities';
import { EntityDetailsReadOnly } from '@/components/public/EntityDetailsReadOnly';
import { 
  Building2, 
  FileText, 
  UserCheck, 
  Upload, 
  CheckCircle, 
  Loader2, 
  AlertCircle, 
  Lock,
  ClipboardCheck
} from 'lucide-react';

interface MDEntityTabbedViewProps {
  entity: Entity;
  onUpdate?: () => void;
}

export function MDEntityTabbedView({ entity, onUpdate }: MDEntityTabbedViewProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState(entity.is_suspended ? 'suspended' : 'active');
  const [actionRequired, setActionRequired] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; path: string }[]>([]);

  // Check if user can edit the MD Review tab
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
        const fileName = `${entity.id}/md-review/${Date.now()}-${file.name}`;
        
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
      toast({ title: 'Error', description: 'You do not have permission to submit reviews', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const updateData = {
        is_suspended: reviewStatus === 'suspended',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('entities')
        .update(updateData)
        .eq('id', entity.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'MD review submitted successfully' });
      onUpdate?.();
    } catch (error) {
      console.error('Error submitting MD review:', error);
      toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="details" className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span className="hidden sm:inline">Entity Details</span>
          <span className="sm:hidden">Details</span>
        </TabsTrigger>
        <TabsTrigger value="registry" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Registry Review</span>
          <span className="sm:hidden">Registry</span>
        </TabsTrigger>
        <TabsTrigger value="md-review" className="flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          <span className="hidden sm:inline">MD Review</span>
          <span className="sm:hidden">MD</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="mt-4">
        <EntityDetailsReadOnly entity={entity} />
      </TabsContent>

      <TabsContent value="registry" className="mt-4">
        <Card>
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" />
              Registry Review
              <Lock className="w-4 h-4 text-muted-foreground ml-auto" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                This section is read-only. Registry staff manage entity reviews in the Registry Dashboard.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Entity Status</Label>
                <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                  <Badge variant={entity.is_suspended ? 'destructive' : 'default'}>
                    {entity.is_suspended ? 'Suspended' : 'Active'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Registration Number</Label>
                <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                  {entity.registration_number || 'Not provided'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Registry Notes</Label>
              <div className="bg-muted rounded-lg px-3 py-2 text-sm min-h-[80px]">
                <p className="text-muted-foreground italic">No registry notes available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="md-review" className="mt-4">
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
                  As Managing Director, you can review this entity and update its status. Any changes will be recorded in the audit trail.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="md-status">Entity Status *</Label>
              <Select value={reviewStatus} onValueChange={setReviewStatus} disabled={!canEdit}>
                <SelectTrigger className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}>
                  <SelectValue placeholder="Select entity status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500">Active</Badge>
                      <span>Entity is Active</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="suspended">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-500">Suspended</Badge>
                      <span>Entity is Suspended</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="md-notes">MD Review Notes</Label>
              <Textarea
                id="md-notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Provide review notes, observations, or concerns about this entity..."
                rows={5}
                disabled={!canEdit}
                className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action-required">Action Required</Label>
              <Textarea
                id="action-required"
                value={actionRequired}
                onChange={(e) => setActionRequired(e.target.value)}
                placeholder="Specify any actions that need to be taken..."
                rows={3}
                disabled={!canEdit}
                className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label>Supporting Documents / Attachments</Label>
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
                <Button 
                  onClick={handleSubmitReview} 
                  disabled={submitting} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit MD Review
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
