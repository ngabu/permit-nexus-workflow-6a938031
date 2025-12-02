import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Target, TrendingUp, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export default function PerformanceMetrics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>({
    units: [],
    staff: [],
    overall: {},
  });

  useEffect(() => {
    fetchPerformanceMetrics();
  }, []);

  const fetchPerformanceMetrics = async () => {
    try {
      setLoading(true);

      // Fetch staff profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'staff');

      // Fetch all applications with assessments
      const { data: applications } = await supabase
        .from('permit_applications')
        .select(`
          *,
          initial_assessments(*),
          compliance_assessments(*)
        `);

      // Fetch directorate approvals
      const { data: approvals } = await supabase
        .from('directorate_approvals')
        .select('*');

      // Process unit performance
      const unitPerformance = calculateUnitPerformance(profiles || [], applications || [], approvals || []);
      
      // Process staff performance
      const staffPerformance = calculateStaffPerformance(profiles || [], applications || []);
      
      // Calculate overall metrics
      const overallMetrics = calculateOverallMetrics(applications || [], approvals || []);

      setMetrics({
        units: unitPerformance,
        staff: staffPerformance,
        overall: overallMetrics,
      });
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch performance metrics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateUnitPerformance = (profiles: any[], applications: any[], approvals: any[]) => {
    const units = ['registry', 'compliance', 'revenue', 'finance'];
    return units.map(unit => {
      const staffCount = profiles.filter(p => p.staff_unit === unit).length;
      const pendingAssessments = applications.filter(app => 
        app.initial_assessments?.some((a: any) => a.assessment_status === 'pending') ||
        app.compliance_assessments?.some((a: any) => a.assessment_status === 'pending')
      ).length;
      const completedThisMonth = applications.filter(app => {
        const assessment = app.initial_assessments?.[0] || app.compliance_assessments?.[0];
        if (!assessment) return false;
        const assessmentDate = new Date(assessment.updated_at);
        const now = new Date();
        return assessmentDate.getMonth() === now.getMonth() && 
               assessmentDate.getFullYear() === now.getFullYear() &&
               assessment.assessment_status === 'completed';
      }).length;

      return {
        unit,
        staffCount,
        pendingAssessments,
        completedThisMonth,
        efficiency: pendingAssessments > 0 ? Math.round((completedThisMonth / (completedThisMonth + pendingAssessments)) * 100) : 100,
      };
    });
  };

  const calculateStaffPerformance = (profiles: any[], applications: any[]) => {
    return profiles
      .filter(p => p.staff_unit && p.staff_position)
      .map(profile => {
        const assessedApplications = applications.filter(app => 
          app.initial_assessments?.some((a: any) => a.assessed_by === profile.user_id) ||
          app.compliance_assessments?.some((a: any) => a.assessed_by === profile.user_id)
        );
        
        const thisMonthAssessments = assessedApplications.filter(app => {
          const assessment = app.initial_assessments?.[0] || app.compliance_assessments?.[0];
          if (!assessment) return false;
          const date = new Date(assessment.updated_at);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });

        return {
          name: profile.full_name || 'Unknown',
          unit: profile.staff_unit,
          position: profile.staff_position,
          totalAssessments: assessedApplications.length,
          thisMonth: thisMonthAssessments.length,
          performance: thisMonthAssessments.length >= 10 ? 'Excellent' : 
                      thisMonthAssessments.length >= 5 ? 'Good' : 'Needs Improvement',
        };
      })
      .sort((a, b) => b.thisMonth - a.thisMonth)
      .slice(0, 10);
  };

  const calculateOverallMetrics = (applications: any[], approvals: any[]) => {
    const totalApplications = applications.length;
    const approvedApplications = applications.filter(a => a.status === 'approved').length;
    const pendingApplications = applications.filter(a => 
      a.status === 'pending' || a.status === 'under_assessment'
    ).length;
    const avgProcessingTime = calculateAvgProcessingTime(applications);
    const approvalRate = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;
    const pendingApprovals = approvals.filter(a => a.approval_status === 'pending').length;

    return {
      totalApplications,
      approvedApplications,
      pendingApplications,
      avgProcessingTime,
      approvalRate,
      pendingApprovals,
    };
  };

  const calculateAvgProcessingTime = (applications: any[]) => {
    const completedApps = applications.filter(a => a.status === 'approved' && a.approved_at);
    if (completedApps.length === 0) return 0;
    
    const totalDays = completedApps.reduce((sum, app) => {
      const start = new Date(app.created_at);
      const end = new Date(app.approved_at);
      const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    
    return Math.round(totalDays / completedApps.length);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Performance Metrics</h1>
          <p className="text-muted-foreground mt-1">
            Track organizational performance and key performance indicators
          </p>
        </div>

        {/* Overall KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.overall.totalApplications || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.overall.approvedApplications || 0}</div>
              <p className="text-xs text-muted-foreground">Approval rate: {metrics.overall.approvalRate?.toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{metrics.overall.pendingApplications || 0}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.overall.avgProcessingTime || 0}</div>
              <p className="text-xs text-muted-foreground">Days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.overall.pendingApprovals || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting decision</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.overall.approvalRate?.toFixed(0) || 0}%</div>
              <p className="text-xs text-muted-foreground">Overall</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="units" className="w-full">
          <TabsList>
            <TabsTrigger value="units">Unit Performance</TabsTrigger>
            <TabsTrigger value="staff">Staff Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="units" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Unit Performance Overview</CardTitle>
                <CardDescription>Performance metrics by organizational unit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {metrics.units.map((unit: any) => (
                    <div key={unit.unit} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-32 font-medium capitalize">{unit.unit}</div>
                          <Badge variant="outline">
                            <Users className="w-3 h-3 mr-1" />
                            {unit.staffCount} staff
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">Pending: </span>
                            <span className="font-medium">{unit.pendingAssessments}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Completed: </span>
                            <span className="font-medium">{unit.completedThisMonth}</span>
                          </div>
                          <div className="w-24 text-right">
                            <span className="font-bold text-primary">{unit.efficiency}%</span>
                          </div>
                        </div>
                      </div>
                      <Progress value={unit.efficiency} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Staff</CardTitle>
                <CardDescription>Staff members with highest assessment completion rates this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.staff.map((staff: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {index < 3 && (
                          <Award className={`w-6 h-6 ${
                            index === 0 ? 'text-yellow-500' :
                            index === 1 ? 'text-gray-400' :
                            'text-orange-600'
                          }`} />
                        )}
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {staff.position} • {staff.unit}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-bold text-lg">{staff.thisMonth}</div>
                          <div className="text-xs text-muted-foreground">This month</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{staff.totalAssessments} total</div>
                        </div>
                        <Badge variant={
                          staff.performance === 'Excellent' ? 'default' :
                          staff.performance === 'Good' ? 'secondary' :
                          'outline'
                        }>
                          {staff.performance}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Historical performance data and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                  <p>Trend analysis coming soon</p>
                  <p className="text-sm mt-2">Historical performance tracking will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
