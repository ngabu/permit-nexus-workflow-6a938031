import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Inspection {
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
  accommodation_cost: number;
  transportation_cost: number;
  daily_allowance: number;
  total_travel_cost: number;
  number_of_days: number;
  province: string | null;
  permit_category: string | null;
  created_by: string | null;
  permit_number?: string;
  permit_title?: string;
  entity_name?: string;
  inspector_name?: string | null;
}

export function useInspections() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
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

      // Determine query based on user type
      let query = supabase
        .from('inspections')
        .select(`
          *,
          permit_applications!inner(
            id,
            permit_number,
            title,
            entity_id,
            entities(name)
          ),
          inspector:profiles!inspections_inspector_id_fkey(
            first_name,
            last_name
          )
        `)
        .order('scheduled_date', { ascending: false });

      // If public user, only show their inspections
      if (profile?.user_type === 'public') {
        query = query.eq('permit_applications.user_id', profile.user_id);
      }

      const { data, error } = await query;

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
        accommodation_cost: inspection.accommodation_cost || 0,
        transportation_cost: inspection.transportation_cost || 0,
        daily_allowance: inspection.daily_allowance || 0,
        total_travel_cost: inspection.total_travel_cost || 0,
        number_of_days: inspection.number_of_days || 1,
        province: inspection.province,
        permit_category: inspection.permit_category,
        created_by: inspection.created_by,
        permit_number: inspection.permit_applications?.permit_number,
        permit_title: inspection.permit_applications?.title,
        entity_name: inspection.permit_applications?.entities?.name,
        inspector_name: inspection.inspector 
          ? `${inspection.inspector.first_name} ${inspection.inspector.last_name}`
          : null
      })) || [];

      setInspections(formatted);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      toast.error('Failed to load inspections');
    } finally {
      setLoading(false);
    }
  };

  const createInspection = async (inspectionData: Partial<Inspection>) => {
    try {
      const { error } = await supabase
        .from('inspections')
        .insert({
          permit_application_id: inspectionData.permit_application_id,
          inspection_type: inspectionData.inspection_type,
          scheduled_date: inspectionData.scheduled_date,
          inspector_id: inspectionData.inspector_id,
          status: inspectionData.status || 'scheduled',
          notes: inspectionData.notes,
          accommodation_cost: inspectionData.accommodation_cost || 0,
          transportation_cost: inspectionData.transportation_cost || 0,
          daily_allowance: inspectionData.daily_allowance || 0,
          number_of_days: inspectionData.number_of_days || 1,
          province: inspectionData.province,
          permit_category: inspectionData.permit_category,
          created_by: profile?.user_id
        });

      if (error) throw error;

      toast.success('Inspection scheduled successfully');
      await fetchInspections();
      return true;
    } catch (error) {
      console.error('Error creating inspection:', error);
      toast.error('Failed to schedule inspection');
      return false;
    }
  };

  const updateInspection = async (id: string, updates: Partial<Inspection>) => {
    try {
      const { error } = await supabase
        .from('inspections')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Inspection updated successfully');
      await fetchInspections();
      return true;
    } catch (error) {
      console.error('Error updating inspection:', error);
      toast.error('Failed to update inspection');
      return false;
    }
  };

  return {
    inspections,
    loading,
    refetch: fetchInspections,
    createInspection,
    updateInspection
  };
}
