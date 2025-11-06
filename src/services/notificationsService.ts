import { supabase } from '@/integrations/supabase/client';
import { UnitNotification } from '@/hooks/useUnitNotifications';

export const fetchUnitNotifications = async (unit: string): Promise<UnitNotification[]> => {
  try {
    const { data, error } = await supabase
      .from('manager_notifications' as any)
      .select('*')
      .eq('target_unit', unit)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    return (data as unknown as UnitNotification[]) || [];
  } catch (error) {
    console.error('Error fetching unit notifications:', error);
    throw error;
  }
};

export const markNotificationRead = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('manager_notifications' as any)
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsRead = async (unit: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('manager_notifications' as any)
      .update({ is_read: true })
      .eq('target_unit', unit)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};