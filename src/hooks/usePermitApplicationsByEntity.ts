import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PermitApplication {
  id: string;
  title: string;
  permit_number: string | null;
  permit_type: string;
  status: string;
  entity_id: string;
  entity_name: string;
  type: 'permit' | 'intent';
}

export function usePermitApplicationsByEntity(entityId: string | null) {
  const [applications, setApplications] = useState<PermitApplication[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!entityId) {
      setApplications([]);
      return;
    }

    const fetchApplications = async () => {
      setLoading(true);
      try {
        // Fetch permit applications with approved and under review statuses
        const { data: permits, error: permitsError } = await supabase
          .from('permit_applications')
          .select('id, title, permit_number, permit_type, status, entity_id, entity_name')
          .eq('entity_id', entityId)
          .in('status', ['approved', 'submitted', 'under_review', 'pending'])
          .order('created_at', { ascending: false });

        if (permitsError) {
          console.error('Error fetching permit applications:', permitsError);
        }

        // Fetch intent registrations with approved and under review statuses
        const { data: intents, error: intentsError } = await supabase
          .from('intent_registrations')
          .select('id, activity_description, activity_level, status, entity_id')
          .eq('entity_id', entityId)
          .in('status', ['approved', 'pending', 'under_review', 'submitted', 'registry_review', 'compliance_review', 'md_review'])
          .order('created_at', { ascending: false });

        if (intentsError) {
          console.error('Error fetching intent registrations:', intentsError);
        }

        // Map permits to common format
        const mappedPermits: PermitApplication[] = (permits || []).map(permit => ({
          id: permit.id,
          title: permit.title,
          permit_number: permit.permit_number,
          permit_type: permit.permit_type,
          status: permit.status,
          entity_id: permit.entity_id,
          entity_name: permit.entity_name || '',
          type: 'permit' as const
        }));

        // Map intents to common format
        const mappedIntents: PermitApplication[] = (intents || []).map(intent => ({
          id: intent.id,
          title: `Intent: ${intent.activity_description?.substring(0, 50)}${(intent.activity_description?.length || 0) > 50 ? '...' : ''}`,
          permit_number: null,
          permit_type: `Intent - Level ${intent.activity_level}`,
          status: intent.status,
          entity_id: intent.entity_id,
          entity_name: '',
          type: 'intent' as const
        }));

        // Combine and set applications
        setApplications([...mappedIntents, ...mappedPermits]);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [entityId]);

  return { applications, loading };
}
