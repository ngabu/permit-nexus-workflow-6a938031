
import { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { PublicSidebar } from '@/components/public/PublicSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { FileText, Upload, CreditCard, Eye, Plus, TreePine, Building2, Bell, FileCheck, Edit, AlertCircle, CheckCircle } from 'lucide-react';
import { KPICard } from '@/components/kpi-card';
import { EntityManagement } from '@/components/public/EntityManagement';
import { PermitManagement } from '@/components/public/PermitManagement';
import { InvoiceManagement } from '@/components/public/InvoiceManagement';
import { PaymentSummary } from '@/components/public/PaymentSummary';
import { NotificationCenter } from '@/components/public/NotificationCenter';
import { DocumentManagement } from '@/components/public/DocumentManagement';
import { ApplicationDetailDialog } from '@/components/public/ApplicationDetailDialog';
import { ProfileSettings } from '@/components/public/ProfileSettings';
import { AppSettings } from '@/components/public/AppSettings';
import { ComprehensivePermitForm } from '@/components/public/ComprehensivePermitForm';
import { PermitApplicationsMap } from '@/components/public/PermitApplicationsMap';
import PermitAmalgamation from '@/pages/permit-management/PermitAmalgamation';
import PermitAmendment from '@/pages/permit-management/PermitAmendment';
import PermitCompliance from '@/pages/permit-management/PermitCompliance';
import PermitEnforcement from '@/pages/permit-management/PermitEnforcement';
import PermitRenewal from '@/pages/permit-management/PermitRenewal';
import PermitSurrender from '@/pages/permit-management/PermitSurrender';
import PermitTransfer from '@/pages/permit-management/PermitTransfer';
import { supabase } from '@/integrations/supabase/client';
import { useUserNotifications } from '@/hooks/useUserNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { IntentRegistrationNew } from '@/components/public/IntentRegistrationNew';
import { IntentRegistrationList } from '@/components/public/IntentRegistrationList';
import { ComplianceReportingView } from '@/components/public/ComplianceReportingView';

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

export default function PublicDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    activeApplications: 0,
    approvedPermits: 0,
    pendingPayments: 'K0',
    documentsCount: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);
  const { user, profile } = useAuth();
  const { unreadCount } = useUserNotifications(user?.id);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
      fetchRecentActivities();
    }
  }, [user]);

  useEffect(() => {
    // Listen for navigation events from notifications
    const handleNavigateToPermits = (event: CustomEvent) => {
      setActiveTab('permits');
    };

    window.addEventListener('navigate-to-permits', handleNavigateToPermits as EventListener);
    
    return () => {
      window.removeEventListener('navigate-to-permits', handleNavigateToPermits as EventListener);
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Get active applications (submitted, under review statuses)
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

      // Get approved permits
      const { data: approvedApps, error: approvedError } = await supabase
        .from('permit_applications')
        .select('id')
        .eq('status', 'approved')
        .eq('user_id', user?.id);

      if (approvedError) throw approvedError;

      // Get pending payments (invoices that are pending or overdue)
      const { data: invoices, error: invoicesError } = await (supabase as any)
        .from('invoices')
        .select('amount')
        .in('payment_status', ['pending', 'overdue'])
        .eq('user_id', user?.id);

      if (invoicesError) throw invoicesError;

      const totalPending = invoices?.reduce((sum: number, invoice: any) => sum + (invoice.amount || 0), 0) || 0;

      // Get documents count
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

      // Get recent permit applications with assessment feedback
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
          
          // Add registry feedback if available
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

      // Get recent invoices
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

      // Get recent notifications
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

      // Sort all activities by timestamp and take the most recent 6
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PublicSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col">
          {/* Header - Mobile Responsive */}
          <header className="border-b border-sidebar-border bg-background px-4 py-4 sm:px-6 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <SidebarTrigger className="hover:bg-sidebar-accent mt-1 sm:mt-0 shrink-0" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-forest-800 truncate">My Applications</h1>
                  <p className="text-sm sm:text-base text-forest-600 mt-0.5 sm:mt-1">Manage your permit applications and documents</p>
                </div>
              </div>
              {profile && (
                <div className="text-left sm:text-right pl-11 sm:pl-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Logged in as</p>
                  <p className="text-sm sm:text-base font-semibold text-forest-800 truncate">
                    {profile.full_name || profile.first_name || profile.last_name || user?.email || 'User'}
                  </p>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-4 sm:space-y-6">
            {/* Quick Stats - Mobile Responsive Grid */}
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

            {/* Permit Applications Map */}
            <div className="w-full">
              <PermitApplicationsMap 
                onPermitClick={(permitId) => {
                  setSelectedApplicationId(permitId);
                  setActiveTab('permit-application-new');
                }}
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
                              onClick={() => setActiveTab(activity.type === 'application' ? 'permits' : 'invoices')}
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
                    <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">No recent activity found</p>
                    <p className="text-xs sm:text-sm mt-1">Start by creating your first permit application</p>
                  </div>
                )}
              </CardContent>
            </Card>
              </div>
            )}

            {activeTab === 'entities' && (
              <div className="max-w-7xl mx-auto">
                <EntityManagement />
              </div>
            )}
            {activeTab === 'intent-registration-new' && (
              <div className="max-w-7xl mx-auto">
                <IntentRegistrationNew />
              </div>
            )}
            {activeTab === 'intent-registration-existing' && (
              <div className="max-w-7xl mx-auto">
                <IntentRegistrationList />
              </div>
            )}
            {activeTab === 'permits' && (
              <div className="max-w-7xl mx-auto">
                <PermitManagement onNavigateToNewApplication={() => {
                  setSelectedApplicationId(null);
                  setActiveTab('permit-application-new');
                }} />
              </div>
            )}
            {activeTab === 'permit-application-new' && (
              <div className="max-w-7xl mx-auto">
                <ComprehensivePermitForm
                  permitId={selectedApplicationId || undefined}
                  onSuccess={() => {
                    setActiveTab('permits');
                    setSelectedApplicationId(null);
                  }}
                  onCancel={() => {
                    setActiveTab('permits');
                    setSelectedApplicationId(null);
                  }}
                  isStandalone={false}
                />
              </div>
            )}
            {activeTab === 'permit-amalgamation' && (
              <div className="max-w-7xl mx-auto">
                <PermitAmalgamation />
              </div>
            )}
            {activeTab === 'permit-amendment' && (
              <div className="max-w-7xl mx-auto">
                <PermitAmendment />
              </div>
            )}
            {activeTab === 'permit-compliance' && (
              <div className="max-w-7xl mx-auto">
                <PermitCompliance />
              </div>
            )}
            {activeTab === 'permit-enforcement' && (
              <div className="max-w-7xl mx-auto">
                <PermitEnforcement />
              </div>
            )}
            {activeTab === 'permit-renewal' && (
              <div className="max-w-7xl mx-auto">
                <PermitRenewal />
              </div>
            )}
            {activeTab === 'permit-surrender' && (
              <div className="max-w-7xl mx-auto">
                <PermitSurrender />
              </div>
            )}
            {activeTab === 'permit-transfer' && (
              <div className="max-w-7xl mx-auto">
                <PermitTransfer />
              </div>
            )}
            {activeTab === 'invoices' && (
              <div className="max-w-7xl mx-auto">
                <InvoiceManagement />
              </div>
            )}
            {activeTab === 'payment-summary' && (
              <div className="max-w-7xl mx-auto">
                <PaymentSummary />
              </div>
            )}
            {activeTab === 'notifications' && (
              <div className="max-w-7xl mx-auto">
                <NotificationCenter 
                  onViewApplication={(permitId) => {
                    setSelectedApplicationId(permitId);
                    setShowApplicationDetail(true);
                  }} 
                />
              </div>
            )}
            {activeTab === 'documents' && (
              <div className="max-w-7xl mx-auto">
                <DocumentManagement />
              </div>
            )}
            {activeTab === 'compliance-reporting' && (
              <div className="max-w-7xl mx-auto">
                <ComplianceReportingView />
              </div>
            )}
            {activeTab === 'profile' && (
              <div className="max-w-4xl mx-auto">
                <ProfileSettings />
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto">
                <AppSettings />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Application Detail Dialog */}
      {selectedApplicationId && (
        <ApplicationDetailDialog
          open={showApplicationDetail}
          onOpenChange={setShowApplicationDetail}
          permitApplicationId={selectedApplicationId}
        />
      )}
    </SidebarProvider>
  );
}
