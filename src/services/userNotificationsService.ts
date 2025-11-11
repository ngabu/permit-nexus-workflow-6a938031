import { supabase } from '@/integrations/supabase/client';

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  related_permit_id?: string;
  related_activity_id?: string;
}

export const fetchUserNotifications = async (userId: string): Promise<UserNotification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user notifications: ${error.message}`);
    }

    return (data as UserNotification[]) || [];
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

export const markUserNotificationRead = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
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

export const markAllUserNotificationsRead = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const createUserNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string,
  relatedPermitId?: string,
  relatedActivityId?: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        related_permit_id: relatedPermitId,
        related_activity_id: relatedActivityId,
        is_read: false
      });

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const deleteUserNotification = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};