import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EntityPermit {
  id: string;
  title: string;
  permit_number: string | null;
  permit_type: string;
  status: string;
  approval_date: string | null;
}

export function useEntityPermits(entityId: string | null) {
  const [permits, setPermits] = useState<EntityPermit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEntityPermits = async () => {
      if (!entityId) {
        setPermits([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('permit_applications')
          .select('id, title, permit_number, permit_type, status, approval_date')
          .eq('entity_id', entityId)
          .eq('status', 'approved')
          .order('approval_date', { ascending: false });

        if (error) throw error;
        setPermits(data || []);
      } catch (error) {
        console.error('Error fetching entity permits:', error);
        setPermits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEntityPermits();
  }, [entityId]);

  return { permits, loading };
}
