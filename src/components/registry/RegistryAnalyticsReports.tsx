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
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  Building,
  Target,
  Timer,
  FileCheck,
  RotateCw,
  ArrowRightLeft,
  FileX,
  GitMerge
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfMonth, endOfMonth, parseISO, differenceInDays } from "date-fns";
import { useDateFilter, type DateFilterPeriod } from "@/hooks/useDateFilter";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

const RegistryAnalyticsReports = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<DateFilterPeriod>("monthly");
  const dateRange = useDateFilter(selectedPeriod);

  // Fetch entities data
  const { data: entitiesData, isLoading: entitiesLoading } = useQuery({
    queryKey: ['registry-entities-analytics', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch permit applications data
  const { data: permitsData, isLoading: permitsLoading } = useQuery({
    queryKey: ['registry-permits-analytics', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permit_applications')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch intent registrations data
  const { data: intentsData, isLoading: intentsLoading } = useQuery({
    queryKey: ['registry-intents-analytics', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('intent_registrations')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch workflow state for processing times
  const { data: workflowData, isLoading: workflowLoading } = useQuery({
    queryKey: ['registry-workflow-analytics', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('application_workflow_state')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
      if (error) throw error;
      return data || [];
    }
  });

  // Process permit statistics
  const permitStats = useMemo(() => {
    if (!permitsData) return { total: 0, approved: 0, pending: 0, rejected: 0, draft: 0 };
    return {
      total: permitsData.length,
      approved: permitsData.filter(p => p.status === 'approved').length,
      pending: permitsData.filter(p => p.status === 'pending' || p.status === 'submitted').length,
      rejected: permitsData.filter(p => p.status === 'rejected').length,
      draft: permitsData.filter(p => p.is_draft).length,
    };
  }, [permitsData]);

  // Process intent statistics
  const intentStats = useMemo(() => {
    if (!intentsData) return { total: 0, approved: 0, pending: 0, rejected: 0 };
    return {
      total: intentsData.length,
      approved: intentsData.filter(i => i.status === 'approved').length,
      pending: intentsData.filter(i => i.status === 'pending' || i.status === 'submitted').length,
      rejected: intentsData.filter(i => i.status === 'rejected').length,
    };
  }, [intentsData]);

  // Process entity statistics
  const entityStats = useMemo(() => {
    if (!entitiesData) return { total: 0, byType: [] };
    const typeCount: Record<string, number> = {};
    entitiesData.forEach(e => {
      typeCount[e.entity_type] = (typeCount[e.entity_type] || 0) + 1;
    });
    return {
      total: entitiesData.length,
      byType: Object.entries(typeCount).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }))
    };
  }, [entitiesData]);

  // Calculate SLA compliance
  const slaCompliance = useMemo(() => {
    if (!workflowData || workflowData.length === 0) return { onTime: 0, delayed: 0, rate: 0 };
    const now = new Date();
    let onTime = 0;
    let delayed = 0;
    workflowData.forEach(w => {
      if (w.sla_deadline) {
        if (new Date(w.sla_deadline) >= now || w.final_decision_at) {
          onTime++;
        } else {
          delayed++;
        }
      }
    });
    const total = onTime + delayed;
    return {
      onTime,
      delayed,
      rate: total > 0 ? (onTime / total * 100) : 100
    };
  }, [workflowData]);

  // Monthly trends data
  const monthlyTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push(months[monthIndex]);
    }

    return last6Months.map((month, idx) => {
      const intentCount = intentsData?.filter(i => {
        const date = new Date(i.created_at);
        return date.getMonth() === (currentMonth - 5 + idx + 12) % 12;
      }).length || 0;
      
      const permitCount = permitsData?.filter(p => {
        const date = new Date(p.created_at);
        return date.getMonth() === (currentMonth - 5 + idx + 12) % 12;
      }).length || 0;

      return {
        month,
        intents: intentCount,
        permits: permitCount,
        total: intentCount + permitCount
      };
    });
  }, [intentsData, permitsData]);

  // Application status distribution
  const applicationStatusData = useMemo(() => {
    return [
      { name: "Approved", value: permitStats.approved + intentStats.approved, color: "#10b981" },
      { name: "Pending", value: permitStats.pending + intentStats.pending, color: "#f59e0b" },
      { name: "Rejected", value: permitStats.rejected + intentStats.rejected, color: "#ef4444" },
      { name: "Draft", value: permitStats.draft, color: "#6b7280" },
    ].filter(d => d.value > 0);
  }, [permitStats, intentStats]);

  // Permit type distribution
  const permitTypeData = useMemo(() => {
    if (!permitsData) return [];
    const typeCount: Record<string, number> = {};
    permitsData.forEach(p => {
      const type = p.permit_type || 'Unspecified';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    return Object.entries(typeCount)
      .map(([name, value], index) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [permitsData]);

  // Processing time analysis
  const processingTimeData = useMemo(() => {
    if (!workflowData) return [];
    const stageData: Record<string, { total: number; count: number }> = {};
    
    workflowData.forEach(w => {
      if (w.registry_completed_at && w.submitted_at) {
        const days = differenceInDays(new Date(w.registry_completed_at), new Date(w.submitted_at));
        const stage = w.current_stage || 'unknown';
        if (!stageData[stage]) stageData[stage] = { total: 0, count: 0 };
        stageData[stage].total += days;
        stageData[stage].count++;
      }
    });

    return Object.entries(stageData).map(([stage, data]) => ({
      stage: stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      avgDays: Math.round(data.total / data.count),
      count: data.count
    }));
  }, [workflowData]);

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

  const isLoading = entitiesLoading || permitsLoading || intentsLoading || workflowLoading;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl">Registry Analytics & Reporting</CardTitle>
              <CardDescription className="text-sm">Comprehensive analytics for permit processing and registry operations</CardDescription>
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
          <TabsTrigger value="applications" className="flex-1 min-w-[100px] text-xs sm:text-sm">Applications</TabsTrigger>
          <TabsTrigger value="sla" className="flex-1 min-w-[100px] text-xs sm:text-sm">SLA & Performance</TabsTrigger>
          <TabsTrigger value="entities" className="flex-1 min-w-[100px] text-xs sm:text-sm">Entities</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Building className="w-4 h-4 mr-2 text-blue-500" />
                  Total Entities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold">{entityStats.total}</div>
                )}
                <p className="text-xs text-muted-foreground">Registered entities</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <ClipboardList className="w-4 h-4 mr-2 text-purple-500" />
                  Intent Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold">{intentStats.total}</div>
                )}
                <p className="text-xs text-muted-foreground">{intentStats.approved} approved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-green-500" />
                  Permit Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold">{permitStats.total}</div>
                )}
                <p className="text-xs text-muted-foreground">{permitStats.approved} approved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Target className="w-4 h-4 mr-2 text-emerald-500" />
                  SLA Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold">{slaCompliance.rate.toFixed(1)}%</div>
                )}
                <p className="text-xs text-muted-foreground">{slaCompliance.delayed} delayed</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Application Trends */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <CardTitle className="text-base">Application Trends</CardTitle>
                    <CardDescription className="text-xs">Monthly submissions</CardDescription>
                  </div>
                  <ReportActions reportName="Application Trends" />
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
                    <Area type="monotone" dataKey="intents" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Intents" />
                    <Area type="monotone" dataKey="permits" stackId="1" stroke="#10b981" fill="#10b981" name="Permits" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Application Status */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <CardTitle className="text-base">Application Status Distribution</CardTitle>
                    <CardDescription className="text-xs">Current status breakdown</CardDescription>
                  </div>
                  <ReportActions reportName="Status Distribution" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={applicationStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {applicationStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Permit Types */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base">Permit Type Distribution</CardTitle>
                  <CardDescription className="text-xs">Applications by permit category</CardDescription>
                </div>
                <ReportActions reportName="Permit Types" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={permitTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="name" fontSize={10} width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-amber-500" />
                  Pending Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold text-amber-600">
                    {permitStats.pending + intentStats.pending}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold text-green-600">
                    {permitStats.approved + intentStats.approved}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold text-red-600">
                    {permitStats.rejected + intentStats.rejected}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                  Approval Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold">
                    {((permitStats.approved + intentStats.approved) / 
                      Math.max(1, permitStats.total + intentStats.total - permitStats.draft) * 100).toFixed(1)}%
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Application Types Breakdown */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base">Application Types Summary</CardTitle>
                  <CardDescription className="text-xs">Breakdown by application category</CardDescription>
                </div>
                <ReportActions reportName="Application Summary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application Type</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Approved</TableHead>
                      <TableHead className="text-right">Pending</TableHead>
                      <TableHead className="text-right">Rejected</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Intent Registrations</TableCell>
                      <TableCell className="text-right">{intentStats.total}</TableCell>
                      <TableCell className="text-right text-green-600">{intentStats.approved}</TableCell>
                      <TableCell className="text-right text-amber-600">{intentStats.pending}</TableCell>
                      <TableCell className="text-right text-red-600">{intentStats.rejected}</TableCell>
                      <TableCell className="text-right">
                        {intentStats.total > 0 ? ((intentStats.approved / intentStats.total) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Permit Applications</TableCell>
                      <TableCell className="text-right">{permitStats.total}</TableCell>
                      <TableCell className="text-right text-green-600">{permitStats.approved}</TableCell>
                      <TableCell className="text-right text-amber-600">{permitStats.pending}</TableCell>
                      <TableCell className="text-right text-red-600">{permitStats.rejected}</TableCell>
                      <TableCell className="text-right">
                        {permitStats.total > 0 ? ((permitStats.approved / (permitStats.total - permitStats.draft)) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SLA & Performance Tab */}
        <TabsContent value="sla" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Timer className="w-4 h-4 mr-2 text-green-500" />
                  On-Time Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold text-green-600">{slaCompliance.onTime}</div>
                )}
                <p className="text-xs text-muted-foreground">Within SLA</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                  Delayed
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold text-red-600">{slaCompliance.delayed}</div>
                )}
                <p className="text-xs text-muted-foreground">Past SLA deadline</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Target className="w-4 h-4 mr-2 text-blue-500" />
                  SLA Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <>
                    <div className="text-2xl md:text-3xl font-bold">{slaCompliance.rate.toFixed(1)}%</div>
                    <Progress value={slaCompliance.rate} className="mt-2 h-2" />
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Users className="w-4 h-4 mr-2 text-purple-500" />
                  Active Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold">{workflowData?.length || 0}</div>
                )}
                <p className="text-xs text-muted-foreground">In processing</p>
              </CardContent>
            </Card>
          </div>

          {/* Processing Time Chart */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base">Processing Time by Stage</CardTitle>
                  <CardDescription className="text-xs">Average days per workflow stage</CardDescription>
                </div>
                <ReportActions reportName="Processing Time Analysis" />
              </div>
            </CardHeader>
            <CardContent>
              {processingTimeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processingTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" fontSize={10} angle={-45} textAnchor="end" height={80} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="avgDays" fill="#3b82f6" name="Avg Days" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No processing time data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entities Tab */}
        <TabsContent value="entities" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Building className="w-4 h-4 mr-2 text-blue-500" />
                  Total Entities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold">{entityStats.total}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold text-green-600">
                    {entitiesData?.filter(e => !e.is_suspended).length || 0}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                  Suspended
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold text-red-600">
                    {entitiesData?.filter(e => e.is_suspended).length || 0}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Entity Type Distribution */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base">Entity Type Distribution</CardTitle>
                  <CardDescription className="text-xs">Breakdown by entity classification</CardDescription>
                </div>
                <ReportActions reportName="Entity Distribution" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={entityStats.byType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {entityStats.byType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {entityStats.byType.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: type.color }} />
                        <span className="text-sm font-medium">{type.name}</span>
                      </div>
                      <Badge variant="secondary">{type.value}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegistryAnalyticsReports;
