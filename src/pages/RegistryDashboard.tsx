import { useState, useMemo, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RegistrySidebar } from "@/components/registry/RegistrySidebar";
import { InitialAssessmentsList } from "@/components/registry/InitialAssessmentsList";
import { EntitiesList } from "@/components/registry/EntitiesList";
import { PermitsList } from "@/components/registry/PermitsList";
import { IntentRegistrationsList } from "@/components/registry/IntentRegistrationsList";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AllocationDialog } from "@/components/shared/AllocationDialog";
import { FileText, Clock, CheckCircle, Users, AlertCircle, Plus, UserCheck, ClipboardList, ArrowRight, FileCheck, XCircle, User, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRegistryStaff } from "@/components/registry/hooks/useRegistryStaff";
import { useInitialAssessments } from "@/components/registry/hooks/useInitialAssessments";
import { TeamManagement } from "@/components/registry/TeamManagement";
import { ProfileSettings } from "@/components/public/ProfileSettings";
import { AppSettings } from "@/components/public/AppSettings";
import RegistryReports from "@/components/registry/RegistryReports";
import { ApprovedIntentsList } from "@/components/registry/ApprovedIntentsList";
import { PermitApplicationReview } from "@/components/registry/PermitApplicationReview";
import { PermitRenewalReview } from "@/components/registry/PermitRenewalReview";
import { PermitAmendmentReview } from "@/components/registry/PermitAmendmentReview";
import { PermitTransferReview } from "@/components/registry/PermitTransferReview";
import { PermitSurrenderReview } from "@/components/registry/PermitSurrenderReview";
import { PermitAmalgamationReview } from "@/components/registry/PermitAmalgamationReview";
import { PermitComplianceReview } from "@/components/registry/PermitComplianceReview";
import { PermitEnforcementReview } from "@/components/registry/PermitEnforcementReview";
import { PermitApplicationsMap } from "@/components/public/PermitApplicationsMap";
import { RegistryComplianceReporting } from "@/components/registry/RegistryComplianceReporting";
import { UnitNotificationsPanel } from "@/components/notifications/UnitNotificationsPanel";
import { useUnitNotifications } from "@/hooks/useUnitNotifications";
import { supabase } from "@/integrations/supabase/client";
import { RegistryDocumentManagement } from "@/components/registry/RegistryDocumentManagement";

