import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertCircle, Info, Clock } from "lucide-react";
import { useDirectorateNotifications } from "@/hooks/useDirectorateNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

export default function MDNotifications() {
  const { profile } = useAuth();
  const { notifications, loading, markAsRead, markAllAsRead } = useDirectorateNotifications(profile?.user_id);

  const getIcon = (type: string) => {
    switch (type) {
      case 'approval_required':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'signature_required':
        return <Bell className="h-5 w-5 text-primary" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on pending actions and approvals</p>
        </div>
        <Button onClick={markAllAsRead} variant="outline">
          Mark All as Read
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Loading notifications...</p>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No notifications at this time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={!notification.is_read ? 'border-primary' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                        {!notification.is_read && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                        <Badge variant={getPriorityColor(notification.priority || 'normal')}>
                          {notification.priority || 'normal'}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>
                {notification.action_required && (
                  <Button size="sm" className="mt-2">
                    View Details
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
