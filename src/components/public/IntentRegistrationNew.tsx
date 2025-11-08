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
import { useIntentDrafts } from '@/hooks/useIntentDrafts';
import { Building, User, Calendar, AlertCircle, FileText, Upload, Trash2, Download, Save, FolderOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export function IntentRegistrationNew() {
  const { user } = useAuth();
  const { entities, loading: entitiesLoading } = useEntities();
  const { toast } = useToast();
  const { uploadDraftDocument, fetchUserDraftDocuments, linkDraftsToIntent, deleteDocument: deleteDocumentFn } = useDocuments();
  const { drafts, loading: draftsLoading, saveDraft, deleteDraft } = useIntentDrafts(user?.id);
  
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
  const [draftDocuments, setDraftDocuments] = useState<DocumentInfo[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(undefined);
  const [showDrafts, setShowDrafts] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);

  const handleSaveDraft = async () => {
    try {
      const draft = await saveDraft({
        entity_id: formData.entity_id || null,
        activity_level: formData.activity_level || null,
        activity_description: formData.activity_description || null,
        preparatory_work_description: formData.preparatory_work_description || null,
        commencement_date: formData.commencement_date || null,
        completion_date: formData.completion_date || null,
      }, currentDraftId);
      
      if (!currentDraftId) {
        setCurrentDraftId(draft.id);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleLoadDraft = (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
      setFormData({
        entity_id: draft.entity_id || '',
        activity_level: draft.activity_level || '',
        activity_description: draft.activity_description || '',
        preparatory_work_description: draft.preparatory_work_description || '',
        commencement_date: draft.commencement_date || '',
        completion_date: draft.completion_date || '',
      });
      setCurrentDraftId(draft.id);
      setShowDrafts(false);
      toast({
        title: "Draft Loaded",
        description: "Your draft has been loaded successfully"
      });
    }
  };

  const handleDeleteDraftClick = (draftId: string) => {
    setDraftToDelete(draftId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (draftToDelete) {
      await deleteDraft(draftToDelete);
      setDeleteDialogOpen(false);
      setDraftToDelete(null);
    }
  };

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

      // Link uploaded draft documents to the intent
      if (draftDocuments.length > 0) {
        await linkDraftsToIntent(draftDocuments, data.id);
      }

      // Delete the draft after successful submission
      if (currentDraftId) {
        await deleteDraft(currentDraftId);
      }

      toast({
        title: "Intent Registration Submitted",
        description: "Your registration of intent has been submitted successfully with all documents.",
      });

      setFormData({
        entity_id: '',
        activity_level: '',
        activity_description: '',
        preparatory_work_description: '',
        commencement_date: '',
        completion_date: '',
      });
      setDraftDocuments([]);
      setCurrentDraftId(undefined);
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
      for (let i = 0; i < files.length; i++) {
        const uploadedDoc = await uploadDraftDocument(files[i], 'intent_draft');
        setDraftDocuments(prev => [uploadedDoc, ...prev]);
      }
      toast({
        title: "Documents Uploaded",
        description: "Documents will be attached when you submit the form.",
      });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await deleteDocumentFn(docId);
      setDraftDocuments(prev => prev.filter(doc => doc.id !== docId));
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
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">New Intent Registration</h2>
          <p className="text-muted-foreground mt-2">
            Register your intention to carry out preparatory work for Level 2 or Level 3 activities (Section 48, Environment Act 2000)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDrafts(!showDrafts)}
            disabled={draftsLoading}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            My Drafts {drafts.length > 0 && `(${drafts.length})`}
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      {showDrafts && drafts.length > 0 && (
        <Card className="bg-glass/50 backdrop-blur-sm border-glass">
          <CardHeader>
            <CardTitle>Saved Drafts</CardTitle>
            <CardDescription>Load a previous draft to continue working on it</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {drafts.map((draft) => (
              <div key={draft.id} className="flex items-center justify-between p-3 bg-glass/30 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {draft.draft_name || `Draft - ${new Date(draft.created_at).toLocaleDateString()}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(draft.updated_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLoadDraft(draft.id)}
                  >
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteDraftClick(draft.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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

                  {draftDocuments.length > 0 ? (
                    <div className="space-y-2">
                      {draftDocuments.map((doc) => (
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
                      setDraftDocuments([]);
                      setCurrentDraftId(undefined);
                    }}
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSaveDraft}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
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
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Submit your intent registration to receive official feedback from the Registry team.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this draft? This action cannot be undone and all saved progress will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
