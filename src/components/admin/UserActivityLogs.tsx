import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Clock, User, Globe, Building2 } from 'lucide-react';
import { format } from 'date-fns';

type UserFilter = 'all' | 'public' | 'staff';

export function UserActivityLogs() {
  const [userFilter, setUserFilter] = useState<UserFilter>('all');

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['admin-activity-logs', userFilter],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            user_type
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Filter based on user type after fetching
      if (userFilter !== 'all' && data) {
        return data.filter(log => {
          const userType = (log.profiles as any)?.user_type;
          if (userFilter === 'public') {
            return userType === 'public' || userType === 'applicant' || !userType;
          }
          return userType === 'staff' || userType === 'admin' || userType === 'super_admin';
        });
      }
      
      return data;
    },
  });

  const getActionBadgeVariant = (action: string) => {
    const variants: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      LOGIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      LOGOUT: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return variants[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const getUserTypeIcon = (userType: string | null | undefined) => {
    if (userType === 'staff' || userType === 'admin' || userType === 'super_admin') {
      return <Building2 className="w-3 h-3" />;
    }
    return <Globe className="w-3 h-3" />;
  };

  const getUserTypeBadge = (userType: string | null | undefined) => {
    const isStaff = userType === 'staff' || userType === 'admin' || userType === 'super_admin';
    return (
      <Badge variant="outline" className={`text-xs ${isStaff ? 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400' : 'border-green-300 text-green-700 dark:border-green-700 dark:text-green-400'}`}>
        {getUserTypeIcon(userType)}
        <span className="ml-1">{isStaff ? 'Staff' : 'Public'}</span>
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-forest-800 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              User Activity Logs
            </CardTitle>
            <CardDescription>Recent user activities across the system</CardDescription>
          </div>
          <Select value={userFilter} onValueChange={(value: UserFilter) => setUserFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  All Users
                </div>
              </SelectItem>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Public
                </div>
              </SelectItem>
              <SelectItem value="staff">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Staff
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : auditLogs && auditLogs.length > 0 ? (
          <ScrollArea className="h-[320px]">
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {(log.profiles as any)?.full_name || 'Unknown User'}
                      </span>
                      {getUserTypeBadge((log.profiles as any)?.user_type)}
                      <Badge className={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(log.profiles as any)?.email || 'No email'}
                    </div>
                    {log.target_type && (
                      <div className="text-xs text-muted-foreground">
                        Target: {log.target_type} {log.target_id ? `(${log.target_id.slice(0, 8)}...)` : ''}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(log.created_at || ''), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No activity logs found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
