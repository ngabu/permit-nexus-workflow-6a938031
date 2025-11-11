import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { browserNotifications } from '@/services/browserNotifications';
import { useToast } from '@/hooks/use-toast';

export function BrowserNotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [enabled, setEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsSupported(browserNotifications.isSupported());
    setPermission(browserNotifications.getPermission());
    setEnabled(browserNotifications.isEnabled());
  }, []);

  const handleRequestPermission = async () => {
    const newPermission = await browserNotifications.requestPermission();
    setPermission(newPermission);
    
    if (newPermission === 'granted') {
      setEnabled(true);
      toast({
        title: "Notifications Enabled",
        description: "You'll receive browser notifications for important updates.",
      });
      
      // Send test notification
      await browserNotifications.show({
        title: "Test Notification",
        body: "Browser notifications are now enabled! You'll receive alerts for application updates.",
      });
    } else {
      toast({
        title: "Permission Denied",
        description: "Please enable notifications in your browser settings to receive alerts.",
        variant: "destructive",
      });
    }
  };

  const handleToggle = async (checked: boolean) => {
    if (checked && permission !== 'granted') {
      await handleRequestPermission();
    } else {
      browserNotifications.setEnabled(checked);
      setEnabled(checked);
      
      toast({
        title: checked ? "Notifications Enabled" : "Notifications Disabled",
        description: checked 
          ? "You'll receive browser notifications for important updates."
          : "Browser notifications have been turned off.",
      });
    }
  };

  if (!isSupported) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Browser notifications are not supported in your browser.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Browser Notifications
        </CardTitle>
        <CardDescription>
          Get instant alerts on your device for important application updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === 'denied' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Notifications are blocked. Please enable them in your browser settings.
            </AlertDescription>
          </Alert>
        )}

        {permission === 'granted' && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">
              Browser notifications are enabled for this site.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="browser-notifications" className="text-base">
              Enable Browser Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive alerts even when the app is not open
            </p>
          </div>
          <Switch
            id="browser-notifications"
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={permission === 'denied'}
          />
        </div>

        {permission === 'default' && (
          <Button onClick={handleRequestPermission} className="w-full">
            <Bell className="w-4 h-4 mr-2" />
            Enable Notifications
          </Button>
        )}

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">You'll receive notifications for:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Application status changes</li>
            <li>• Registry feedback and reviews</li>
            <li>• Assessment results</li>
            <li>• Clarification requests</li>
            <li>• Payment reminders</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
