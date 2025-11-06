import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DocumentInfo {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  user_id: string;
  permit_id?: string;
}

export function useDocuments(permitId?: string) {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (permitId) {
      loadDocuments();
    }
  }, [permitId]);

  const loadDocuments = async () => {
    if (!permitId) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('permit_id', permitId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, permitId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Upload file to storage
      const fileName = `${Date.now()}-${Math.random()}.${file.name.split('.').pop()}`;
      const filePath = `${user.user.id}/permit-documents/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Save document record to database
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          filename: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          user_id: user.user.id,
          permit_id: permitId
        })
        .select()
        .single();

      if (docError) throw docError;

      setDocuments(prev => [docData, ...prev]);
      
      toast({
        title: "Success",
        description: "Document uploaded successfully"
      });

      return docData;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const document = documents.find(doc => doc.id === documentId);
      if (!document) return;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) {
        console.warn('Failed to delete from storage:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast({
        title: "Success",
        description: "Document deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  return {
    documents,
    loading,
    uploadDocument,
    deleteDocument,
    refreshDocuments: loadDocuments
  };
}