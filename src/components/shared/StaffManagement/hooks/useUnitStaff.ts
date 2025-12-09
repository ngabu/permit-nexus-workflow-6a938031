import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { StaffMember, StaffUnit } from '../types';

export function useUnitStaff(unit: StaffUnit) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const isManager = profile?.staff_position && 
    ['manager', 'director', 'managing_director'].includes(profile.staff_position);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, staff_position, is_active, created_at')
        .eq('staff_unit', unit);
      
      // Managers can see all staff including suspended; others only see active
      if (!isManager && profile?.user_type !== 'super_admin') {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query.order('first_name');

      if (error) throw error;
      
      const transformedData: StaffMember[] = (data || []).map(item => ({
        id: item.user_id,
        email: item.email,
        full_name: item.first_name && item.last_name 
          ? `${item.first_name} ${item.last_name}` 
          : item.first_name || item.last_name || item.email,
        staff_position: item.staff_position,
        is_active: item.is_active,
        created_at: item.created_at
      }));
      
      setStaff(transformedData);
    } catch (error) {
      console.error(`Error fetching ${unit} staff:`, error);
      toast.error(`Failed to fetch staff members`);
    } finally {
      setLoading(false);
    }
  }, [unit, isManager, profile?.user_type]);

  const toggleStaffStatus = async (staffId: string, newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('user_id', staffId);

      if (error) throw error;

      toast.success(`Staff member ${newStatus ? 'activated' : 'suspended'} successfully`);
      await fetchStaff();
    } catch (error) {
      console.error('Error updating staff status:', error);
      toast.error('Failed to update staff status');
    }
  };

  useEffect(() => {
    if (profile?.staff_unit === unit || profile?.user_type === 'super_admin') {
      fetchStaff();
    } else {
      setLoading(false);
    }
  }, [profile?.staff_unit, profile?.user_type, fetchStaff, unit]);

  return { staff, loading, refetch: fetchStaff, toggleStaffStatus, isManager };
}
