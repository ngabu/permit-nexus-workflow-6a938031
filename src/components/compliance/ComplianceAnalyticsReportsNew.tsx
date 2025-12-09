import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Download, 
  Printer, 
  Mail, 
  Calendar,
  Filter,
  ClipboardCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Eye,
  FileText,
  Shield,
  Target,
  AlertTriangle,
  MapPin,
  Users,
  Activity,
  Gavel
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";
import { useDateFilter, type DateFilterPeriod } from "@/hooks/useDateFilter";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

const ComplianceAnalyticsReportsNew = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<DateFilterPeriod>("monthly");
  const dateRange = useDateFilter(selectedPeriod);

  // Fetch compliance assessments
  const { data: assessmentsData, isLoading: assessmentsLoading } = useQuery({
    queryKey: ['compliance-assessments-analytics-new', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_assessments')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch inspections
  const { data: inspectionsData, isLoading: inspectionsLoading } = useQuery({
    queryKey: ['compliance-inspections-analytics-new', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch compliance reports
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['compliance-reports-data-new', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_reports')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch compliance tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['compliance-tasks-analytics', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_tasks')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
      if (error) throw error;
      return data || [];
    }
  });

  // Process assessment statistics
  const assessmentStats = useMemo(() => {
    if (!assessmentsData) return { total: 0, pending: 0, completed: 0, inProgress: 0, avgScore: 0 };
    
    const completed = assessmentsData.filter(a => a.assessment_status === 'completed');
    const avgScore = completed.length > 0 
      ? completed.reduce((sum, a) => sum + (a.compliance_score || 0), 0) / completed.length 
      : 0;

    return {
      total: assessmentsData.length,
      pending: assessmentsData.filter(a => a.assessment_status === 'pending').length,
      completed: completed.length,
      inProgress: assessmentsData.filter(a => a.assessment_status === 'in_progress').length,
      avgScore
    };
  }, [assessmentsData]);

  // Process inspection statistics
  const inspectionStats = useMemo(() => {
    if (!inspectionsData) return { total: 0, scheduled: 0, completed: 0, inProgress: 0, cancelled: 0 };
    return {
      total: inspectionsData.length,
      scheduled: inspectionsData.filter(i => i.status === 'scheduled').length,
      completed: inspectionsData.filter(i => i.status === 'completed').length,
      inProgress: inspectionsData.filter(i => i.status === 'in_progress').length,
      cancelled: inspectionsData.filter(i => i.status === 'cancelled').length
    };
  }, [inspectionsData]);

  // Process compliance report statistics
  const reportStats = useMemo(() => {
    if (!reportsData) return { total: 0, pending: 0, reviewed: 0, approved: 0 };
    return {
      total: reportsData.length,
      pending: reportsData.filter(r => r.status === 'pending').length,
      reviewed: reportsData.filter(r => r.status === 'reviewed').length,
      approved: reportsData.filter(r => r.status === 'approved').length
    };
  }, [reportsData]);

  // Process task statistics
  const taskStats = useMemo(() => {
    if (!tasksData) return { total: 0, pending: 0, completed: 0, overdue: 0 };
    const now = new Date();
    return {
      total: tasksData.length,
      pending: tasksData.filter(t => t.status === 'pending').length,
      completed: tasksData.filter(t => t.status === 'completed').length,
      overdue: tasksData.filter(t => t.status !== 'completed' && t.due_date && new Date(t.due_date) < now).length
    };
  }, [tasksData]);

  // Monthly trends
  const monthlyTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push(months[monthIndex]);
    }

    return last6Months.map((month, idx) => {
      const targetMonth = (currentMonth - 5 + idx + 12) % 12;
      
      const assessments = assessmentsData?.filter(a => {
        const date = new Date(a.created_at);
        return date.getMonth() === targetMonth;
      }).length || 0;
      
      const inspections = inspectionsData?.filter(i => {
        const date = new Date(i.scheduled_date);
        return date.getMonth() === targetMonth;
      }).length || 0;

      const reports = reportsData?.filter(r => {
        const date = new Date(r.created_at);
        return date.getMonth() === targetMonth;
      }).length || 0;

      return { month, assessments, inspections, reports };
    });
  }, [assessmentsData, inspectionsData, reportsData]);

  // Assessment status distribution
  const assessmentStatusData = useMemo(() => {
    return [
      { name: "Completed", value: assessmentStats.completed, color: "#10b981" },
      { name: "In Progress", value: assessmentStats.inProgress, color: "#3b82f6" },
      { name: "Pending", value: assessmentStats.pending, color: "#f59e0b" },
    ].filter(d => d.value > 0);
  }, [assessmentStats]);

  // Inspection status distribution
  const inspectionStatusData = useMemo(() => {
    return [
      { name: "Completed", value: inspectionStats.completed, color: "#10b981" },
      { name: "Scheduled", value: inspectionStats.scheduled, color: "#3b82f6" },
      { name: "In Progress", value: inspectionStats.inProgress, color: "#f59e0b" },
      { name: "Cancelled", value: inspectionStats.cancelled, color: "#6b7280" },
    ].filter(d => d.value > 0);
  }, [inspectionStats]);

  // Inspection by type
  const inspectionTypeData = useMemo(() => {
    if (!inspectionsData) return [];
    const typeCount: Record<string, number> = {};
    
    inspectionsData.forEach(i => {
      const type = i.inspection_type || 'General';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    return Object.entries(typeCount)
      .map(([name, value], index) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [inspectionsData]);

  // Province distribution
  const provinceData = useMemo(() => {
    if (!inspectionsData) return [];
    const provinceCount: Record<string, number> = {};
    
    inspectionsData.forEach(i => {
      const province = i.province || 'Unknown';
      provinceCount[province] = (provinceCount[province] || 0) + 1;
    });

    return Object.entries(provinceCount)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [inspectionsData]);

  // Compliance score distribution
  const scoreDistribution = useMemo(() => {
    if (!assessmentsData) return [];
    const scores = { excellent: 0, good: 0, fair: 0, poor: 0 };
    
    assessmentsData.filter(a => a.compliance_score != null).forEach(a => {
      const score = a.compliance_score || 0;
      if (score >= 90) scores.excellent++;
      else if (score >= 70) scores.good++;
      else if (score >= 50) scores.fair++;
      else scores.poor++;
    });

    return [
      { name: 'Excellent (90+)', value: scores.excellent, color: '#10b981' },
      { name: 'Good (70-89)', value: scores.good, color: '#3b82f6' },
      { name: 'Fair (50-69)', value: scores.fair, color: '#f59e0b' },
      { name: 'Poor (<50)', value: scores.poor, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [assessmentsData]);

  const handleExportPDF = (reportName: string) => {
    toast({
      title: "Export Started",
      description: `Generating ${reportName} PDF report...`,
    });
  };

  const handleExportExcel = (reportName: string) => {
    toast({
      title: "Export Started",
      description: `Generating ${reportName} Excel report...`,
    });
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print Dialog",
      description: "Opening print preview...",
    });
  };

  const handleEmailReport = (reportName: string) => {
    toast({
      title: "Email Report",
      description: `Preparing to send ${reportName} report via email...`,
    });
  };

  const ReportActions = ({ reportName }: { reportName: string }) => (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => handleExportPDF(reportName)} className="text-xs">
        <Download className="w-3 h-3 mr-1" />
        PDF
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExportExcel(reportName)} className="text-xs">
        <Download className="w-3 h-3 mr-1" />
        Excel
      </Button>
      <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs">
        <Printer className="w-3 h-3 mr-1" />
        Print
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleEmailReport(reportName)} className="text-xs">
        <Mail className="w-3 h-3 mr-1" />
        Email
      </Button>
    </div>
  );

  const isLoading = assessmentsLoading || inspectionsLoading || reportsLoading || tasksLoading;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl">Compliance Analytics & Reporting</CardTitle>
              <CardDescription className="text-sm">Environmental compliance monitoring and performance analytics</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as DateFilterPeriod)}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Last 7 Days</SelectItem>
                  <SelectItem value="monthly">Last 30 Days</SelectItem>
                  <SelectItem value="quarterly">Last Quarter</SelectItem>
                  <SelectItem value="yearly">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted p-1">
          <TabsTrigger value="overview" className="flex-1 min-w-[100px] text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="assessments" className="flex-1 min-w-[100px] text-xs sm:text-sm">Assessments</TabsTrigger>
          <TabsTrigger value="inspections" className="flex-1 min-w-[100px] text-xs sm:text-sm">Inspections</TabsTrigger>
          <TabsTrigger value="enforcement" className="flex-1 min-w-[100px] text-xs sm:text-sm">Enforcement</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <ClipboardCheck className="w-4 h-4 mr-2 text-blue-500" />
                  Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold">{assessmentStats.total}</div>
                )}
                <p className="text-xs text-muted-foreground">{assessmentStats.completed} completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Eye className="w-4 h-4 mr-2 text-green-500" />
                  Inspections
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold">{inspectionStats.total}</div>
                )}
                <p className="text-xs text-muted-foreground">{inspectionStats.completed} completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-purple-500" />
                  Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold">{reportStats.total}</div>
                )}
                <p className="text-xs text-muted-foreground">{reportStats.pending} pending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Target className="w-4 h-4 mr-2 text-emerald-500" />
                  Avg Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <>
                    <div className="text-2xl md:text-3xl font-bold">{assessmentStats.avgScore.toFixed(1)}%</div>
                    <Progress value={assessmentStats.avgScore} className="mt-2 h-2" />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Activity Trends */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <CardTitle className="text-base">Activity Trends</CardTitle>
                    <CardDescription className="text-xs">Monthly compliance activities</CardDescription>
                  </div>
                  <ReportActions reportName="Activity Trends" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="assessments" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Assessments" />
                    <Area type="monotone" dataKey="inspections" stackId="1" stroke="#10b981" fill="#10b981" name="Inspections" />
                    <Area type="monotone" dataKey="reports" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Reports" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Compliance Score Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <CardTitle className="text-base">Compliance Score Distribution</CardTitle>
                    <CardDescription className="text-xs">Assessment outcomes</CardDescription>
                  </div>
                  <ReportActions reportName="Score Distribution" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={scoreDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Task Summary */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base">Compliance Tasks Overview</CardTitle>
                  <CardDescription className="text-xs">Current task status</CardDescription>
                </div>
                <ReportActions reportName="Tasks Overview" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{taskStats.total}</div>
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
                </div>
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">{taskStats.pending}</div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <ClipboardCheck className="w-4 h-4 mr-2 text-blue-500" />
                  Total Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold">{assessmentStats.total}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold text-green-600">{assessmentStats.completed}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-amber-500" />
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold text-amber-600">{assessmentStats.inProgress}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-purple-500" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold text-purple-600">{assessmentStats.pending}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Assessment Status Chart */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base">Assessment Status Distribution</CardTitle>
                  <CardDescription className="text-xs">Current assessment breakdown</CardDescription>
                </div>
                <ReportActions reportName="Assessment Status" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={assessmentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {assessmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {assessmentStatusData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <Badge variant="secondary">{item.value}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inspections Tab */}
        <TabsContent value="inspections" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Eye className="w-4 h-4 mr-2 text-blue-500" />
                  Total Inspections
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold">{inspectionStats.total}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold text-green-600">{inspectionStats.completed}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  Scheduled
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold text-blue-600">{inspectionStats.scheduled}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-emerald-500" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold">
                    {inspectionStats.total > 0 
                      ? ((inspectionStats.completed / inspectionStats.total) * 100).toFixed(1)
                      : 0}%
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Inspection Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Inspection by Type */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <CardTitle className="text-base">Inspections by Type</CardTitle>
                    <CardDescription className="text-xs">Distribution by category</CardDescription>
                  </div>
                  <ReportActions reportName="Inspection Types" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={inspectionTypeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis type="category" dataKey="name" fontSize={10} width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Inspection by Province */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <CardTitle className="text-base">Inspections by Province</CardTitle>
                    <CardDescription className="text-xs">Geographic distribution</CardDescription>
                  </div>
                  <ReportActions reportName="Province Distribution" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={provinceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={10} angle={-45} textAnchor="end" height={80} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enforcement Tab */}
        <TabsContent value="enforcement" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  Compliance Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold">{reportStats.total}</div>
                )}
                <p className="text-xs text-muted-foreground">{reportStats.approved} approved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                  Pending Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold text-amber-600">{reportStats.pending}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Gavel className="w-4 h-4 mr-2 text-red-500" />
                  Overdue Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold text-red-600">{taskStats.overdue}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Report Status Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base">Compliance Report Summary</CardTitle>
                  <CardDescription className="text-xs">Report status breakdown</CardDescription>
                </div>
                <ReportActions reportName="Compliance Reports Summary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          Pending
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{reportStats.pending}</TableCell>
                      <TableCell className="text-right">
                        {reportStats.total > 0 ? ((reportStats.pending / reportStats.total) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          Reviewed
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{reportStats.reviewed}</TableCell>
                      <TableCell className="text-right">
                        {reportStats.total > 0 ? ((reportStats.reviewed / reportStats.total) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Approved
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{reportStats.approved}</TableCell>
                      <TableCell className="text-right">
                        {reportStats.total > 0 ? ((reportStats.approved / reportStats.total) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceAnalyticsReportsNew;
