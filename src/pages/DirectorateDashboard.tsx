
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleBasedStats } from '@/components/shared/RoleBasedStats';
import { ReportGenerator } from '@/components/shared/ReportGenerator';
import { PendingApprovalsList } from '@/components/directorate/PendingApprovalsList';
import { NotificationsPanel } from '@/components/directorate/NotificationsPanel';
import { useDirectorateApprovals } from '@/hooks/useDirectorateApprovals';
import { useDirectorateNotifications } from '@/hooks/useDirectorateNotifications';
import { Building, Target, Users, BarChart3, Settings, UserCheck, FileCheck, Bell, FileSignature } from 'lucide-react';
import { useState } from 'react';

export default function DirectorateDashboard() {
  const { profile } = useAuth();
  
  // Directorate staff can have any position
  const isDirectorateStaff = profile?.staff_unit === 'directorate';
  const isManagement = profile?.staff_position && ['manager', 'director', 'managing_director'].includes(profile.staff_position);
  const isManagingDirector = profile?.staff_position === 'managing_director' || profile?.email === 'admin@cepa.gov.pg';
  const userRole = isManagement ? 'manager' : 'officer';

  // Hooks for MD approval system
  const {
    approvals,
    loading: approvalsLoading,
    updateApprovalStatus,
    markLetterSigned,
    refetch: refetchApprovals,
  } = useDirectorateApprovals();

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useDirectorateNotifications(profile?.user_id);

  const pendingApprovals = approvals.filter(a => a.approval_status === 'pending');
  const approvedApprovals = approvals.filter(a => a.approval_status === 'approved');
  const requiresSignature = approvals.filter(a => a.approval_status === 'approved' && !a.letter_signed);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Directorate {isManagement ? 'Leadership' : ''} Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              {isManagement 
                ? 'Executive oversight and strategic planning for PNG Conservation'
                : 'Strategic planning and organizational oversight'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-lg">
            <Building className="w-5 h-5 text-slate-600" />
            <span className="text-slate-800 font-medium">
              {profile?.staff_position === 'managing_director' ? 'Managing Director' :
               profile?.staff_position === 'director' ? 'Director' :
               profile?.staff_position === 'manager' ? 'Directorate Manager' : 'Directorate'}
            </span>
          </div>
        </div>

        {/* Managing Director Comprehensive Dashboard Access */}
        {isManagingDirector && (
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-primary">Managing Director Comprehensive Dashboard</CardTitle>
                  <CardDescription>
                    Access your dedicated approval workflow and oversight management system
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => window.location.href = '/managing-director-dashboard'}
                  className="bg-primary hover:bg-primary/90"
                >
                  Open Comprehensive Dashboard
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Managing Director Specific Features */}
        {isManagingDirector && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-orange-800">
                    Pending Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-orange-900">
                      {pendingApprovals.length}
                    </span>
                    <FileCheck className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-800">
                    Requires Signature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-blue-900">
                      {requiresSignature.length}
                    </span>
                    <FileSignature className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-800">
                    Approved This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-green-900">
                      {approvedApprovals.length}
                    </span>
                    <UserCheck className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-red-800">
                    Urgent Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-red-900">
                      {unreadCount}
                    </span>
                    <Bell className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notifications Panel */}
            <NotificationsPanel
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
            />

            {/* Approvals Management */}
            <Card>
              <CardHeader>
                <CardTitle>Application Approvals</CardTitle>
                <CardDescription>
                  Review and approve permit applications, renewals, transfers, and other requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">
                      Pending ({pendingApprovals.length})
                    </TabsTrigger>
                    <TabsTrigger value="approved">
                      Approved ({approvedApprovals.length})
                    </TabsTrigger>
                    <TabsTrigger value="all">
                      All ({approvals.length})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="pending" className="space-y-4">
                    <PendingApprovalsList
                      approvals={pendingApprovals}
                      onApprove={(id, notes) => updateApprovalStatus(id, 'approved', notes)}
                      onReject={(id, notes) => updateApprovalStatus(id, 'rejected', notes)}
                      onRevoke={(id, notes) => updateApprovalStatus(id, 'revoked', notes)}
                      onCancel={(id, notes) => updateApprovalStatus(id, 'cancelled', notes)}
                      onSignLetter={(id) => markLetterSigned(id)}
                    />
                  </TabsContent>
                  <TabsContent value="approved" className="space-y-4">
                    <PendingApprovalsList
                      approvals={approvedApprovals}
                      onApprove={(id, notes) => updateApprovalStatus(id, 'approved', notes)}
                      onReject={(id, notes) => updateApprovalStatus(id, 'rejected', notes)}
                      onRevoke={(id, notes) => updateApprovalStatus(id, 'revoked', notes)}
                      onCancel={(id, notes) => updateApprovalStatus(id, 'cancelled', notes)}
                      onSignLetter={(id) => markLetterSigned(id)}
                    />
                  </TabsContent>
                  <TabsContent value="all" className="space-y-4">
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

        {/* Role-based Statistics */}
        {!isManagingDirector && <RoleBasedStats userRole={userRole} staffUnit="directorate" />}

        {/* Executive-level controls for management */}
        {isManagement && !isManagingDirector && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-800 flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Executive Functions
                  </CardTitle>
                  <Badge variant="secondary">
                    {profile?.staff_position === 'managing_director' ? 'MD' : 
                     profile?.staff_position === 'director' ? 'Director' : 'Manager'}
                  </Badge>
                </div>
                <CardDescription>Strategic decision making and oversight</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full mb-2">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Strategic Overview
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Organization Settings
                </Button>
              </CardContent>
            </Card>

            <ReportGenerator staffUnit="directorate" />
          </div>
        )}

        {/* Operational cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-slate-600" />
                <CardTitle className="text-slate-800">
                  {isManagement ? 'Strategic Planning' : 'Strategic Initiatives'}
                </CardTitle>
              </div>
              <CardDescription>
                {isManagement ? 'Executive strategic planning and vision' : 'Long-term strategic initiatives'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                {isManagement 
                  ? 'Executive strategic planning tools and vision setting capabilities will be implemented here.'
                  : 'Strategic planning tools and frameworks will be implemented here.'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-slate-600" />
                <CardTitle className="text-slate-800">
                  {isManagement ? 'Executive Leadership' : 'Leadership Support'}
                </CardTitle>
              </div>
              <CardDescription>
                {isManagement ? 'Senior leadership and governance' : 'Support leadership initiatives'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                {isManagement
                  ? 'Executive leadership dashboard and governance tools coming soon.'
                  : 'Leadership support tools and governance frameworks will be available here.'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-slate-600" />
                <CardTitle className="text-slate-800">
                  {isManagement ? 'Executive Performance' : 'Performance Monitoring'}
                </CardTitle>
              </div>
              <CardDescription>
                {isManagement ? 'Organization-wide performance metrics' : 'Monitor organizational performance'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                {isManagement
                  ? 'Executive performance dashboard and organizational metrics will be available here.'
                  : 'Performance monitoring and reporting dashboard will be available here.'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
