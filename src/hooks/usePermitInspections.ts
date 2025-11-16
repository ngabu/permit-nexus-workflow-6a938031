import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PermitInspection {
  id: string;
  permit_application_id: string;
  inspection_type: string;
  scheduled_date: string;
  inspector_id: string | null;
  status: string;
  notes: string | null;
  findings: string | null;
  completed_date: string | null;
  created_at: string;
  updated_at: string;
  permit_number: string;
  permit_title: string;
  inspector_name: string | null;
}

export function usePermitInspections() {
  const [inspections, setInspections] = useState<PermitInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.user_id) {
      fetchInspections();
    }
  }, [profile?.user_id]);

  const fetchInspections = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('inspections')
        .select(`
          *,
          permit_applications!inner(
            id,
            permit_number,
            title,
            user_id
          ),
          inspector:profiles!inspections_inspector_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('permit_applications.user_id', profile?.user_id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      const formatted = data?.map((inspection: any) => ({
        id: inspection.id,
        permit_application_id: inspection.permit_application_id,
        inspection_type: inspection.inspection_type,
        scheduled_date: inspection.scheduled_date,
        inspector_id: inspection.inspector_id,
        status: inspection.status,
        notes: inspection.notes,
        findings: inspection.findings,
        completed_date: inspection.completed_date,
        created_at: inspection.created_at,
        updated_at: inspection.updated_at,
        permit_number: inspection.permit_applications.permit_number,
        permit_title: inspection.permit_applications.title,
        inspector_name: inspection.inspector 
          ? `${inspection.inspector.first_name} ${inspection.inspector.last_name}`
          : null
      })) || [];

      setInspections(formatted);
    } catch (error) {
      console.error('Error fetching inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    inspections,
    loading,
    refetch: fetchInspections
  };
}
