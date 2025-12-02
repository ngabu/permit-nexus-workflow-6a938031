import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SimpleHeader } from '@/components/SimpleHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, Lock, AlertTriangle, UserCheck, Key, FileCheck, Activity, RefreshCw, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SystemConfigPanel } from '@/components/super-admin/SystemConfigPanel';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function SecurityDashboard() {
  const navigate = useNavigate();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch user statistics by type
  const { data: userStats, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['security-user-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type, is_active, is_suspended');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        active: data?.filter(u => u.is_active && !u.is_suspended).length || 0,
        suspended: data?.filter(u => u.is_suspended).length || 0,
        admins: data?.filter(u => u.user_type === 'admin' || u.user_type === 'super_admin').length || 0,
        staff: data?.filter(u => u.user_type === 'staff').length || 0,
        public: data?.filter(u => u.user_type === 'public').length || 0,
      };

      return stats;
    },
    refetchInterval: 30000
  });

  // Fetch recent audit logs for security events
  const { data: securityEvents, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15000
  });

  // Fetch failed login attempts (actions containing 'fail' or 'error')
  const { data: failedLogins } = useQuery({
    queryKey: ['security-failed-logins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .or('action.ilike.%fail%,action.ilike.%error%,action.ilike.%invalid%')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.length || 0;
    },
    refetchInterval: 30000
  });

  // Calculate security score based on real data
  const calculateSecurityScore = () => {
    let score = 100;
    
    // Deduct for suspended users (potential security issues)
    if (userStats?.suspended && userStats.suspended > 0) {
      score -= Math.min(userStats.suspended * 2, 10);
    }
    
    // Deduct for failed logins
    if (failedLogins && failedLogins > 0) {
      score -= Math.min(failedLogins * 2, 15);
    }

    return Math.max(score, 0);
  };

  const handleRefresh = async () => {
    await Promise.all([refetchUsers(), refetchEvents()]);
    setLastRefresh(new Date());
  };

  const getSeverity = (action: string) => {
    if (action.toLowerCase().includes('fail') || action.toLowerCase().includes('error')) return 'warning';
    if (action.toLowerCase().includes('delete') || action.toLowerCase().includes('suspend')) return 'warning';
    if (action.toLowerCase().includes('create') || action.toLowerCase().includes('success')) return 'success';
    return 'info';
  };

  const isLoading = usersLoading || eventsLoading;
  const securityScore = calculateSecurityScore();

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <main className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/admin')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Security Dashboard</h1>
                <p className="text-muted-foreground mt-1">Monitor security status and system configurations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Badge variant="default" className={securityScore >= 90 ? 'bg-green-600' : securityScore >= 70 ? 'bg-yellow-600' : 'bg-red-600'}>
                {securityScore >= 90 ? 'Secure' : securityScore >= 70 ? 'Moderate' : 'At Risk'}
              </Badge>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Last updated: {format(lastRefresh, 'MMM dd, yyyy HH:mm:ss')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Security Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{securityScore}/100</div>
                <p className="text-xs text-muted-foreground">
                  {securityScore >= 90 ? 'Excellent security posture' : 
                   securityScore >= 70 ? 'Good with some concerns' : 'Needs attention'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  Suspended Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {usersLoading ? '...' : userStats?.suspended || 0}
                </div>
                <p className="text-xs text-muted-foreground">Users currently suspended</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {usersLoading ? '...' : userStats?.active || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userStats?.total || 0} total registered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  Security Events (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {failedLogins || 0}
                </div>
                <p className="text-xs text-muted-foreground">Failed/error events</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Security Events
                </CardTitle>
                <CardDescription>Latest audit log entries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {eventsLoading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading events...</div>
                ) : securityEvents && securityEvents.length > 0 ? (
                  securityEvents.map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium">{item.action}</p>
                        <Badge variant={
                          getSeverity(item.action) === 'warning' ? 'destructive' : 
                          getSeverity(item.action) === 'success' ? 'default' : 
                          'secondary'
                        } className="text-xs">
                          {getSeverity(item.action)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {item.target_type || 'System'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(item.created_at || ''), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No recent security events</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Distribution
                </CardTitle>
                <CardDescription>Breakdown of user types and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Public Users', value: userStats?.public || 0, status: 'Active' },
                  { label: 'Staff Users', value: userStats?.staff || 0, status: 'Active' },
                  { label: 'Admin Users', value: userStats?.admins || 0, status: 'Privileged' },
                  { label: 'Active Users', value: userStats?.active || 0, status: 'Online' },
                  { label: 'Suspended Users', value: userStats?.suspended || 0, status: userStats?.suspended ? 'Warning' : 'None' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.value} users</p>
                    </div>
                    <Badge 
                      variant={item.status === 'Warning' ? 'destructive' : item.status === 'Privileged' ? 'default' : 'secondary'}
                      className={item.status === 'None' ? 'bg-green-600' : ''}
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Security Policies
              </CardTitle>
              <CardDescription>Active security policies and compliance status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { policy: 'Row Level Security (RLS)', status: 'Enabled on all tables', compliant: true },
                { policy: 'User Authentication', status: 'Supabase Auth', compliant: true },
                { policy: 'Role-Based Access', status: 'Active (public, staff, admin, super_admin)', compliant: true },
                { policy: 'Audit Logging', status: 'Enabled', compliant: true },
                { policy: 'Session Management', status: 'Persistent with auto-refresh', compliant: true },
                { policy: 'Data Encryption', status: 'SSL/TLS in transit', compliant: true },
              ].map((item) => (
                <div key={item.policy} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.policy}</p>
                    <p className="text-xs text-muted-foreground">{item.status}</p>
                  </div>
                  <Badge variant={item.compliant ? 'default' : 'destructive'} className="bg-green-600">
                    {item.compliant ? 'Compliant' : 'Non-compliant'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <SystemConfigPanel />
        </div>
      </main>
    </div>
  );
}
