import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IntentRegistration {
  id: string;
  user_id: string;
  entity_id: string;
  activity_level: string;
  activity_description: string;
  preparatory_work_description: string;
  commencement_date: string;
  completion_date: string;
  status: string;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  official_feedback_attachments: any[] | null;
  project_site_address: string | null;
  project_site_description: string | null;
  site_ownership_details: string | null;
  government_agreement: string | null;
  departments_approached: string | null;
  approvals_required: string | null;
  landowner_negotiation_status: string | null;
  estimated_cost_kina: number | null;
  prescribed_activity_id: string | null;
  created_at: string;
  updated_at: string;
  entity?: {
    id: string;
    name: string;
    entity_type: string;
  };
  reviewer?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

export function useIntentRegistrations(userId?: string) {
  const [intents, setIntents] = useState<IntentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    
    fetchIntents();
  }, [userId]);

  const fetchIntents = async () => {
    try {
      setLoading(true);
      
      // Use the secure function to get intent registrations with reviewer info
      const { data, error } = await supabase
        .rpc('get_intent_registrations_with_reviewer', { requesting_user_id: userId });

      if (error) throw error;

      // Fetch entity information and map reviewer data
      const intentsWithEntity = await Promise.all(
        (data || []).map(async (intent: any) => {
          // Fetch entity info
          const { data: entity } = await supabase
            .from('entities')
            .select('id, name, entity_type')
            .eq('id', intent.entity_id)
            .maybeSingle();

          return {
            ...intent,
            official_feedback_attachments: intent.official_feedback_attachments 
              ? (Array.isArray(intent.official_feedback_attachments) 
                ? intent.official_feedback_attachments 
                : [])
              : null,
            entity: entity || undefined,
            reviewer: intent.reviewer_first_name ? {
              id: intent.reviewed_by,
              first_name: intent.reviewer_first_name,
              last_name: intent.reviewer_last_name,
              email: intent.reviewer_email
            } : undefined
          } as IntentRegistration;
        })
      );

      setIntents(intentsWithEntity);
    } catch (error) {
      console.error('Error fetching intent registrations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch intent registrations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchIntents();

  return { intents, loading, refetch };
}
