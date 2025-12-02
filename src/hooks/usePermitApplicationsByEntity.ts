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
        const { data, error } = await supabase
          .from('permit_applications')
          .select('id, title, permit_number, permit_type, status, entity_id, entity_name')
          .eq('entity_id', entityId)
          .in('status', ['approved', 'submitted', 'under_review'])
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching permit applications:', error);
          setApplications([]);
        } else {
          setApplications(data || []);
        }
      } catch (error) {
        console.error('Error fetching permit applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [entityId]);

  return { applications, loading };
}
