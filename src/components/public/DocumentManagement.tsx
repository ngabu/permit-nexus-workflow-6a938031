import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Download, Trash2, Eye, Filter, FolderOpen, X, Loader2, Book } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';

interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  document_type: 'template' | 'guide';
  category: string;
  file_path: string | null;
  is_active: boolean;
}

interface DocumentFile {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  permit_id?: string;
  document_type?: string;
}

const categories = [
  { id: 'all', name: 'All Documents' },
  { id: 'project_details', name: 'Project Details' },
  { id: 'environmental_assessment', name: 'Environmental Assessment' },
  { id: 'monitoring', name: 'Monitoring' },
  { id: 'compliance_reports', name: 'Compliance Reports' },
  { id: 'inspection_reports', name: 'Inspection Reports' },
  { id: 'notices', name: 'Notices' },
  { id: 'safety', name: 'Safety' },
];

// Categories available for upload (excluding 'all')
const uploadCategories = categories.filter(cat => cat.id !== 'all');

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-700 border-green-200';
    case 'under_review': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'needs_revision': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'approved': return 'Approved';
    case 'under_review': return 'Under Review';
    case 'needs_revision': return 'Needs Revision';
    default: return status;
  }
};

// Templates Tab Component
function TemplatesTab() {
  const { toast } = useToast();
  const { data: templates, isLoading } = useQuery({
    queryKey: ['document-templates', 'template'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('document_type', 'template')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as DocumentTemplate[];
    },
  });

  const handleDownload = async (template: DocumentTemplate) => {
    if (!template.file_path) {
      toast({
        title: "No File",
        description: "No file available for download",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(template.file_path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = template.name + '.' + template.file_path.split('.').pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `Downloading ${template.name}`,
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download template",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border">
        <CardContent className="p-6 flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Document Templates</h2>
        </div>

        {templates?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No templates available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates?.map((template) => (
              <Card key={template.id} className="border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm leading-tight">{template.name}</h4>
                      <p className="text-sm text-primary mt-1">{template.category}</p>
                      {template.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                      )}
                      {template.file_path && (
                        <p className="text-xs text-green-600 mt-1">File available</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(template)}
                      disabled={!template.file_path}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Guides Tab Component
function GuidesTab() {
  const { toast } = useToast();
  const { data: guides, isLoading } = useQuery({
    queryKey: ['document-templates', 'guide'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('document_type', 'guide')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as DocumentTemplate[];
    },
  });

  const handleDownload = async (guide: DocumentTemplate) => {
    if (!guide.file_path) {
      toast({
        title: "No File",
        description: "No file available for download",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(guide.file_path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = guide.name + '.' + guide.file_path.split('.').pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `Downloading ${guide.name}`,
      });
    } catch (error) {
      console.error('Error downloading guide:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download guide",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border">
        <CardContent className="p-6 flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Information and Guidelines</h2>
        </div>

        {guides?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No guides available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides?.map((guide) => (
              <Card key={guide.id} className="border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center flex-shrink-0">
                      <Book className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm leading-tight">{guide.name}</h4>
                      <p className="text-sm text-primary mt-1">{guide.category}</p>
                      {guide.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{guide.description}</p>
                      )}
                      {guide.file_path && (
                        <p className="text-xs text-green-600 mt-1">File available</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(guide)}
                      disabled={!guide.file_path}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DocumentManagement() {
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadWithCategory = async () => {
    if (!selectedFile || !uploadCategory || !user) {
      toast({
        title: "Missing Information",
        description: "Please select a file and category",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          filename: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          user_id: user.id,
          document_type: uploadCategory,
        });

      if (dbError) throw dbError;

      await fetchDocuments();

      toast({
        title: "Upload Successful",
        description: "Document uploaded successfully.",
      });

      // Reset form and close dialog
      setSelectedFile(null);
      setUploadCategory('');
      setIsUploadDialogOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (fileId: string, filename: string, filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading ${filename}`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (fileId: string, filePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      await fetchDocuments();

      toast({
        title: "File Deleted",
        description: "File has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryCounts = () => {
    const counts: Record<string, number> = { all: files.length };
    categories.forEach(cat => {
      if (cat.id !== 'all') {
        counts[cat.id] = files.filter(f => f.document_type === cat.id).length;
      }
    });
    return counts;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'General Document';
  };

  const filteredFiles = files.filter(file => {
    const matchesCategory = selectedCategory === 'all' || file.document_type === selectedCategory;
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = getCategoryCounts();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading documents...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="my-documents" className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="my-documents">My Documents</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="info-guidelines">Information and Guidelines</TabsTrigger>
        </TabsList>

        <TabsContent value="my-documents" className="mt-6">
          <Card className="border">
            <CardContent className="p-0">
              {/* Header with Upload Button */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-foreground">My Documents</h2>
                <Button 
                  className="bg-foreground text-background hover:bg-foreground/90"
                  onClick={() => setIsUploadDialogOpen(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>

              <div className="flex">
                {/* Categories Sidebar */}
                <div className="w-72 border-r p-6">
                  <h3 className="font-semibold text-foreground mb-4">Categories</h3>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                          selectedCategory === category.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FolderOpen className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{category.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 flex-shrink-0 ml-2">
                          {categoryCounts[category.id] || 0}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Documents List */}
                <div className="flex-1 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-foreground">Documents</h3>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Input
                          placeholder="Search documents..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-64 pl-3 pr-10"
                        />
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="space-y-3">
                    {filteredFiles.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No documents found</h3>
                        <p className="text-sm text-muted-foreground">
                          Upload your first document using the upload button above
                        </p>
                      </div>
                    ) : (
                      filteredFiles.map((file) => (
                        <Card key={file.id} className="border hover:border-primary/30 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-blue-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground truncate">{file.filename}</h4>
                                <p className="text-sm text-primary">{getCategoryName(file.document_type || '')}</p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                  <span>Size: {formatFileSize(file.file_size)}</span>
                                  <span>Uploaded: {new Date(file.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={cn("text-xs border", getStatusColor('approved'))}>
                                  {getStatusLabel('approved')}
                                </Badge>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDownload(file.id, file.filename, file.file_path)}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(file.id, file.file_path)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplatesTab />
        </TabsContent>

        <TabsContent value="info-guidelines" className="mt-6">
          <GuidesTab />
        </TabsContent>
      </Tabs>

      {/* Upload Document Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Select a category and upload your document.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="upload-category">Document Category</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  {uploadCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-file">Document File</Label>
              <Input
                id="upload-file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              />
              {selectedFile && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(selectedFile.size)})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadDialogOpen(false);
                setSelectedFile(null);
                setUploadCategory('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadWithCategory}
              disabled={!selectedFile || !uploadCategory || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
