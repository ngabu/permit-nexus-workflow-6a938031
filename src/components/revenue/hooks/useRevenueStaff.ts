
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RevenueStaff {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  operational_unit: string | null;
  staff_position: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export function useRevenueStaff() {
  const [staff, setStaff] = useState<RevenueStaff[]>([]);
  const { profile } = useAuth();

  const fetchRevenueStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, user_type, staff_unit, staff_position, is_active, created_at')
        .eq('staff_unit', 'revenue')
        .eq('is_active', true);

      if (error) throw error;
      
      // Transform data to match expected interface
      const transformedData = (data || []).map(item => ({
        ...item,
        full_name: item.first_name && item.last_name 
          ? `${item.first_name} ${item.last_name}` 
          : item.first_name || item.last_name,
        role: item.user_type,
        operational_unit: item.staff_unit
      }));
      
      setStaff(transformedData);
    } catch (error) {
      console.error('Error fetching revenue staff:', error);
    }
  };

  useEffect(() => {
    if (profile?.staff_unit === 'revenue' && profile?.staff_position === 'manager') {
      fetchRevenueStaff();
    }
  }, [profile]);

  return { staff };
}
