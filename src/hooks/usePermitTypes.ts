import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PermitType {
  id: string;
  name: string;
  display_name: string;
  category: string;
  icon_name: string | null;
  jsonb_column_name: string;
  is_active: boolean;
  sort_order: number;
}

export const usePermitTypes = () => {
  const [permitTypes, setPermitTypes] = useState<PermitType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermitTypes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await supabase
          .from('permit_types')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (fetchError) throw fetchError;

        setPermitTypes(data || []);
      } catch (err) {
        console.error('Error fetching permit types:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch permit types');
        setPermitTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermitTypes();
  }, []);

  return { permitTypes, loading, error };
};
