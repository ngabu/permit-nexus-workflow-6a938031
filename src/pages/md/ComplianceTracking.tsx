import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, FileText, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

export default function ComplianceTracking() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [complianceData, setComplianceData] = useState<any>({
    assessments: [],
    reports: [],
    inspections: [],
    summary: {},
  });

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);

      // Fetch compliance assessments
      const { data: assessments } = await supabase
        .from('compliance_assessments')
        .select(`
          *,
          permit_applications(title, entity_name, permit_type)
        `)
        .order('created_at', { ascending: false });

      // Fetch compliance reports
      const { data: reports } = await supabase
        .from('compliance_reports')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch inspections
      const { data: inspections } = await supabase
        .from('inspections')
        .select('*')
        .order('scheduled_date', { ascending: false });

      const summary = calculateComplianceSummary(
        assessments || [],
        reports || [],
        inspections || []
      );

      setComplianceData({
        assessments: assessments || [],
        reports: reports || [],
        inspections: inspections || [],
        summary,
      });
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch compliance data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateComplianceSummary = (assessments: any[], reports: any[], inspections: any[]) => {
    const totalAssessments = assessments.length;
    const pendingAssessments = assessments.filter(a => a.assessment_status === 'pending').length;
    const completedAssessments = assessments.filter(a => a.assessment_status === 'completed').length;
    const avgComplianceScore = assessments.length > 0
      ? assessments.reduce((sum, a) => sum + (a.compliance_score || 0), 0) / assessments.length
      : 0;

    const totalReports = reports.length;
    const pendingReports = reports.filter(r => r.status === 'pending').length;
    const approvedReports = reports.filter(r => r.status === 'approved').length;

    const totalInspections = inspections.length;
    const scheduledInspections = inspections.filter(i => i.status === 'scheduled').length;
    const completedInspections = inspections.filter(i => i.status === 'completed').length;

    const violationsCount = assessments.reduce((sum, a) => {
      const violations = a.violations_found || [];
      return sum + (Array.isArray(violations) ? violations.length : 0);
    }, 0);

    return {
      totalAssessments,
      pendingAssessments,
      completedAssessments,
      avgComplianceScore,
      totalReports,
      pendingReports,
      approvedReports,
      totalInspections,
      scheduledInspections,
      completedInspections,
      violationsCount,
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Monitor compliance assessments, inspections, and regulatory adherence
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  {complianceData.summary.avgComplianceScore?.toFixed(1) || 0}%
                </div>
                <Progress value={complianceData.summary.avgComplianceScore || 0} className="h-2" />
                <p className="text-xs text-muted-foreground">Average across all assessments</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{complianceData.summary.pendingAssessments || 0}</span>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {complianceData.summary.totalAssessments || 0} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{complianceData.summary.pendingReports || 0}</span>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {complianceData.summary.approvedReports || 0} approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Violations Found</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-red-600">
                  {complianceData.summary.violationsCount || 0}
                </span>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="assessments" className="w-full">
          <TabsList>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
          </TabsList>

          <TabsContent value="assessments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Assessments</CardTitle>
                <CardDescription>
                  {complianceData.summary.pendingAssessments} pending • {complianceData.summary.completedAssessments} completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceData.assessments.map((assessment: any) => (
                    <div key={assessment.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-medium">
                            {assessment.permit_applications?.title || 'Untitled Application'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {assessment.permit_applications?.entity_name}
                          </div>
                        </div>
                        <Badge variant={
                          assessment.assessment_status === 'completed' ? 'default' :
                          assessment.assessment_status === 'pending' ? 'secondary' :
                          'outline'
                        }>
                          {assessment.assessment_status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Score: </span>
                          <span className="font-medium">{assessment.compliance_score || 0}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Activity: </span>
                          <span className="font-medium capitalize">
                            {assessment.activity_type?.replace('_', ' ') || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Level: </span>
                          <span className="font-medium">{assessment.activity_level || 'N/A'}</span>
                        </div>
                      </div>
                      {assessment.assessment_notes && (
                        <div className="mt-3 text-sm text-muted-foreground">
                          {assessment.assessment_notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
                <CardDescription>
                  Submitted reports and their review status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceData.reports.map((report: any) => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium">
                            Report #{report.id.slice(0, 8)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(report.report_date), 'PPP')}
                          </div>
                        </div>
                        <Badge variant={
                          report.status === 'approved' ? 'default' :
                          report.status === 'pending' ? 'secondary' :
                          'destructive'
                        }>
                          {report.status}
                        </Badge>
                      </div>
                      {report.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {report.description}
                        </p>
                      )}
                      {report.reviewed_at && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Reviewed: {format(new Date(report.reviewed_at), 'PPP')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inspections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inspections Schedule</CardTitle>
                <CardDescription>
                  {complianceData.summary.scheduledInspections} scheduled • {complianceData.summary.completedInspections} completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceData.inspections.map((inspection: any) => (
                    <div key={inspection.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium capitalize">
                              {inspection.inspection_type.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(inspection.scheduled_date), 'PPP')}
                            </div>
                            {inspection.province && (
                              <div className="text-sm text-muted-foreground">
                                Location: {inspection.province}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant={
                          inspection.status === 'completed' ? 'default' :
                          inspection.status === 'scheduled' ? 'secondary' :
                          'outline'
                        }>
                          {inspection.status}
                        </Badge>
                      </div>
                      {inspection.findings && (
                        <div className="mt-3 p-3 bg-muted rounded text-sm">
                          <div className="font-medium mb-1">Findings:</div>
                          {inspection.findings}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="violations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Violations</CardTitle>
                <CardDescription>
                  Issues requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceData.assessments
                    .filter((a: any) => a.violations_found && Array.isArray(a.violations_found) && a.violations_found.length > 0)
                    .map((assessment: any) => (
                      <div key={assessment.id} className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
                        <div className="flex items-start gap-3 mb-3">
                          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium">
                              {assessment.permit_applications?.title || 'Untitled'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {assessment.permit_applications?.entity_name}
                            </div>
                          </div>
                          <Badge variant="destructive">
                            {assessment.violations_found.length} Violation{assessment.violations_found.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {assessment.violations_found.map((violation: any, idx: number) => (
                            <div key={idx} className="text-sm pl-8">
                              • {typeof violation === 'string' ? violation : JSON.stringify(violation)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  {complianceData.assessments.filter((a: any) => 
                    a.violations_found && Array.isArray(a.violations_found) && a.violations_found.length > 0
                  ).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <p>No active violations found</p>
                      <p className="text-sm mt-2">All assessments are in good standing</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
