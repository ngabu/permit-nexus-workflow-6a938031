
import { useState } from 'react';
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
    case 'success':
      return <CheckCircle className="w-5 h-5 text-success" />;
    case 'assessment_failed':
    case 'registry_assessment_failed':
    case 'application_rejected':
    case 'error':
      return <X className="w-5 h-5 text-destructive" />;
    case 'clarification_required':
    case 'registry_clarification_required':
    case 'technical_clarification_required':
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-warning" />;
    case 'deadline':
      return <Clock className="w-5 h-5 text-info" />;
    case 'info':
      return <Info className="w-5 h-5 text-info" />;
    default:
      return <Info className="w-5 h-5 text-primary" />;
  }
};

const getNotificationBackground = (type: string, isRead: boolean) => {
  const baseClasses = "p-4 rounded-lg border transition-all duration-300 hover:shadow-md hover:scale-[1.01]";
  
  if (isRead) {
    return `${baseClasses} bg-muted/50 border-border hover:bg-muted/60`;
  }
  
  switch (type) {
    case 'assessment_passed':
    case 'registry_assessment_passed':
    case 'application_approved':
    case 'success':
      return `${baseClasses} bg-success/5 border-success/20 hover:bg-success/10 hover:border-success/30`;
    case 'assessment_failed':
    case 'registry_assessment_failed':
    case 'application_rejected':
    case 'error':
      return `${baseClasses} bg-destructive/5 border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30`;
    case 'clarification_required':
    case 'registry_clarification_required':
    case 'technical_clarification_required':
    case 'warning':
      return `${baseClasses} bg-warning/5 border-warning/20 hover:bg-warning/10 hover:border-warning/30`;
    case 'deadline':
      return `${baseClasses} bg-orange-500/5 border-orange-500/20 hover:bg-orange-500/10 hover:border-orange-500/30`;
    case 'info':
      return `${baseClasses} bg-info/5 border-info/20 hover:bg-info/10 hover:border-info/30`;
    default:
      return `${baseClasses} bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30`;
  }
};

const getNotificationBadgeVariant = (type: string) => {
  switch (type) {
    case 'assessment_passed':
    case 'registry_assessment_passed':
    case 'application_approved':
    case 'success':
      return 'default';
    case 'assessment_failed':
    case 'registry_assessment_failed':
    case 'application_rejected':
    case 'error':
      return 'destructive';
    case 'clarification_required':
    case 'registry_clarification_required':
    case 'technical_clarification_required':
    case 'warning':
      return 'secondary';
    case 'info':
      return 'outline';
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
  const { notifications, loading, error, unreadCount, refetch } = useUserNotifications(user?.id);

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
    <div className="space-y-6">
      {/* Notification List */}
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
                  className={getNotificationBackground(notification.type, notification.is_read)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="transition-transform duration-300 hover:scale-110">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          {notification.title}
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                        {notification.related_permit_id && (
                          <div className="mt-3">
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
                              className="text-xs hover-scale"
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
                          className="hover-scale hover:bg-primary/10"
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
    </div>
  );
}