const RegistryDashboard = () => {
  const { profile } = useAuth();
  const { assessments, loading } = useInitialAssessments();
  const { staff } = useRegistryStaff();
  const { notifications } = useUnitNotifications('registry');
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState({
    totalEntities: 0,
    activePermits: 0,
    pendingApplications: 0,
    pendingPayments: 0,
    expiringSoon: 0
  });
  
  const isManager = profile?.staff_position && ['manager', 'director', 'managing_director'].includes(profile.staff_position);
  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total Entities
        const { count: totalEntities } = await supabase
          .from('entities')
          .select('*', { count: 'exact', head: true });

        // Active Permits (approved status)
        const { count: activePermits } = await supabase
          .from('permit_applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');

        // Pending Applications (pending intents + pending permits)
        const { count: pendingIntents } = await supabase
          .from('intent_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const { count: pendingPermits } = await supabase
          .from('permit_applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Pending Payments
        const { count: pendingPayments } = await supabase
          .from('fee_payments')
          .select('*', { count: 'exact', head: true })
          .eq('payment_status', 'pending');

        // Expiring Soon (permits expiring within 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const { count: expiringSoon } = await supabase
          .from('permit_applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved')
          .lte('permit_end_date', thirtyDaysFromNow.toISOString())
          .gte('permit_end_date', new Date().toISOString());

        setDashboardStats({
          totalEntities: totalEntities || 0,
          activePermits: activePermits || 0,
          pendingApplications: (pendingIntents || 0) + (pendingPermits || 0),
          pendingPayments: pendingPayments || 0,
          expiringSoon: expiringSoon || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <RegistrySidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col overflow-x-hidden">
          {/* Header */}
          <header className="border-b border-sidebar-border bg-background p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <SidebarTrigger className="hover:bg-sidebar-accent" />
                <div>
                  <h1 className="text-xl md:text-3xl font-bold text-card-foreground">
                    Registry {isManager ? 'Management' : 'Unit'} Dashboard
                  </h1>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    {isManager 
                      ? 'Manage permit assessments and allocate work to registry officers'
                      : 'Conduct initial permit assessments and reviews'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('notifications')}
                    className="relative"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                    <Badge 
                      variant="destructive" 
                      className="ml-2 px-1.5 py-0.5 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  </Button>
                )}
                <Badge variant="secondary" className="px-4 py-2">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Registry {isManager ? 'Manager' : 'Officer'}
                </Badge>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-4 md:space-y-6">
                {/* Dashboard KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-sm text-card-foreground">
                        <Users className="w-4 h-4 mr-2 text-blue-500" />
                        Total Entities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">{dashboardStats.totalEntities}</div>
                      <p className="text-xs text-muted-foreground mt-1">Registered entities</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-sm text-card-foreground">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Active Permits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">{dashboardStats.activePermits}</div>
                      <p className="text-xs text-muted-foreground mt-1">Approved permits</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-sm text-card-foreground">
                        <Clock className="w-4 h-4 mr-2 text-amber-500" />
                        Pending Applications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-amber-600">{dashboardStats.pendingApplications}</div>
                      <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-sm text-card-foreground">
                        <FileText className="w-4 h-4 mr-2 text-purple-500" />
                        Pending Payments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600">{dashboardStats.pendingPayments}</div>
                      <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-sm text-card-foreground">
                        <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                        Expiring Soon
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600">{dashboardStats.expiringSoon}</div>
                      <p className="text-xs text-muted-foreground mt-1">Within 30 days</p>
                    </CardContent>
                  </Card>
                </div>

                 {/* Permit Applications Map */}
                 <PermitApplicationsMap 
                   showAllApplications={true}
                   defaultStatuses={['approved']}
                   hideDrawingTools={true}
                   customTitle="Approved Permit Applications Map"
                   customDescription="View approved permit applications across Papua New Guinea with GIS boundary layers. Toggle layers to see administrative boundaries and protected areas."
                 />

                 {/* Recent Activities */}
                 <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div>
                        <CardTitle className="text-base md:text-lg text-card-foreground">Recent Activities</CardTitle>
                        <CardDescription className="text-xs md:text-sm text-muted-foreground">Latest updates and actions in the registry unit</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 md:space-y-4">
                      {loading ? (
                        <div className="text-center py-6 md:py-8 text-muted-foreground text-sm">Loading activities...</div>
                      ) : assessments.length === 0 ? (
                        <div className="text-center py-6 md:py-8 text-muted-foreground text-sm">No recent activities</div>
                      ) : (
                        assessments.slice(0, 6).map((assessment) => {
                          const getActivityIcon = () => {
                            switch (assessment.assessment_status) {
                              case 'passed':
                                return { icon: CheckCircle, color: 'green' };
                              case 'failed':
                                return { icon: XCircle, color: 'red' };
                              case 'requires_clarification':
                                return { icon: AlertCircle, color: 'amber' };
                              default:
                                return { icon: Clock, color: 'blue' };
                            }
                          };

                          const { icon: Icon, color } = getActivityIcon();
                          const activityTitle = assessment.assessment_status === 'passed' 
                            ? 'Assessment Approved'
                            : assessment.assessment_status === 'failed'
                            ? 'Assessment Failed'
                            : assessment.assessment_status === 'requires_clarification'
                            ? 'Clarification Required'
                            : 'New Assessment';

                           return (
                            <div key={assessment.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                              <div className={`p-2 rounded-full bg-${color}-100 dark:bg-${color}-950`}>
                                <Icon className={`w-5 h-5 text-${color}-600`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                  <p className="font-medium text-card-foreground">{activityTitle}</p>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(assessment.updated_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Application <span className="font-medium text-card-foreground">
                                    {assessment.permit_application?.application_number || assessment.permit_application?.title || 'N/A'}
                                  </span> {assessment.assessment_notes}
                                </p>
                                <div className="flex gap-2 mt-2">
                                  {assessment.permit_application?.permit_type && (
                                    <Badge variant="secondary" className="text-xs">
                                      {assessment.permit_application.permit_type}
                                    </Badge>
                                  )}
                                  {assessment.permit_application?.entity_name && (
                                    <Badge variant="outline" className="text-xs">
                                      {assessment.permit_application.entity_name}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Allocation Dialog */}
                <AllocationDialog
                  open={allocationDialogOpen}
                  onOpenChange={setAllocationDialogOpen}
                  staffUnit="registry"
                />
              </div>
            )}

            {activeTab === 'intent-reviews' && <ApprovedIntentsList />}
            {activeTab === 'documents-management' && <RegistryDocumentManagement />}
            {activeTab === 'compliance-reporting' && <RegistryComplianceReporting />}
            {activeTab === 'permit-reviews' && <PermitApplicationReview />}
            {activeTab === 'entities' && <EntitiesList />}
            {activeTab === 'intents' && <IntentRegistrationsList />}
            {activeTab === 'permits' && <PermitsList />}
            {activeTab === 'permit-amalgamation' && <PermitAmalgamationReview />}
            {activeTab === 'permit-amendments' && <PermitAmendmentReview />}
            {activeTab === 'permit-compliance' && <PermitComplianceReview />}
            {activeTab === 'permit-enforcement' && <PermitEnforcementReview />}
            {activeTab === 'permit-renewal' && <PermitRenewalReview />}
            {activeTab === 'permit-surrender' && <PermitSurrenderReview />}
            {activeTab === 'permit-transfer' && <PermitTransferReview />}
            {activeTab === 'notifications' && <UnitNotificationsPanel unit="registry" />}
            {activeTab === 'reports' && <RegistryReports />}
            {activeTab === 'team' && isManager && <TeamManagement />}
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'settings' && <AppSettings />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RegistryDashboard;