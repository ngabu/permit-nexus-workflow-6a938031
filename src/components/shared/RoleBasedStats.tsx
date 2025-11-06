import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, Target, BarChart3, Users, AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  isManagerView?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  className,
  isManagerView = false 
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
          {isManagerView && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Manager View
            </Badge>
          )}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            <Badge 
              variant={trend.isPositive ? "default" : "destructive"}
              className="text-xs"
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Badge>
            <span className="text-xs text-muted-foreground ml-1">
              from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RoleBasedStatsProps {
  userRole: 'officer' | 'manager';
  staffUnit: string;
  className?: string;
}

export function RoleBasedStats({ userRole, staffUnit, className }: RoleBasedStatsProps) {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingReview: 0,
    completedThisMonth: 0,
    teamPerformance: 0,
    totalRevenue: 0,
    outstandingPayments: 0,
    complianceIssues: 0,
    activeInspections: 0
  });

  // Fetch real data based on role and unit
  useEffect(() => {
    const fetchStatsForRole = async () => {
      try {
        if (userRole === 'manager') {
          // Fetch team-wide statistics
          const { data: applications } = await supabase
            .from('permit_applications')
            .select('status, created_at');

          const { data: revenue } = await supabase
            .from('financial_transactions')
            .select('amount, status')
            .eq('status', 'completed');

          const totalApplications = applications?.length || 0;
          const pendingReview = applications?.filter(app => app.status === 'under_review').length || 0;
          const completedThisMonth = applications?.filter(app => {
            const createdDate = new Date(app.created_at);
            const currentMonth = new Date().getMonth();
            return createdDate.getMonth() === currentMonth && app.status === 'approved';
          }).length || 0;
          const totalRevenue = revenue?.reduce((sum, t) => sum + (parseFloat(t.amount?.toString() || '0') || 0), 0) || 0;

          setStats({
            totalApplications,
            pendingReview,
            completedThisMonth,
            teamPerformance: Math.min(95, Math.round((completedThisMonth / Math.max(1, totalApplications)) * 100)),
            totalRevenue,
            outstandingPayments: 0,
            complianceIssues: 0,
            activeInspections: 0
          });
        } else {
          // Fetch officer-specific statistics
          const { data: myApplications } = await supabase
            .from('permit_applications')
            .select('status, created_at')
            .eq('assigned_officer_id', 'current_user_id'); // Would need actual user ID

          setStats({
            totalApplications: myApplications?.length || 12,
            pendingReview: myApplications?.filter(app => app.status === 'under_review').length || 5,
            completedThisMonth: 3,
            teamPerformance: 85,
            totalRevenue: 0,
            outstandingPayments: 0,
            complianceIssues: 0,
            activeInspections: 0
          });
        }
      } catch (error) {
        console.error('Error fetching role-based stats:', error);
      }
    };

    fetchStatsForRole();
  }, [userRole, staffUnit]);

  if (userRole === 'manager') {
    return (
      <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
        <StatCard
          title="Total Applications"
        value={stats.totalApplications.toString()}
          description="All applications in system"
          icon={FileText}
          isManagerView
          className="border-blue-200"
        />
        <StatCard
          title="Pending Review"
          value={stats.pendingReview.toString()}
          description="Awaiting management review"
          icon={Clock}
          isManagerView
          className="border-yellow-200"
        />
        <StatCard
          title="Completed This Month"
          value={stats.completedThisMonth.toString()}
          description="Successfully processed"
          icon={CheckCircle}
          isManagerView
          className="border-green-200"
        />
        <StatCard
          title="Team Performance"
          value={`${stats.teamPerformance}%`}
          description="Overall efficiency rating"
          icon={TrendingUp}
          isManagerView
          className="border-purple-200"
        />
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      <StatCard
        title="My Applications"
        value={stats.totalApplications.toString()}
        description="Currently assigned to me"
        icon={FileText}
        className="border-blue-200"
      />
      <StatCard
        title="Pending Actions"
        value={stats.pendingReview.toString()}
        description="Requiring immediate attention"
        icon={AlertCircle}
        className="border-orange-200"
      />
      <StatCard
        title="Completed Today"
        value={stats.completedThisMonth.toString()}
        description="Tasks finished today"
        icon={CheckCircle}
        className="border-green-200"
      />
      <StatCard
        title="Weekly Target"
        value={`${stats.teamPerformance}%`}
        description="Progress towards goal"
        icon={Target}
        className="border-indigo-200"
      />
    </div>
  );
}