import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, CheckCircle, AlertTriangle, Info, Settings } from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "Application Approved",
    message: "Your environmental permit application APP-2024-001 has been approved.",
    type: "success",
    timestamp: "2024-01-25 10:30 AM",
    read: false
  },
  {
    id: 2,
    title: "Payment Due Reminder",
    message: "Payment of $1,200.00 is due on February 15th for compliance monitoring.",
    type: "warning",
    timestamp: "2024-01-20 2:15 PM",
    read: false
  },
  {
    id: 3,
    title: "Document Uploaded",
    message: "New assessment report has been uploaded for your review.",
    type: "info",
    timestamp: "2024-01-18 9:45 AM",
    read: true
  },
  {
    id: 4,
    title: "Assessment Scheduled",
    message: "Site assessment scheduled for February 20th, 2024 at 10:00 AM.",
    type: "info",
    timestamp: "2024-01-15 4:20 PM",
    read: true
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "success": return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    case "info": return <Info className="w-5 h-5 text-blue-600" />;
    default: return <Bell className="w-5 h-5 text-gray-600" />;
  }
};

const getNotificationBadge = (type: string) => {
  switch (type) {
    case "success": return "bg-green-100 text-green-800";
    case "warning": return "bg-yellow-100 text-yellow-800";
    case "info": return "bg-blue-100 text-blue-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function Notifications() {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated with important information about your applications and permits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Recent Notifications
                  </CardTitle>
                  <CardDescription>
                    {unreadCount > 0 ? `${unreadCount} unread notifications` : "All notifications read"}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Mark All Read
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border border-border rounded-lg ${!notification.read ? 'bg-accent/50' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-foreground">{notification.title}</h3>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <Badge variant="secondary" className="text-xs">New</Badge>
                            )}
                            <Badge className={getNotificationBadge(notification.type)}>
                              {notification.type}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Application Updates</p>
                    <p className="text-sm text-muted-foreground">Status changes and approvals</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Reminders</p>
                    <p className="text-sm text-muted-foreground">Due dates and overdue notices</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Assessment Schedules</p>
                    <p className="text-sm text-muted-foreground">Site visit notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">System Maintenance</p>
                    <p className="text-sm text-muted-foreground">Planned downtime alerts</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}