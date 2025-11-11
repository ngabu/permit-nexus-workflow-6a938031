import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IntentDraft {
  id: string;
  user_id: string;
  entity_id: string | null;
  activity_level: string | null;
  activity_description: string | null;
  preparatory_work_description: string | null;
  commencement_date: string | null;
  completion_date: string | null;
  draft_name: string | null;
  project_site_address: string | null;
  project_site_description: string | null;
  site_ownership_details: string | null;
  government_agreement: string | null;
  departments_approached: string | null;
  approvals_required: string | null;
  landowner_negotiation_status: string | null;
  estimated_cost_kina: number | null;
  prescribed_activity_id: string | null;
  existing_permit_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useIntentDrafts(userId?: string) {
  const [drafts, setDrafts] = useState<IntentDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchDrafts();
    }
  }, [userId]);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('intent_registration_drafts')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDrafts((data || []) as IntentDraft[]);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast({
        title: "Error",
        description: "Failed to load drafts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async (draftData: Partial<IntentDraft>, draftId?: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      if (draftId) {
        // Update existing draft
        const { data, error } = await supabase
          .from('intent_registration_drafts')
          .update({
            ...draftData,
            updated_at: new Date().toISOString()
          })
          .eq('id', draftId)
          .select()
          .single();

        if (error) throw error;

        setDrafts(prev => prev.map(d => d.id === draftId ? data as IntentDraft : d));
        
        toast({
          title: "Draft Updated",
          description: "Your progress has been saved"
        });

        return data;
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from('intent_registration_drafts')
          .insert({
            ...draftData,
            user_id: user.user.id,
            draft_name: draftData.draft_name || `Draft - ${new Date().toLocaleDateString()}`
          })
          .select()
          .single();

        if (error) throw error;

        setDrafts(prev => [data as IntentDraft, ...prev]);
        
        toast({
          title: "Draft Saved",
          description: "Your progress has been saved as a new draft"
        });

        return data;
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteDraft = async (draftId: string) => {
    try {
      const { error } = await supabase
        .from('intent_registration_drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;

      setDrafts(prev => prev.filter(d => d.id !== draftId));
      
      toast({
        title: "Draft Deleted",
        description: "Draft has been removed"
      });
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast({
        title: "Error",
        description: "Failed to delete draft",
        variant: "destructive"
      });
    }
  };

  return {
    drafts,
    loading,
    saveDraft,
    deleteDraft,
    refreshDrafts: fetchDrafts
  };
}
