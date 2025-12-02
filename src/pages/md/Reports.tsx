import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, FileText, BarChart3, PieChart } from "lucide-react";
import { useDirectorateApprovals } from "@/hooks/useDirectorateApprovals";
import { usePermitApplications } from "@/hooks/usePermitApplications";

export default function MDReports() {
  const { approvals } = useDirectorateApprovals();
  const { applications } = usePermitApplications();

  const generateReport = (type: string) => {
    console.log(`Generating ${type} report...`);
  };

  const stats = {
    totalApplications: applications.length,
    pendingApprovals: approvals.filter(a => a.approval_status === 'pending').length,
    approvedApplications: approvals.filter(a => a.approval_status === 'approved').length,
    rejectedApplications: approvals.filter(a => a.approval_status === 'rejected').length,
    revokedPermits: approvals.filter(a => a.approval_status === 'revoked').length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Executive Reports</h1>
        <p className="text-muted-foreground">Comprehensive reports and analytics for decision-making</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">All permit applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Awaiting decision</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.approvedApplications}</div>
            <p className="text-xs text-muted-foreground">Approved applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rejected/Revoked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.rejectedApplications + stats.revokedPermits}
            </div>
            <p className="text-xs text-muted-foreground">Enforcement actions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="operational" className="space-y-4">
        <TabsList>
          <TabsTrigger value="operational">Operational Reports</TabsTrigger>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
          <TabsTrigger value="strategic">Strategic Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="operational" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Application Processing Report
                </CardTitle>
                <CardDescription>
                  Overview of application processing times and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => generateReport('processing')} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Approval Status Summary
                </CardTitle>
                <CardDescription>
                  Breakdown of approvals, rejections, and pending items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => generateReport('status')} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Inspection Activity Report
                </CardTitle>
                <CardDescription>
                  Summary of scheduled and completed inspections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => generateReport('inspections')} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Performance Report
                </CardTitle>
                <CardDescription>
                  Key performance indicators and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => generateReport('performance')} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Financial reports coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Compliance reports coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategic" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Strategic reports coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
