
import { useState, useEffect } from 'react';
import { Bell, Check, X, AlertCircle, CheckCircle, Info, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserNotifications } from '@/hooks/useUserNotifications';
import { markUserNotificationRead, markAllUserNotificationsRead } from '@/services/userNotificationsService';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'assessment_passed':
    case 'registry_assessment_passed':
    case 'application_approved':
      return <CheckCircle className="w-5 h-5 text-success" />;
    case 'assessment_failed':
    case 'registry_assessment_failed':
    case 'application_rejected':
      return <X className="w-5 h-5 text-destructive" />;
    case 'clarification_required':
    case 'registry_clarification_required':
    case 'technical_clarification_required':
      return <AlertCircle className="w-5 h-5 text-warning" />;
    case 'deadline':
      return <Clock className="w-5 h-5 text-secondary" />;
    default:
      return <Info className="w-5 h-5 text-primary" />;
  }
};

const getNotificationBadgeVariant = (type: string) => {
  switch (type) {
    case 'assessment_passed':
    case 'registry_assessment_passed':
    case 'application_approved':
      return 'default';
    case 'assessment_failed':
    case 'registry_assessment_failed':
    case 'application_rejected':
      return 'destructive';
    case 'clarification_required':
    case 'registry_clarification_required':
    case 'technical_clarification_required':
      return 'secondary';
    default:
      return 'outline';
  }
};

interface NotificationCenterProps {
  onViewApplication?: (permitId: string) => void;
}

export function NotificationCenter({ onViewApplication }: NotificationCenterProps = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { notifications, loading, error, unreadCount, refetch } = useUserNotifications(
    user?.id,
    (notification) => {
      // Handle real-time notification updates
      toast({
        title: notification.title,
        description: notification.message,
      });
    }
  );

  const markAsRead = async (notificationId: string) => {
    try {
      await markUserNotificationRead(notificationId);
      await refetch();
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await markAllUserNotificationsRead(user.id);
      await refetch();
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading notifications...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Stay updated with your application progress</CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.is_read ? 'bg-sidebar' : 'bg-primary/5 border-primary/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                       {notification.related_permit_id && (
                        <div className="mt-2">
                           <Button
                             size="sm"
                             variant="secondary"
                             onClick={() => {
                               if (onViewApplication) {
                                 onViewApplication(notification.related_permit_id!);
                               } else {
                                 // Fallback to navigate to permits tab
                                 const event = new CustomEvent('navigate-to-permits', { 
                                   detail: { permitId: notification.related_permit_id } 
                                 });
                                 window.dispatchEvent(event);
                               }
                             }}
                             className="text-xs"
                           >
                             View Application
                           </Button>
                         </div>
                       )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getNotificationBadgeVariant(notification.type)} className="text-xs">
                      {notification.type.replace(/_/g, ' ')}
                    </Badge>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
