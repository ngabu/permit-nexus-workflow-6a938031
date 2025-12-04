import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileText, Download, Plus, Book, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  document_type: 'template' | 'guide';
  category: string;
  file_path: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const templateCategories = ['Form template', 'Report template', 'Assessment template', 'Checklist template'];
const guideCategories = ['User guide', 'Regulatory guideline', 'Process guide', 'Information'];

export function RegistryDocumentManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentTemplate | null>(null);
  const [documentType, setDocumentType] = useState<'template' | 'guide'>('template');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
  });

  const { data: documents, isLoading } = useQuery({
    queryKey: ['document-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DocumentTemplate[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; document_type: string; category: string }) => {
      const { error } = await supabase
        .from('document_templates')
        .insert({
          name: data.name,
          description: data.description || null,
          document_type: data.document_type,
          category: data.category,
          created_by: user?.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast.success(`${documentType === 'template' ? 'Template' : 'Guide'} created successfully`);
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to create: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; description: string; category: string }) => {
      const { error } = await supabase
        .from('document_templates')
        .update({
          name: data.name,
          description: data.description || null,
          category: data.category,
        })
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast.success('Document updated successfully');
      setIsEditDialogOpen(false);
      setSelectedDocument(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast.success('Document deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedDocument(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', category: '' });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate({
      name: formData.name,
      description: formData.description,
      document_type: documentType,
      category: formData.category,
    });
  };

  const handleEdit = (doc: DocumentTemplate) => {
    setSelectedDocument(doc);
    setFormData({
      name: doc.name,
      description: doc.description || '',
      category: doc.category,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedDocument || !formData.name || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    updateMutation.mutate({
      id: selectedDocument.id,
      name: formData.name,
      description: formData.description,
      category: formData.category,
    });
  };

  const handleDelete = (doc: DocumentTemplate) => {
    setSelectedDocument(doc);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDocument) {
      deleteMutation.mutate(selectedDocument.id);
    }
  };

  const openCreateDialog = (type: 'template' | 'guide') => {
    setDocumentType(type);
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const templates = documents?.filter(d => d.document_type === 'template') || [];
  const guides = documents?.filter(d => d.document_type === 'guide') || [];

  const renderDocumentCard = (doc: DocumentTemplate, icon: React.ReactNode, iconBgClass: string) => (
    <Card key={doc.id} className="border hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-lg ${iconBgClass} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground text-sm leading-tight">{doc.name}</h4>
            <p className="text-sm text-primary mt-1">{doc.category}</p>
            {doc.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9" title="Download">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleEdit(doc)} title="Edit">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 text-destructive hover:text-destructive" onClick={() => handleDelete(doc)} title="Delete">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Documents Management</h2>
          <p className="text-muted-foreground mt-1">Manage templates, guides, and information documents</p>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
          <TabsTrigger value="info-guidelines">Information and Guidelines ({guides.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <Card className="border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Document Templates</h2>
                <Button onClick={() => openCreateDialog('template')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>

              {templates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No templates created yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((doc) => 
                    renderDocumentCard(
                      doc, 
                      <FileText className="w-5 h-5 text-blue-500" />,
                      "bg-blue-50 dark:bg-blue-950"
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info-guidelines" className="mt-6">
          <Card className="border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Information and Guidelines</h2>
                <Button onClick={() => openCreateDialog('guide')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Guide
                </Button>
              </div>

              {guides.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No guides created yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {guides.map((doc) => 
                    renderDocumentCard(
                      doc,
                      <Book className="w-5 h-5 text-purple-500" />,
                      "bg-purple-50 dark:bg-purple-950"
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create {documentType === 'template' ? 'Template' : 'Guide'}</DialogTitle>
            <DialogDescription>
              Add a new {documentType === 'template' ? 'document template' : 'information guide'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={`Enter ${documentType} name`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(documentType === 'template' ? templateCategories : guideCategories).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {selectedDocument?.document_type === 'template' ? 'Template' : 'Guide'}</DialogTitle>
            <DialogDescription>
              Update the document details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(selectedDocument?.document_type === 'template' ? templateCategories : guideCategories).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedDocument?.document_type === 'template' ? 'Template' : 'Guide'}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedDocument?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
