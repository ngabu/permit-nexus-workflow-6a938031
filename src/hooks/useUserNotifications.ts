import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserNotifications, UserNotification } from '@/services/userNotificationsService';
import { browserNotifications } from '@/services/browserNotifications';

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

    console.log('[Realtime] Setting up notification subscription for user:', userId);

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
          console.log('[Realtime] New notification received:', payload);
          const newNotification = payload.new as UserNotification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show browser notification for important events
          if (browserNotifications.isEnabled()) {
            browserNotifications.showForNotification(
              newNotification.type,
              newNotification.title,
              newNotification.message
            );
          }
          
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
          console.log('[Realtime] Notification updated:', payload);
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
          console.log('[Realtime] Notification deleted:', payload);
          const deletedNotification = payload.old as UserNotification;
          setNotifications(prev => 
            prev.filter(notification => notification.id !== deletedNotification.id)
          );
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Successfully subscribed to notifications');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Channel error');
        } else if (status === 'TIMED_OUT') {
          console.error('[Realtime] Subscription timed out');
        }
      });

    return () => {
      console.log('[Realtime] Cleaning up notification subscription');
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