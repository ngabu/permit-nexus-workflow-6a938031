import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchUnitNotifications } from '@/services/notificationsService';

export interface UnitNotification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata: any;
  related_id: string;
  target_unit: string;
}

interface UseUnitNotificationsReturn {
  notifications: UnitNotification[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUnitNotifications = (
  unit: string,
  onNotificationUpdate?: (notification: UnitNotification) => void
): UseUnitNotificationsReturn => {
  const [notifications, setNotifications] = useState<UnitNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUnitNotifications(unit);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [unit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!unit) return;

    const channel = supabase
      .channel(`unit-notifications-${unit}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'manager_notifications',
          filter: `target_unit=eq.${unit}`
        },
        (payload) => {
          const newNotification = payload.new as unknown as UnitNotification;
          setNotifications(prev => [newNotification, ...prev]);
          onNotificationUpdate?.(newNotification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'manager_notifications',
          filter: `target_unit=eq.${unit}`
        },
        (payload) => {
          const updatedNotification = payload.new as unknown as UnitNotification;
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === updatedNotification.id 
                ? updatedNotification 
                : notification
            )
          );
          onNotificationUpdate?.(updatedNotification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'manager_notifications',
          filter: `target_unit=eq.${unit}`
        },
        (payload) => {
          const deletedNotification = payload.old as unknown as UnitNotification;
          setNotifications(prev => 
            prev.filter(notification => notification.id !== deletedNotification.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [unit, onNotificationUpdate]);

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications
  };
};