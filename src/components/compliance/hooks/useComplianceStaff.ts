
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ComplianceStaff {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  operational_unit: string | null;
  staff_position: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export function useComplianceStaff() {
  const [staff, setStaff] = useState<ComplianceStaff[]>([]);
  const { profile } = useAuth();

  const fetchComplianceStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, user_type, staff_unit, staff_position, is_active, created_at')
        .eq('staff_unit', 'compliance')
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
      console.error('Error fetching compliance staff:', error);
    }
  };

  useEffect(() => {
    if (profile?.staff_unit === 'compliance' || profile?.user_type === 'super_admin') {
      fetchComplianceStaff();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.staff_unit, profile?.user_type]);

  return { staff };
}
