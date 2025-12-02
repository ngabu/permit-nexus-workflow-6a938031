import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IndustrialSector {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const useIndustrialSectors = () => {
  const [industrialSectors, setIndustrialSectors] = useState<IndustrialSector[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndustrialSectors = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await supabase
          .from('industrial_sectors')
          .select('*')
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;

        setIndustrialSectors(data || []);
      } catch (err) {
        console.error('Error fetching industrial sectors:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch industrial sectors');
        setIndustrialSectors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIndustrialSectors();
  }, []);

  return { industrialSectors, loading, error };
};
