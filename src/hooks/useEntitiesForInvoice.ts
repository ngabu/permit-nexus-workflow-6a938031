import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEntitiesForInvoice() {
  return useQuery({
    queryKey: ['entities-for-invoice'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entities')
        .select('id, name, entity_type, email, phone, registration_number')
        .eq('is_suspended', false)
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
}
