import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ApprovedPermit {
  id: string;
  title: string;
  permit_number: string | null;
  entity_name: string | null;
  coordinates: { lat: number; lng: number } | null;
  activity_level: number | null;
  permit_type: string;
  status: string;
}

export function useApprovedPermits() {
  const [permits, setPermits] = useState<ApprovedPermit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedPermits = async () => {
      try {
        const { data, error } = await supabase
          .from('permit_applications')
          .select(`
            id,
            title,
            permit_number,
            entity_name,
            coordinates,
            activity_level,
            permit_type,
            status
          `)
          .eq('status', 'approved')
          .not('coordinates', 'is', null);

        if (error) throw error;

        const formattedPermits = (data || [])
          .filter(permit => {
            // Ensure coordinates exist and are valid
            if (!permit.coordinates) return false;
            const coords = permit.coordinates as any;
            return coords.lat && coords.lng && !isNaN(coords.lat) && !isNaN(coords.lng);
          })
          .map(permit => ({
            ...permit,
            coordinates: permit.coordinates as { lat: number; lng: number },
            activity_level: permit.activity_level ? parseInt(String(permit.activity_level)) : null
          }));

        setPermits(formattedPermits);
      } catch (error) {
        console.error('Error fetching approved permits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedPermits();
  }, []);

  return { permits, loading };
}
