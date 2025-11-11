
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RegistryStaff {
  id: string;
  email: string;
  full_name: string | null;
  staff_position: 'officer' | 'manager';
  is_active: boolean;
}

export function useRegistryStaff() {
  const [staff, setStaff] = useState<RegistryStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, staff_position, is_active')
        .eq('staff_unit', 'registry')
        .eq('is_active', true)
        .in('staff_position', ['officer', 'manager'])
        .order('first_name');

      if (error) throw error;
      
      // Optimize data transformation
      const typedStaff: RegistryStaff[] = (data || []).map(member => ({
        id: member.user_id,
        email: member.email,
        full_name: member.first_name && member.last_name 
          ? `${member.first_name} ${member.last_name}` 
          : member.first_name || member.last_name || member.email,
        staff_position: member.staff_position as 'officer' | 'manager',
        is_active: member.is_active
      }));
      
      setStaff(typedStaff);
    } catch (error) {
      console.error('Error fetching registry staff:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Allow both registry staff and super admin to view staff
    if (profile?.staff_unit === 'registry' || profile?.user_type === 'super_admin') {
      fetchStaff();
    } else {
      console.log('User does not have registry access:', profile);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.staff_unit, profile?.user_type]);

  return { staff, loading, refetch: fetchStaff };
}
