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

export function useDocuments(permitId?: string, intentRegistrationId?: string) {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (permitId || intentRegistrationId) {
      loadDocuments();
    }
  }, [permitId, intentRegistrationId]);

  const loadDocuments = async () => {
    if (!permitId && !intentRegistrationId) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      let query = supabase.from('documents').select('*');
      
      if (permitId) {
        query = query.eq('permit_id', permitId);
      }
      
      if (intentRegistrationId) {
        query = query.eq('intent_registration_id', intentRegistrationId);
      }
      
      const { data, error } = await query.order('uploaded_at', { ascending: false });

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

  const uploadDocument = async (file: File, permitId?: string, intentRegistrationId?: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Upload file to storage
      const fileName = `${Date.now()}-${Math.random()}.${file.name.split('.').pop()}`;
      const folder = intentRegistrationId ? 'intent-documents' : 'permit-documents';
      const filePath = `${user.user.id}/${folder}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Save document record to database
      const insertData: any = {
        filename: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        user_id: user.user.id,
      };
      
      if (permitId) insertData.permit_id = permitId;
      if (intentRegistrationId) insertData.intent_registration_id = intentRegistrationId;
      
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert(insertData)
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

  // Upload a draft document (unlinked) before intent submission
  const uploadDraftDocument = async (file: File, documentType: string = 'intent_draft') => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const fileName = `${Date.now()}-${Math.random()}.${file.name.split('.').pop()}`;
      const filePath = `${user.user.id}/intent-drafts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          filename: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          user_id: user.user.id,
          document_type: documentType
        })
        .select()
        .single();

      if (docError) throw docError;
      return docData as DocumentInfo;
    } catch (error) {
      console.error('Error uploading draft document:', error);
      toast({ title: 'Error', description: 'Failed to upload draft document', variant: 'destructive' });
      throw error;
    }
  };

  // Fetch user's unlinked draft documents for this flow
  const fetchUserDraftDocuments = async (documentType: string = 'intent_draft') => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.user.id)
        .is('intent_registration_id', null)
        .eq('document_type', documentType)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return (data || []) as DocumentInfo[];
    } catch (error) {
      console.error('Error fetching draft documents:', error);
      toast({ title: 'Error', description: 'Failed to load draft documents', variant: 'destructive' });
      return [] as DocumentInfo[];
    }
  };

  // Create linked records for existing draft files after submission
  const linkDraftsToIntent = async (draftDocs: DocumentInfo[], intentRegistrationId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');
      if (!draftDocs?.length) return [] as DocumentInfo[];

      const insertRows = draftDocs.map(d => ({
        filename: d.filename,
        file_path: d.file_path,
        file_size: d.file_size,
        mime_type: d.mime_type,
        user_id: user.user.id,
        intent_registration_id: intentRegistrationId
      }));

      const { data, error } = await supabase
        .from('documents')
        .insert(insertRows)
        .select();
      if (error) throw error;
      return (data || []) as DocumentInfo[];
    } catch (error) {
      console.error('Error linking draft documents:', error);
      toast({ title: 'Error', description: 'Failed to link documents to intent', variant: 'destructive' });
      return [] as DocumentInfo[];
    }
  };

  // Delete only the DB record (keep storage file) – used to remove draft rows after linking
  const deleteDocumentRecordOnly = async (documentId: string) => {
    try {
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      if (dbError) throw dbError;
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Error deleting document record:', error);
      toast({ title: 'Error', description: 'Failed to delete document record', variant: 'destructive' });
    }
  };

  return {
    documents,
    loading,
    uploadDocument,
    uploadDraftDocument,
    deleteDocument,
    deleteDocumentRecordOnly,
    refreshDocuments: loadDocuments,
    fetchUserDraftDocuments,
    linkDraftsToIntent
  };
}