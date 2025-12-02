import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDirectorateApprovals } from '@/hooks/useDirectorateApprovals';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileCheck, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { PendingApprovalsList } from '@/components/directorate/PendingApprovalsList';

export default function ApprovalsOverview() {
  const { approvals, loading, updateApprovalStatus, markLetterSigned } = useDirectorateApprovals();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Filter approvals
  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch = approval.application?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.application?.entity_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || approval.approval_status === filterStatus;
    const matchesType = filterType === 'all' || approval.application_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate statistics
  const stats = {
    total: approvals.length,
    pending: approvals.filter(a => a.approval_status === 'pending').length,
    approved: approvals.filter(a => a.approval_status === 'approved').length,
    rejected: approvals.filter(a => a.approval_status === 'rejected').length,
    awaitingSignature: approvals.filter(a => a.approval_status === 'approved' && !a.letter_signed).length,
  };

  // Get unique application types
  const applicationTypes = [...new Set(approvals.map(a => a.application_type))];

  // Group by type
  const byType = applicationTypes.map(type => ({
    type,
    count: approvals.filter(a => a.application_type === type).length,
    pending: approvals.filter(a => a.application_type === type && a.approval_status === 'pending').length,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Approvals Overview</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive approval tracking and management system
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stats.total}</span>
                <FileCheck className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.pending}</span>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.approved}</span>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-red-900 dark:text-red-100">{stats.rejected}</span>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Awaiting Signature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.awaitingSignature}</span>
                <AlertTriangle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Types Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Applications by Type</CardTitle>
            <CardDescription>Breakdown of approval requests by application type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {byType.map(item => (
                <div key={item.type} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{item.type.replace('_', ' ')}</span>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.pending} pending review
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Approval Records</CardTitle>
            <CardDescription>Search and filter all approval records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Input
                placeholder="Search by application name or entity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:w-1/3"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="md:w-1/4">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="md:w-1/4">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {applicationTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="filtered" className="w-full">
              <TabsList>
                <TabsTrigger value="filtered">
                  Filtered Results ({filteredApprovals.length})
                </TabsTrigger>
                <TabsTrigger value="timeline">Timeline View</TabsTrigger>
              </TabsList>

              <TabsContent value="filtered" className="space-y-4 mt-4">
                <PendingApprovalsList
                  approvals={filteredApprovals}
                  onApprove={(id, notes) => updateApprovalStatus(id, 'approved', notes)}
                  onReject={(id, notes) => updateApprovalStatus(id, 'rejected', notes)}
                  onRevoke={(id, notes) => updateApprovalStatus(id, 'revoked', notes)}
                  onCancel={(id, notes) => updateApprovalStatus(id, 'cancelled', notes)}
                  onSignLetter={(id) => markLetterSigned(id)}
                />
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4 mt-4">
                <div className="space-y-4">
                  {filteredApprovals
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map(approval => (
                      <div key={approval.id} className="border-l-4 border-primary pl-4 py-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{approval.application?.title || 'Untitled'}</div>
                            <div className="text-sm text-muted-foreground">
                              {approval.application?.entity_name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Submitted: {format(new Date(approval.submitted_at), 'PPP')}
                              {approval.reviewed_at && (
                                <> • Reviewed: {format(new Date(approval.reviewed_at), 'PPP')}</>
                              )}
                            </div>
                          </div>
                          <Badge variant={
                            approval.approval_status === 'approved' ? 'default' :
                            approval.approval_status === 'pending' ? 'secondary' :
                            'destructive'
                          }>
                            {approval.approval_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
