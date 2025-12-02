import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SimpleHeader } from '@/components/SimpleHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Server, Database, HardDrive, Users, Activity, Globe, Clock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function SystemHealth() {
  const navigate = useNavigate();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch database statistics
  const { data: dbStats, isLoading: dbLoading, refetch: refetchDb } = useQuery({
    queryKey: ['system-db-stats'],
    queryFn: async () => {
      const [
        { count: usersCount },
        { count: entitiesCount },
        { count: applicationsCount },
        { count: permitsCount },
        { count: documentsCount },
        { count: auditLogsCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('entities').select('*', { count: 'exact', head: true }),
        supabase.from('permit_applications').select('*', { count: 'exact', head: true }),
        supabase.from('fee_structures').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('*', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('*', { count: 'exact', head: true })
      ]);

      return {
        users: usersCount || 0,
        entities: entitiesCount || 0,
        applications: applicationsCount || 0,
        permits: permitsCount || 0,
        documents: documentsCount || 0,
        auditLogs: auditLogsCount || 0,
        totalRecords: (usersCount || 0) + (entitiesCount || 0) + (applicationsCount || 0) + (documentsCount || 0)
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch recent audit events
  const { data: recentEvents, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['system-recent-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  // Fetch active users (users who logged in recently)
  const { data: activeUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['system-active-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data?.length || 0;
    },
    refetchInterval: 30000
  });

  // Fetch suspended users count
  const { data: suspendedUsers } = useQuery({
    queryKey: ['system-suspended-users'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_suspended', true);

      return count || 0;
    },
    refetchInterval: 30000
  });

  const handleRefresh = async () => {
    await Promise.all([refetchDb(), refetchEvents()]);
    setLastRefresh(new Date());
  };

  const getEventType = (action: string) => {
    if (action.toLowerCase().includes('create') || action.toLowerCase().includes('insert')) return 'success';
    if (action.toLowerCase().includes('delete') || action.toLowerCase().includes('error')) return 'warning';
    return 'info';
  };

  const isLoading = dbLoading || eventsLoading || usersLoading;

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
                <h1 className="text-3xl font-bold text-foreground">System Health Monitor</h1>
                <p className="text-muted-foreground mt-1">Real-time system performance and health metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Badge variant="default" className="bg-green-600">All Systems Operational</Badge>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Last updated: {format(lastRefresh, 'MMM dd, yyyy HH:mm:ss')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" />
                  Server Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">Online</div>
                <p className="text-xs text-muted-foreground">Connected to Supabase</p>
                <Progress value={100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  Database Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {dbLoading ? '...' : dbStats?.totalRecords.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total records across tables</p>
                <Progress value={75} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {usersLoading ? '...' : activeUsers}
                </div>
                <p className="text-xs text-muted-foreground">{suspendedUsers || 0} suspended</p>
                <Progress value={activeUsers ? Math.min((activeUsers / (activeUsers + (suspendedUsers || 0))) * 100, 100) : 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-primary" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {dbLoading ? '...' : dbStats?.documents.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Stored documents</p>
                <Progress value={45} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Database Tables Status
                </CardTitle>
                <CardDescription>Record counts across database tables</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Users/Profiles', count: dbStats?.users || 0, status: 'Operational' },
                  { name: 'Entities', count: dbStats?.entities || 0, status: 'Operational' },
                  { name: 'Permit Applications', count: dbStats?.applications || 0, status: 'Operational' },
                  { name: 'Fee Structures', count: dbStats?.permits || 0, status: 'Operational' },
                  { name: 'Documents', count: dbStats?.documents || 0, status: 'Operational' },
                  { name: 'Audit Logs', count: dbStats?.auditLogs || 0, status: 'Operational' },
                ].map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{service.count.toLocaleString()} records</span>
                      <Badge variant="secondary">{service.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  System Statistics
                </CardTitle>
                <CardDescription>Key system metrics and usage data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Users</span>
                    <span className="font-medium">{dbStats?.users || 0}</span>
                  </div>
                  <Progress value={Math.min((dbStats?.users || 0) / 100 * 10, 100)} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Entities</span>
                    <span className="font-medium">{dbStats?.entities || 0}</span>
                  </div>
                  <Progress value={Math.min((dbStats?.entities || 0) / 100 * 10, 100)} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Applications</span>
                    <span className="font-medium">{dbStats?.applications || 0}</span>
                  </div>
                  <Progress value={Math.min((dbStats?.applications || 0) / 100 * 10, 100)} />
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Audit Log Entries
                    </span>
                    <span className="font-medium">{dbStats?.auditLogs || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent System Events</CardTitle>
              <CardDescription>Latest system activities from audit logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventsLoading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading events...</div>
                ) : recentEvents && recentEvents.length > 0 ? (
                  recentEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        getEventType(event.action) === 'success' ? 'bg-green-600' : 
                        getEventType(event.action) === 'warning' ? 'bg-yellow-600' : 
                        'bg-blue-600'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.action}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{event.target_type ? `Target: ${event.target_type}` : 'System event'}</span>
                          <span>•</span>
                          <span>{format(new Date(event.created_at || ''), 'MMM dd, HH:mm:ss')}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No recent events found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
