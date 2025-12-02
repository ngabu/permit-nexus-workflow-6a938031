import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingApprovalsList } from '@/components/directorate/PendingApprovalsList';
import { useDirectorateApprovals } from '@/hooks/useDirectorateApprovals';
import { PermitApplicationsMap } from '@/components/public/PermitApplicationsMap';
import { FileCheck, Bell, FileSignature, UserCheck } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ManagingDirectorSidebar } from '@/components/managing-director/ManagingDirectorSidebar';
import { ManagingDirectorHeader } from '@/components/managing-director/ManagingDirectorHeader';
import { ManagingDirectorEntitiesList } from '@/components/managing-director/ManagingDirectorEntitiesList';
import { ManagingDirectorIntentsList } from '@/components/managing-director/ManagingDirectorIntentsList';
import { ManagingDirectorPermitsList } from '@/components/managing-director/ManagingDirectorPermitsList';
import { ReportsAndAnalysis } from '@/components/managing-director/ReportsAndAnalysis';

export default function ManagingDirectorDashboard() {
  const { profile } = useAuth();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<string>('dashboard');

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || null);
    });
  }, []);

  // Access control: users with staff_position = 'managing_director' or md@cepa.gov.pg
  const isManagingDirector = profile?.staff_position === 'managing_director' || userEmail === 'md@cepa.gov.pg';

  const {
    approvals,
    loading: approvalsLoading,
    updateApprovalStatus,
    markLetterSigned,
    refetch: refetchApprovals,
  } = useDirectorateApprovals();

  // Redirect if not authorized
  if (!isManagingDirector) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Filter approvals by status
  const pendingApprovals = approvals.filter(a => a.approval_status === 'pending');
  const approvedApprovals = approvals.filter(a => a.approval_status === 'approved');
  const requiresSignature = approvals.filter(a => a.approval_status === 'approved' && !a.letter_signed);

  // Calculate stats
  const thisMonth = new Date();
  const approvedThisMonth = approvals.filter(a => {
    if (a.approval_status !== 'approved' || !a.reviewed_at) return false;
    const reviewDate = new Date(a.reviewed_at);
    return reviewDate.getMonth() === thisMonth.getMonth() && 
           reviewDate.getFullYear() === thisMonth.getFullYear();
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <ManagingDirectorSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col">
          <ManagingDirectorHeader />
          <main className="flex-1 p-6 bg-background">
            {activeTab === 'dashboard' && (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Managing Director Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive approval workflow and oversight management
          </p>
        </div>

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {pendingApprovals.length}
                </span>
                <FileCheck className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-300 mt-2">
                Requires your review
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Requires Signature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {requiresSignature.length}
                </span>
                <FileSignature className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                Letters awaiting signature
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
                Approved This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {approvedThisMonth.length}
                </span>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-xs text-green-600 dark:text-green-300 mt-2">
                Applications approved
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">
                Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-red-900 dark:text-red-100">
                  {pendingApprovals.length}
                </span>
                <Bell className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-xs text-red-600 dark:text-red-300 mt-2">
                Awaiting your review
              </p>
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

      </div>
            )}

            {activeTab === 'approvals-signatures' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Approvals and Signatures</h1>
                  <p className="text-muted-foreground mt-1">Review and manage all application approvals and signatures</p>
                </div>
                
                {/* Approval Workflow Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Approval Workflow Management</CardTitle>
                    <CardDescription>
                      Review and manage all application types: new applications, renewals, transfers, surrenders, amendments, amalgamations, and enforcement actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="pending" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pending" className="relative">
                          Pending Approvals
                          {pendingApprovals.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                              {pendingApprovals.length}
                            </span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="approved" className="relative">
                          Approved
                          {requiresSignature.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                              {requiresSignature.length} to sign
                            </span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="all">
                          All Applications ({approvals.length})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="pending" className="space-y-4 mt-4">
                        <div className="rounded-lg border border-orange-200 bg-orange-50/50 dark:bg-orange-950/10 p-4">
                          <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                            Priority Workflow: {pendingApprovals.length} application{pendingApprovals.length !== 1 ? 's' : ''} awaiting your decision
                          </p>
                        </div>
                        <PendingApprovalsList
                          approvals={pendingApprovals}
                          onApprove={(id, notes) => updateApprovalStatus(id, 'approved', notes)}
                          onReject={(id, notes) => updateApprovalStatus(id, 'rejected', notes)}
                          onRevoke={(id, notes) => updateApprovalStatus(id, 'revoked', notes)}
                          onCancel={(id, notes) => updateApprovalStatus(id, 'cancelled', notes)}
                          onSignLetter={(id) => markLetterSigned(id)}
                        />
                      </TabsContent>

                      <TabsContent value="approved" className="space-y-4 mt-4">
                        <div className="rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-950/10 p-4">
                          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                            {requiresSignature.length > 0 
                              ? `${requiresSignature.length} approved application${requiresSignature.length !== 1 ? 's' : ''} require${requiresSignature.length === 1 ? 's' : ''} letter signature`
                              : 'All approved applications have signed letters'
                            }
                          </p>
                        </div>
                        <PendingApprovalsList
                          approvals={approvedApprovals}
                          onApprove={(id, notes) => updateApprovalStatus(id, 'approved', notes)}
                          onReject={(id, notes) => updateApprovalStatus(id, 'rejected', notes)}
                          onRevoke={(id, notes) => updateApprovalStatus(id, 'revoked', notes)}
                          onCancel={(id, notes) => updateApprovalStatus(id, 'cancelled', notes)}
                          onSignLetter={(id) => markLetterSigned(id)}
                        />
                      </TabsContent>

                      <TabsContent value="all" className="space-y-4 mt-4">
                        <div className="rounded-lg border border-border bg-muted/50 p-4">
                          <p className="text-sm text-muted-foreground font-medium">
                            Complete approval history: {approvals.length} total application{approvals.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <PendingApprovalsList
                          approvals={approvals}
                          onApprove={(id, notes) => updateApprovalStatus(id, 'approved', notes)}
                          onReject={(id, notes) => updateApprovalStatus(id, 'rejected', notes)}
                          onRevoke={(id, notes) => updateApprovalStatus(id, 'revoked', notes)}
                          onCancel={(id, notes) => updateApprovalStatus(id, 'cancelled', notes)}
                          onSignLetter={(id) => markLetterSigned(id)}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'listings-entities' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Entities</h1>
                  <p className="text-muted-foreground mt-1">View and filter all registered entities</p>
                </div>
                <ManagingDirectorEntitiesList />
              </div>
            )}

            {activeTab === 'listings-intents' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Intent Registrations</h1>
                  <p className="text-muted-foreground mt-1">View and filter all intent registrations</p>
                </div>
                <ManagingDirectorIntentsList />
              </div>
            )}

            {activeTab === 'listings-permits' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Permits</h1>
                  <p className="text-muted-foreground mt-1">View and filter all approved permits</p>
                </div>
                <ManagingDirectorPermitsList />
              </div>
            )}

            {activeTab === 'reports-analysis' && (
              <ReportsAndAnalysis />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
