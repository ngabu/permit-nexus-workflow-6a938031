import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Database, Shield, FileText, Bell } from 'lucide-react';

export function SystemConfigPanel() {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Configuration
          </CardTitle>
          <CardDescription>System database settings and connection info</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Database Provider</p>
              <Badge>Supabase</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Connection Status</p>
              <Badge variant="default" className="bg-green-600">Connected</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">RLS Enabled</p>
              <Badge variant="default" className="bg-green-600">Active</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Migrations</p>
              <Badge variant="secondary">Up to date</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
          <CardDescription>System security and access control</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {[
              { label: 'Row Level Security (RLS)', status: 'Enabled', variant: 'default' as const },
              { label: 'JWT Authentication', status: 'Active', variant: 'default' as const },
              { label: 'API Rate Limiting', status: 'Configured', variant: 'default' as const },
              { label: '2FA Support', status: 'Available', variant: 'secondary' as const },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">{item.label}</span>
                <Badge variant={item.variant}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Storage Configuration
          </CardTitle>
          <CardDescription>File storage and document management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {[
              { bucket: 'documents', usage: '2.3 GB', files: '1,234' },
              { bucket: 'attachments', usage: '856 MB', files: '456' },
              { bucket: 'avatars', usage: '124 MB', files: '89' },
            ].map((bucket) => (
              <div key={bucket.bucket} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{bucket.bucket}</p>
                  <p className="text-sm text-muted-foreground">{bucket.files} files</p>
                </div>
                <Badge variant="secondary">{bucket.usage}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification System
          </CardTitle>
          <CardDescription>System notification configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {[
              { type: 'Email Notifications', status: 'Enabled' },
              { type: 'In-App Notifications', status: 'Enabled' },
              { type: 'Manager Notifications', status: 'Enabled' },
              { type: 'Unit Notifications', status: 'Enabled' },
            ].map((item) => (
              <div key={item.type} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">{item.type}</span>
                <Badge variant="default" className="bg-green-600">{item.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
