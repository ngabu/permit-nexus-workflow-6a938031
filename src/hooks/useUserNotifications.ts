import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserNotifications, UserNotification } from '@/services/userNotificationsService';

interface UseUserNotificationsReturn {
  notifications: UserNotification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  refetch: () => Promise<void>;
}

export const useUserNotifications = (
  userId: string | undefined,
  onNotificationUpdate?: (notification: UserNotification) => void
): UseUserNotificationsReturn => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserNotifications(userId);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as UserNotification;
          setNotifications(prev => [newNotification, ...prev]);
          onNotificationUpdate?.(newNotification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updatedNotification = payload.new as UserNotification;
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
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const deletedNotification = payload.old as UserNotification;
          setNotifications(prev => 
            prev.filter(notification => notification.id !== deletedNotification.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNotificationUpdate]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    refetch: fetchNotifications
  };
};