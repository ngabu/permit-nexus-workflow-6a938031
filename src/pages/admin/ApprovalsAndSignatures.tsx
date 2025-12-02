import { SimpleHeader } from '@/components/SimpleHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingApprovalsList } from '@/components/directorate/PendingApprovalsList';
import { useDirectorateApprovals } from '@/hooks/useDirectorateApprovals';
import { FileCheck, FileSignature, UserCheck } from 'lucide-react';

export default function ApprovalsAndSignatures() {
  const {
    approvals,
    loading: approvalsLoading,
    updateApprovalStatus,
    markLetterSigned,
    refetch: refetchApprovals,
  } = useDirectorateApprovals();

  // Filter approvals by status
  const pendingApprovals = approvals.filter(a => a.approval_status === 'pending');
  const approvedApprovals = approvals.filter(a => a.approval_status === 'approved');
  const requiresSignature = approvals.filter(a => a.approval_status === 'approved' && !a.letter_signed);

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <main className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Approvals & Signatures</h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive approval workflow and signature management
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  Requires review
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
                  Total Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-green-900 dark:text-green-100">
                    {approvals.length}
                  </span>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-xs text-green-600 dark:text-green-300 mt-2">
                  All applications
                </p>
              </CardContent>
            </Card>
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
      </main>
    </div>
  );
}
