import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEntities } from '@/hooks/useEntities';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useDocuments, DocumentInfo } from '@/hooks/useDocuments';
import { Building, User, Calendar, AlertCircle, FileText, Upload, Trash2, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function IntentRegistrationNew() {
  const { user } = useAuth();
  const { entities, loading: entitiesLoading } = useEntities();
  const { toast } = useToast();
  const [submittedIntentId, setSubmittedIntentId] = useState<string | undefined>();
  const { documents, loading: docsLoading, uploadDocument, deleteDocument, uploadDraftDocument, fetchUserDraftDocuments, linkDraftsToIntent, deleteDocumentRecordOnly, refreshDocuments } = useDocuments(undefined, submittedIntentId);
  
  const [formData, setFormData] = useState({
    entity_id: '',
    activity_level: '',
    activity_description: '',
    preparatory_work_description: '',
    commencement_date: '',
    completion_date: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<any>(null);
  const [pendingDocuments, setPendingDocuments] = useState<DocumentInfo[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  useEffect(() => {
    const loadDrafts = async () => {
      if (!user) return;
      setPendingLoading(true);
      const drafts = await fetchUserDraftDocuments('intent_draft');
      setPendingDocuments(drafts);
      setPendingLoading(false);
    };
    loadDrafts();
  }, [user?.id, fetchUserDraftDocuments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit an intent registration.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.commencement_date) >= new Date(formData.completion_date)) {
      toast({
        title: "Invalid Dates",
        description: "Completion date must be after commencement date.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('intent_registrations')
        .insert({
          user_id: user.id,
          entity_id: formData.entity_id,
          activity_level: formData.activity_level,
          activity_description: formData.activity_description,
          preparatory_work_description: formData.preparatory_work_description,
          commencement_date: formData.commencement_date,
          completion_date: formData.completion_date,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      setSubmittedIntentId(data.id);
      setCurrentIntent(data);

      // Link any pre-submission draft documents to this intent
      if (pendingDocuments.length > 0) {
        const linked = await linkDraftsToIntent(pendingDocuments, data.id);
        // Remove draft DB rows without deleting storage files
        await Promise.all(pendingDocuments.map((d) => deleteDocumentRecordOnly(d.id)));
        setPendingDocuments([]);
        toast({ title: 'Documents Linked', description: `${linked.length} document(s) linked to this intent.` });
        await refreshDocuments?.();
      }

      toast({
        title: "Intent Registration Submitted",
        description: "Your registration of intent has been submitted successfully. You can now upload supporting documents.",
      });

      setFormData({
        entity_id: '',
        activity_level: '',
        activity_description: '',
        preparatory_work_description: '',
        commencement_date: '',
        completion_date: '',
      });
    } catch (error) {
      console.error('Error submitting intent registration:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit intent registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      if (submittedIntentId) {
        for (let i = 0; i < files.length; i++) {
          await uploadDocument(files[i], undefined, submittedIntentId);
        }
      } else {
        for (let i = 0; i < files.length; i++) {
          await uploadDraftDocument(files[i], 'intent_draft');
        }
        const drafts = await fetchUserDraftDocuments('intent_draft');
        setPendingDocuments(drafts);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };
  const handleDeleteDocument = async (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(docId);
      setPendingDocuments(prev => prev.filter(d => d.id !== docId));
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
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">New Intent Registration</h2>
        <p className="text-muted-foreground mt-2">
          Register your intention to carry out preparatory work for Level 2 or Level 3 activities (Section 48, Environment Act 2000)
        </p>
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          <strong>Important:</strong> Registration of Intent is mandatory before lodging a permit application for Level 2 or Level 3 activities involving preparatory work.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Registration Details</TabsTrigger>
          <TabsTrigger value="feedback" disabled>Official Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <form onSubmit={handleSubmit}>
            <Card className="bg-glass/50 backdrop-blur-sm border-glass">
              <CardHeader>
                <CardTitle>Registration Details</CardTitle>
                <CardDescription>
                  Provide details about your intended preparatory work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="entity_id">
                    Entity (Individual or Organization) *
                  </Label>
                  <Select
                    value={formData.entity_id}
                    onValueChange={(value) => setFormData({ ...formData, entity_id: value })}
                    required
                    disabled={entitiesLoading}
                  >
                    <SelectTrigger id="entity_id" className="bg-glass/50">
                      <SelectValue placeholder="Select an entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.length === 0 ? (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          No entities found. Please create one first.
                        </div>
                      ) : (
                        entities.map((entity) => (
                          <SelectItem key={entity.id} value={entity.id}>
                            <div className="flex items-center gap-2">
                              {entity.entity_type === 'company' ? (
                                <Building className="w-4 h-4" />
                              ) : (
                                <User className="w-4 h-4" />
                              )}
                              <span>{entity.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                ({entity.entity_type === 'company' ? 'Organization' : 
                                  entity.entity_type === 'government' ? 'Government' : 'Individual'})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity_level">Activity Level *</Label>
                  <Select
                    value={formData.activity_level}
                    onValueChange={(value) => setFormData({ ...formData, activity_level: value })}
                    required
                  >
                    <SelectTrigger id="activity_level" className="bg-glass/50">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Level 2">Level 2 Activity</SelectItem>
                      <SelectItem value="Level 3">Level 3 Activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity_description">Activity Description *</Label>
                  <Textarea
                    id="activity_description"
                    value={formData.activity_description}
                    onChange={(e) => setFormData({ ...formData, activity_description: e.target.value })}
                    placeholder="Describe the main activity you intend to carry out..."
                    required
                    rows={4}
                    className="bg-glass/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preparatory_work_description">Preparatory Work Description *</Label>
                  <Textarea
                    id="preparatory_work_description"
                    value={formData.preparatory_work_description}
                    onChange={(e) => setFormData({ ...formData, preparatory_work_description: e.target.value })}
                    placeholder="Provide a 1-2 page description of the preparatory work to be undertaken..."
                    required
                    rows={8}
                    className="bg-glass/50"
                  />
                  <p className="text-sm text-muted-foreground">
                    Describe the initial site work to be undertaken before the main activity begins.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="commencement_date" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Proposed Commencement Date *
                    </Label>
                    <Input
                      id="commencement_date"
                      type="date"
                      value={formData.commencement_date}
                      onChange={(e) => setFormData({ ...formData, commencement_date: e.target.value })}
                      required
                      className="bg-glass/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="completion_date" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Proposed Completion Date *
                    </Label>
                    <Input
                      id="completion_date"
                      type="date"
                      value={formData.completion_date}
                      onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                      required
                      className="bg-glass/50"
                    />
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="space-y-4 pt-6 border-t border-glass">
                  <div className="flex items-center justify-between">
                    <Label>Supporting Documents</Label>
                    <div className="relative">
                      <Input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Upload Documents'}
                      </Button>
                    </div>
                  </div>

                  {submittedIntentId ? (
                    docsLoading ? (
                      <p className="text-sm text-muted-foreground">Loading documents...</p>
                    ) : documents.length > 0 ? (
                      <div className="space-y-2">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-glass/30 rounded-lg">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-sm truncate">{doc.filename}</span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                ({(doc.file_size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadDocument(doc.file_path, doc.filename)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDocument(doc.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                    )
                  ) : (
                    pendingLoading ? (
                      <p className="text-sm text-muted-foreground">Loading documents...</p>
                    ) : pendingDocuments.length > 0 ? (
                      <div className="space-y-2">
                        {pendingDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-glass/30 rounded-lg">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-sm truncate">{doc.filename}</span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                ({(doc.file_size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadDocument(doc.file_path, doc.filename)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDocument(doc.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                    )
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-glass">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        entity_id: '',
                        activity_level: '',
                        activity_description: '',
                        preparatory_work_description: '',
                        commencement_date: '',
                        completion_date: '',
                      });
                      setSubmittedIntentId(undefined);
                    }}
                  >
                    Clear Form
                  </Button>
                  <Button type="submit" disabled={submitting || entitiesLoading}>
                    {submitting ? 'Submitting...' : 'Submit Registration'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="feedback">
          <Card className="bg-glass/50 backdrop-blur-sm border-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Official Feedback
              </CardTitle>
              <CardDescription>
                Registry team feedback will appear here after your submission is reviewed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!submittedIntentId ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Submit your intent registration to receive official feedback from the Registry team.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {currentIntent?.review_notes && (
                    <div className="space-y-2">
                      <Label>Review Notes</Label>
                      <div className="p-4 bg-glass/30 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{currentIntent.review_notes}</p>
                      </div>
                      {currentIntent.reviewed_at && (
                        <p className="text-xs text-muted-foreground">
                          Reviewed on {new Date(currentIntent.reviewed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {currentIntent?.official_feedback_attachments && 
                   currentIntent.official_feedback_attachments.length > 0 && (
                    <div className="space-y-2">
                      <Label>Official Feedback Documents</Label>
                      <div className="space-y-2">
                        {currentIntent.official_feedback_attachments.map((doc: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-glass/30 rounded-lg">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-sm truncate">{doc.filename || `Document ${index + 1}`}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadDocument(doc.file_path, doc.filename)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!currentIntent?.review_notes && 
                   (!currentIntent?.official_feedback_attachments || 
                    currentIntent.official_feedback_attachments.length === 0) && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No official feedback available yet. The Registry team will provide feedback once they review your submission.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
