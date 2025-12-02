import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CreditCard, Upload, Eye, Bell, Edit, AlertCircle, CheckCircle, FileCheck } from 'lucide-react';
import { KPICard } from '@/components/kpi-card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  activeApplications: number;
  approvedPermits: number;
  pendingPayments: string;
  documentsCount: number;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'invoice' | 'notification' | 'document';
  title: string;
  description: string;
  status: string;
  timestamp: string;
  actionable?: boolean;
  actionText?: string;
}

interface ActivityOverviewProps {
  onNavigate: (tab: string) => void;
}

export default function ActivityOverview({ onNavigate }: ActivityOverviewProps) {
  const [stats, setStats] = useState<DashboardStats>({
    activeApplications: 0,
    approvedPermits: 0,
    pendingPayments: 'K0',
    documentsCount: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
      fetchRecentActivities();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const { data: activeApps, error: activeError } = await supabase
        .from('permit_applications')
        .select('id')
        .in('status', [
          'submitted', 
          'under_initial_review', 
          'pending_technical_assessment', 
          'under_technical_assessment',
          'requires_clarification'
        ])
        .eq('user_id', user?.id);

      if (activeError) throw activeError;

      const { data: approvedApps, error: approvedError } = await supabase
        .from('permit_applications')
        .select('id')
        .eq('status', 'approved')
        .eq('user_id', user?.id);

      if (approvedError) throw approvedError;

      const { data: invoices, error: invoicesError } = await (supabase as any)
        .from('invoices')
        .select('amount')
        .in('payment_status', ['pending', 'overdue'])
        .eq('user_id', user?.id);

      if (invoicesError) throw invoicesError;

      const totalPending = invoices?.reduce((sum: number, invoice: any) => sum + (invoice.amount || 0), 0) || 0;

      const { data: documents, error: documentsError } = await (supabase as any)
        .from('documents')
        .select('id')
        .eq('user_id', user?.id);

      if (documentsError) throw documentsError;

      setStats({
        activeApplications: activeApps?.length || 0,
        approvedPermits: approvedApps?.length || 0,
        pendingPayments: `K${totalPending.toLocaleString()}`,
        documentsCount: documents?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const activities: RecentActivity[] = [];

      const { data: applications, error: appError } = await supabase
        .from('permit_applications')
        .select(`
          id, 
          title, 
          status, 
          updated_at, 
          application_number,
          initial_assessments!inner (
            assessment_notes,
            feedback_provided,
            assessment_status,
            assessment_outcome
          )
        `)
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (!appError && applications) {
        applications.forEach(app => {
          const assessment = app.initial_assessments?.[0];
          let description = `${app.title || 'Permit Application'} ${app.application_number ? `(${app.application_number})` : ''}`;
          
          if (assessment?.feedback_provided) {
            description += ` - ${assessment.feedback_provided}`;
          }

          activities.push({
            id: app.id,
            type: 'application',
            title: getStatusUpdateTitle(app.status),
            description,
            status: app.status,
            timestamp: app.updated_at,
            actionable: app.status === 'draft' || app.status === 'requires_clarification',
            actionText: app.status === 'draft' ? 'Continue Draft' : app.status === 'requires_clarification' ? 'Respond to Feedback' : undefined
          });
        });
      }

      const { data: invoices, error: invError } = await supabase
        .from('invoices')
        .select('id, invoice_number, payment_status, amount, due_date, updated_at')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (!invError && invoices) {
        invoices.forEach(invoice => {
          const isOverdue = new Date(invoice.due_date) < new Date() && invoice.payment_status === 'pending';
          activities.push({
            id: invoice.id,
            type: 'invoice',
            title: isOverdue ? 'Overdue Payment' : `Invoice ${invoice.payment_status}`,
            description: `Invoice ${invoice.invoice_number} - K${invoice.amount}`,
            status: invoice.payment_status,
            timestamp: invoice.updated_at,
            actionable: invoice.payment_status === 'pending',
            actionText: invoice.payment_status === 'pending' ? 'View Invoice' : undefined
          });
        });
      }

      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('id, title, message, type, created_at, is_read')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!notifError && notifications) {
        notifications.forEach(notif => {
          activities.push({
            id: notif.id,
            type: 'notification',
            title: notif.title,
            description: notif.message,
            status: notif.is_read ? 'read' : 'unread',
            timestamp: notif.created_at
          });
        });
      }

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 6));

    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const getStatusUpdateTitle = (status: string) => {
    switch (status) {
      case 'approved': return 'Application Approved';
      case 'rejected': return 'Application Rejected';
      case 'under_initial_review': return 'Under Initial Review';
      case 'initial_assessment_passed': return 'Initial Assessment Passed';
      case 'pending_technical_assessment': return 'Pending Technical Assessment';
      case 'under_technical_assessment': return 'Under Technical Assessment';
      case 'requires_clarification': return 'Requires Clarification';
      case 'submitted': return 'Application Submitted';
      case 'draft': return 'Draft Application';
      default: return 'Application Updated';
    }
  };

  const getActivityIcon = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'application':
        if (activity.status === 'approved') return <CheckCircle className="w-5 h-5 text-success" />;
        if (activity.status === 'rejected') return <AlertCircle className="w-5 h-5 text-destructive" />;
        if (activity.status === 'draft') return <Edit className="w-5 h-5 text-warning" />;
        return <FileCheck className="w-5 h-5 text-primary" />;
      case 'invoice':
        return <CreditCard className="w-5 h-5 text-accent" />;
      case 'notification':
        return <Bell className="w-5 h-5 text-warning" />;
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getActivityColors = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'application':
        if (activity.status === 'approved') return 'bg-green-50 border-green-200';
        if (activity.status === 'rejected') return 'bg-red-50 border-red-200';
        if (activity.status === 'draft') return 'bg-amber-50 border-amber-200';
        return 'bg-blue-50 border-blue-200';
      case 'invoice':
        return activity.status === 'pending' ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200';
      case 'notification':
        return activity.status === 'unread' ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Active Applications"
          value={loading ? "..." : stats.activeApplications.toString()}
          change={1}
          trend="up"
          icon={<FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
          className="touch-manipulation"
        />
        <KPICard
          title="Approved Permits"
          value={loading ? "..." : stats.approvedPermits.toString()}
          change={2}
          trend="up"
          icon={<Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
          className="touch-manipulation"
        />
        <KPICard
          title="Pending Payments"
          value={loading ? "..." : stats.pendingPayments}
          change={0}
          trend="up"
          icon={<CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />}
          className="touch-manipulation"
        />
        <KPICard
          title="Documents"
          value={loading ? "..." : stats.documentsCount.toString()}
          change={6}
          trend="up"
          icon={<Upload className="w-4 h-4 sm:w-5 sm:h-5" />}
          className="touch-manipulation"
        />
      </div>

      {/* Recent Activity */}
      <Card className="border-forest-200">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg md:text-xl text-forest-800">Recent Activity</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Your latest permit and application updates</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {recentActivities.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border ${getActivityColors(activity)} touch-manipulation`}>
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="shrink-0 mt-0.5 sm:mt-0">
                      {getActivityIcon(activity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{activity.title}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                      <span className="text-xs text-muted-foreground mt-1 block sm:hidden">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 sm:shrink-0">
                    <span className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                    {activity.actionable && activity.actionText && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onNavigate(activity.type === 'application' ? 'permits' : 'invoices')}
                        className="text-xs touch-manipulation min-h-[36px] sm:min-h-[32px]"
                      >
                        {activity.actionText}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <p>No recent activities to display.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
