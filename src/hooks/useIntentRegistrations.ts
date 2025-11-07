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
      const { data, error } = await supabase
        .from('intent_registrations')
        .select(`
          *,
          entity:entities!inner(id, name, entity_type)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch reviewer profiles separately and properly type the data
      const intentsWithReviewer = await Promise.all(
        (data || []).map(async (intent) => {
          const typedIntent = {
            ...intent,
            official_feedback_attachments: intent.official_feedback_attachments 
              ? (Array.isArray(intent.official_feedback_attachments) 
                ? intent.official_feedback_attachments 
                : [])
              : null,
          } as IntentRegistration;

          if (intent.reviewed_by) {
            const { data: reviewer } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, email')
              .eq('user_id', intent.reviewed_by)
              .single();
            return { ...typedIntent, reviewer };
          }
          return typedIntent;
        })
      );

      setIntents(intentsWithReviewer);
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
