import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DirectorateApproval {
  id: string;
  application_id: string;
  application_type: string;
  intent_registration_id: string | null;
  submitted_by: string;
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  approval_status: string;
  approval_notes: string | null;
  letter_signed: boolean;
  letter_signed_at: string | null;
  docusign_envelope_id: string | null;
  priority: string;
  created_at: string;
  updated_at: string;
  application?: {
    id: string;
    title: string;
    permit_type: string;
    entity_name: string;
    status: string;
  };
}

export function useDirectorateApprovals() {
  const [approvals, setApprovals] = useState<DirectorateApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('directorate_approvals')
        .select(`
          *,
          permit_applications!inner (
            id,
            title,
            permit_type,
            entity_name,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map(item => ({
        ...item,
        application: item.permit_applications
      }));

      setApprovals(transformedData);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch approvals.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApprovalStatus = async (
    approvalId: string,
    status: 'approved' | 'rejected' | 'revoked' | 'cancelled',
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('directorate_approvals')
        .update({
          approval_status: status,
          approval_notes: notes,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', approvalId);

      if (error) throw error;

      // Update the corresponding permit application status
      const approval = approvals.find(a => a.id === approvalId);
      if (approval) {
        let permitStatus = '';
        if (status === 'approved') permitStatus = 'approved';
        else if (status === 'rejected') permitStatus = 'rejected';
        else if (status === 'revoked') permitStatus = 'revoked';
        else if (status === 'cancelled') permitStatus = 'cancelled';

        if (permitStatus) {
          await supabase
            .from('permit_applications')
            .update({ status: permitStatus })
            .eq('id', approval.application_id);
        }
      }

      toast({
        title: "Success",
        description: `Application ${status} successfully.`,
      });

      fetchApprovals();
      return { success: true };
    } catch (error) {
      console.error('Error updating approval:', error);
      toast({
        title: "Error",
        description: "Failed to update approval status.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const markLetterSigned = async (approvalId: string, envelopeId?: string) => {
    try {
      const { error } = await supabase
        .from('directorate_approvals')
        .update({
          letter_signed: true,
          letter_signed_at: new Date().toISOString(),
          docusign_envelope_id: envelopeId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', approvalId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Letter marked as signed.",
      });

      fetchApprovals();
      return { success: true };
    } catch (error) {
      console.error('Error marking letter as signed:', error);
      toast({
        title: "Error",
        description: "Failed to mark letter as signed.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  return {
    approvals,
    loading,
    updateApprovalStatus,
    markLetterSigned,
    refetch: fetchApprovals,
  };
}
