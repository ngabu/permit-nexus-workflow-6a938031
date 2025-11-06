import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';
import { useUnitNotifications, UnitNotification } from '@/hooks/useUnitNotifications';
import { markNotificationRead, markAllNotificationsRead } from '@/services/notificationsService';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface UnitNotificationsPanelProps {
  unit: string;
  onNotificationClick?: (notification: UnitNotification) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'new_assessment':
      return <CheckCircle className="w-4 h-4 text-primary" />;
    case 'urgent':
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    case 'deadline':
      return <Clock className="w-4 h-4 text-warning" />;
    default:
      return <Info className="w-4 h-4 text-muted-foreground" />;
  }
};

const getNotificationBadgeVariant = (type: string) => {
  switch (type) {
    case 'new_assessment':
      return 'default';
    case 'urgent':
      return 'destructive';
    case 'deadline':
      return 'secondary';
    default:
      return 'outline';
  }
};

export const UnitNotificationsPanel: React.FC<UnitNotificationsPanelProps> = ({ 
  unit, 
  onNotificationClick 
}) => {
  const { toast } = useToast();
  const { notifications, loading, error, refetch } = useUnitNotifications(unit);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const departmentName = unit.charAt(0).toUpperCase() + unit.slice(1);

  const handleMarkAsRead = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await markNotificationRead(notificationId);
      await refetch();
      toast({
        title: 'Success',
        description: 'Notification marked as read',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead(unit);
      await refetch();
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  const handleNotificationClick = (notification: UnitNotification) => {
    onNotificationClick?.(notification);
    if (!notification.is_read) {
      handleMarkAsRead(notification.id, { stopPropagation: () => {} } as React.MouseEvent);
    }
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Failed to load notifications</p>
            <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{departmentName} Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMarkAllAsRead}
            >
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-3 p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-sm">New notifications will appear here</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-border cursor-pointer hover:bg-accent/50 transition-colors ${
                  !notification.is_read ? 'bg-accent/25' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Badge 
                        variant={getNotificationBadgeVariant(notification.type)}
                        className="text-xs"
                      >
                        {notification.type.replace('_', ' ')}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                          >
                            Mark Read
                          </Button>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm ${!notification.is_read ? 'font-medium' : 'text-muted-foreground'}`}>
                      {notification.message}
                    </p>
                    {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {notification.metadata.permit_id && (
                          <span>Permit: {notification.metadata.permit_id}</span>
                        )}
                        {notification.metadata.applicant_name && (
                          <span className="ml-2">Applicant: {notification.metadata.applicant_name}</span>
                        )}
                      </div>
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
};