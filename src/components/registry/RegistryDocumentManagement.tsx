import { useState, useRef } from "react";
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
import { FileText, Download, Plus, Book, Pencil, Trash2, Loader2, Upload, X } from "lucide-react";
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

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function RegistryDocumentManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentTemplate | null>(null);
  const [documentType, setDocumentType] = useState<'template' | 'guide'>('template');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
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
    mutationFn: async (data: { name: string; description: string; document_type: string; category: string; file_path: string }) => {
      const { error } = await supabase
        .from('document_templates')
        .insert({
          name: data.name,
          description: data.description || null,
          document_type: data.document_type,
          category: data.category,
          file_path: data.file_path,
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
    mutationFn: async (data: { id: string; name: string; description: string; category: string; file_path?: string }) => {
      const updateData: Record<string, unknown> = {
        name: data.name,
        description: data.description || null,
        category: data.category,
      };
      
      if (data.file_path) {
        updateData.file_path = data.file_path;
      }
      
      const { error } = await supabase
        .from('document_templates')
        .update(updateData)
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
    mutationFn: async (doc: DocumentTemplate) => {
      // Delete file from storage if it exists
      if (doc.file_path) {
        await supabase.storage.from('documents').remove([doc.file_path]);
      }
      
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', doc.id);
      
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
    setSelectedFile(null);
    setEditFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const uploadFile = async (file: File, docType: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${docType}s/${fileName}`;
    
    const { error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    return filePath;
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!selectedFile) {
      toast.error(`Please upload a ${documentType} file`);
      return;
    }
    
    setIsUploading(true);
    try {
      const filePath = await uploadFile(selectedFile, documentType);
      
      await createMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
        document_type: documentType,
        category: formData.category,
        file_path: filePath,
      });
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (doc: DocumentTemplate) => {
    setSelectedDocument(doc);
    setFormData({
      name: doc.name,
      description: doc.description || '',
      category: doc.category,
    });
    setEditFile(null);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedDocument || !formData.name || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsUploading(true);
    try {
      let filePath = selectedDocument.file_path;
      
      if (editFile) {
        // Delete old file if exists
        if (selectedDocument.file_path) {
          await supabase.storage.from('documents').remove([selectedDocument.file_path]);
        }
        // Upload new file
        filePath = await uploadFile(editFile, selectedDocument.document_type);
      }
      
      await updateMutation.mutateAsync({
        id: selectedDocument.id,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        file_path: filePath || undefined,
      });
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Failed to update document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (doc: DocumentTemplate) => {
    setSelectedDocument(doc);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDocument) {
      deleteMutation.mutate(selectedDocument);
    }
  };

  const openCreateDialog = (type: 'template' | 'guide') => {
    setDocumentType(type);
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleDownload = async (doc: DocumentTemplate) => {
    if (!doc.file_path) {
      toast.error('No file available for download');
      return;
    }
    
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);
      
      if (error) throw error;
      
      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name + '.' + doc.file_path.split('.').pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isEdit) {
        setEditFile(file);
      } else {
        setSelectedFile(file);
      }
    }
  };

  const removeFile = (isEdit: boolean = false) => {
    if (isEdit) {
      setEditFile(null);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    } else {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
            {doc.file_path && (
              <p className="text-xs text-green-600 mt-1">File attached</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9" 
            title="Download"
            onClick={() => handleDownload(doc)}
            disabled={!doc.file_path}
          >
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
            <div className="space-y-2">
              <Label htmlFor="file">Upload {documentType === 'template' ? 'Template' : 'Guide'} File *</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileSelect(e, false)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                className="cursor-pointer"
              />
              {selectedFile && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(selectedFile.size)})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending || isUploading}>
              {(createMutation.isPending || isUploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
            <div className="space-y-2">
              <Label htmlFor="edit-file">Replace File (optional)</Label>
              {selectedDocument?.file_path && !editFile && (
                <p className="text-sm text-green-600 mb-2">Current file attached</p>
              )}
              <Input
                id="edit-file"
                type="file"
                ref={editFileInputRef}
                onChange={(e) => handleFileSelect(e, true)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                className="cursor-pointer"
              />
              {editFile && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">{editFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(editFile.size)})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(true)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending || isUploading}>
              {(updateMutation.isPending || isUploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
