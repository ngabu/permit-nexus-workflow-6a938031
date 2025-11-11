
import { useAuth } from "@/contexts/AuthContext";
import { SimpleHeader } from "@/components/SimpleHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, XCircle, Calendar, DollarSign, Users, TrendingUp, TreePine, Plus, Building2, CreditCard, Upload, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KPICard } from "@/components/kpi-card";
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalRevenue: number;
  activeUsers: number;
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

interface PermitApplication {
  id: string;
  permit_number: string | null;
  title: string;
  permit_type: string;
  status: string;
  application_date: string;
  updated_at: string;
  entity_name: string;
  entity_type: string;
}

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalRevenue: 0,
    activeUsers: 0,
    activeApplications: 0,
    approvedPermits: 0,
    pendingPayments: 'K0',
    documentsCount: 0,
  });
  const [recentApplications, setRecentApplications] = useState<PermitApplication[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's permit applications for stats
      const { data: applications, error: appsError } = await (supabase as any)
        .from('permit_applications')
        .select('*')
        .eq('user_id', user.id);

      if (appsError) throw appsError;

      // Calculate stats for current user
      const total = applications?.length || 0;
      const pending = applications?.filter((app: any) => app.status === 'pending')?.length || 0;
      const approved = applications?.filter((app: any) => app.status === 'approved')?.length || 0;
      const rejected = applications?.filter((app: any) => app.status === 'rejected')?.length || 0;

      // Fetch user's recent applications (limit 5)
      const { data: recent, error: recentError } = await (supabase as any)
        .from('permit_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      // Fetch user's financial data
      const { data: transactions, error: finError } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'paid');

      if (finError) throw finError;

      const totalRevenue = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      setStats({
        totalApplications: total,
        pendingApplications: pending,
        approvedApplications: approved,
        rejectedApplications: rejected,
        totalRevenue,
        activeUsers: 1, // Current user
        activeApplications: pending,
        approvedPermits: approved,
        pendingPayments: `K${totalRevenue}`,
        documentsCount: total,
      });

      setRecentApplications((recent as any) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'under_review':
        return <Badge className="bg-orange-100 text-orange-800">Under Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getActivityIcon = (activity: RecentActivity) => {
    return <FileText className="w-5 h-5 text-blue-600" />;
  };

  const getActivityColors = (activity: RecentActivity) => {
    return 'bg-blue-50 border-blue-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleHeader />
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading dashboard...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <main className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-forest-800">My Applications</h1>
              <p className="text-forest-600 mt-1">Manage your permit applications and documents</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-forest-100 rounded-lg">
                <TreePine className="w-5 h-5 text-forest-600" />
                <span className="text-forest-800 font-medium">Public Portal</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard
              title="Active Applications"
              value={loading ? "..." : stats.activeApplications.toString()}
              change={1}
              trend="up"
              icon={<FileText className="w-5 h-5" />}
            />
            <KPICard
              title="Approved Permits"
              value={loading ? "..." : stats.approvedPermits.toString()}
              change={2}
              trend="up"
              icon={<Eye className="w-5 h-5" />}
            />
            <KPICard
              title="Pending Payments"
              value={loading ? "..." : stats.pendingPayments}
              change={0}
              trend="up"
              icon={<CreditCard className="w-5 h-5" />}
            />
            <KPICard
              title="Documents"
              value={loading ? "..." : stats.documentsCount.toString()}
              change={6}
              trend="up"
              icon={<Upload className="w-5 h-5" />}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-forest-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/permits')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-forest-800">
                  <Plus className="w-5 h-5 mr-2" />
                  New Permit Application
                </CardTitle>
                <CardDescription>Apply for a new environmental permit</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-forest-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/entity-registration')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-forest-800">
                  <Building2 className="w-5 h-5 mr-2" />
                  Manage Entities
                </CardTitle>
                <CardDescription>Add or update individual/company profiles</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-forest-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/payments')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-forest-800">
                  <CreditCard className="w-5 h-5 mr-2" />
                  View Invoices
                </CardTitle>
                <CardDescription>Check and pay outstanding fees</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-forest-200">
            <CardHeader>
              <CardTitle className="text-forest-800">Recent Activity</CardTitle>
              <CardDescription>Your latest permit and application updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className={`flex items-center space-x-4 p-3 rounded-lg border ${getActivityColors(activity)}`}>
                      {getActivityIcon(activity)}
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                        {activity.actionable && activity.actionText && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(activity.type === 'application' ? '/applications' : '/payments')}
                            className="text-xs"
                          >
                            {activity.actionText}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity found</p>
                  <p className="text-sm">Start by creating your first permit application</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
