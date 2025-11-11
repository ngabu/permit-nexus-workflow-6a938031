
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PrescribedActivity {
  id: string;
  category_number: string;
  category_type: string;
  sub_category: string;
  activity_description: string;
  level: number;
}

export function usePrescribedActivities() {
  return useQuery({
    queryKey: ['prescribed-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescribed_activities')
        .select('*')
        .order('category_number', { ascending: true });
      
      if (error) throw error;
      return data as PrescribedActivity[];
    }
  });
}
