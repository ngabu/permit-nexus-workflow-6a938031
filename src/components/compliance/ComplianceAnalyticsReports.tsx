import { useState } from "react";
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
  BarChart3, 
  TrendingUp, 
  Calendar,
  Filter,
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Eye,
  FileText,
  Shield
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ComplianceAnalyticsReports = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  // Fetch compliance assessments data
  const { data: assessmentsData, isLoading: assessmentsLoading } = useQuery({
    queryKey: ['compliance-assessments-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_assessments')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch inspections data
  const { data: inspectionsData, isLoading: inspectionsLoading } = useQuery({
    queryKey: ['inspections-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inspections')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch compliance reports data
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['compliance-reports-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_reports')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Process assessment data
  const assessmentStats = {
    total: assessmentsData?.length || 0,
    pending: assessmentsData?.filter(a => a.assessment_status === 'pending').length || 0,
    completed: assessmentsData?.filter(a => a.assessment_status === 'completed').length || 0,
    inProgress: assessmentsData?.filter(a => a.assessment_status === 'in_progress').length || 0,
  };

  // Process inspections data
  const inspectionStats = {
    total: inspectionsData?.length || 0,
    scheduled: inspectionsData?.filter(i => i.status === 'scheduled').length || 0,
    completed: inspectionsData?.filter(i => i.status === 'completed').length || 0,
    inProgress: inspectionsData?.filter(i => i.status === 'in_progress').length || 0,
  };

  // Chart data
  const assessmentStatusData = [
    { name: "Completed", value: assessmentStats.completed, color: "#10b981" },
    { name: "In Progress", value: assessmentStats.inProgress, color: "#3b82f6" },
    { name: "Pending", value: assessmentStats.pending, color: "#f59e0b" },
  ];

  const inspectionStatusData = [
    { name: "Completed", value: inspectionStats.completed, color: "#10b981" },
    { name: "Scheduled", value: inspectionStats.scheduled, color: "#3b82f6" },
    { name: "In Progress", value: inspectionStats.inProgress, color: "#f59e0b" },
  ];

  const monthlyTrendsData = [
    { month: "Jan", assessments: 45, inspections: 12 },
    { month: "Feb", assessments: 52, inspections: 15 },
    { month: "Mar", assessments: 48, inspections: 18 },
    { month: "Apr", assessments: 60, inspections: 14 },
    { month: "May", assessments: 55, inspections: 20 },
    { month: "Jun", assessments: 50, inspections: 16 },
  ];

  const officerPerformance = [
    { name: "John Doe", completed: 145, pending: 12, avgTime: 18 },
    { name: "Jane Smith", completed: 138, pending: 15, avgTime: 20 },
    { name: "Mike Johnson", completed: 125, pending: 8, avgTime: 16 },
    { name: "Sarah Williams", completed: 132, pending: 10, avgTime: 19 },
  ];

  const handleDownload = (reportType: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${reportType} report as PDF...`,
    });
  };

  const handlePrint = (reportType: string) => {
    toast({
      title: "Print Preview",
      description: `Opening print preview for ${reportType} report...`,
    });
    window.print();
  };

  const handleEmail = (reportType: string) => {
    toast({
      title: "Email Report",
      description: `Sending ${reportType} report to your email...`,
    });
  };

  const ReportActions = ({ reportName }: { reportName: string }) => (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => handleDownload(reportName)}>
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>
      <Button variant="outline" size="sm" onClick={() => handlePrint(reportName)}>
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleEmail(reportName)}>
        <Mail className="w-4 h-4 mr-2" />
        Email
      </Button>
    </div>
  );

  const isLoading = assessmentsLoading || inspectionsLoading || reportsLoading;

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Analytics & Reporting</CardTitle>
              <CardDescription>Comprehensive compliance analytics and performance reports</CardDescription>
            </div>
            <div className="flex gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Last 7 Days</SelectItem>
                  <SelectItem value="monthly">Last 30 Days</SelectItem>
                  <SelectItem value="quarterly">Last Quarter</SelectItem>
                  <SelectItem value="yearly">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Report Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="staff-performance">Staff Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ClipboardList className="w-4 h-4 mr-2 text-blue-500" />
                  Total Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <>
                    <div className="text-3xl font-bold">{assessmentStats.total}</div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Eye className="w-4 h-4 mr-2 text-green-500" />
                  Total Inspections
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <>
                    <div className="text-3xl font-bold">{inspectionStats.total}</div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <>
                    <div className="text-3xl font-bold">
                      {assessmentStats.total > 0 
                        ? ((assessmentStats.completed / assessmentStats.total) * 100).toFixed(1)
                        : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">Assessments completed</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-amber-500" />
                  Pending Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <>
                    <div className="text-3xl font-bold">{assessmentStats.pending}</div>
                    <p className="text-xs text-muted-foreground">Awaiting review</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Trends Chart */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Assessment and inspection activity over time</CardDescription>
                </div>
                <ReportActions reportName="Monthly Trends" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="assessments" stroke="#3b82f6" name="Assessments" />
                  <Line type="monotone" dataKey="inspections" stroke="#10b981" name="Inspections" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assessment Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Status Distribution</CardTitle>
                <CardDescription>By status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={assessmentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assessmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Inspection Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Inspection Status Distribution</CardTitle>
                <CardDescription>By status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={inspectionStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {inspectionStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ClipboardList className="w-4 h-4 mr-2 text-blue-500" />
                  Total Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{assessmentStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{assessmentStats.completed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-blue-500" />
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{assessmentStats.inProgress}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">{assessmentStats.pending}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Assessment Details</CardTitle>
                  <CardDescription>Detailed breakdown of all assessments</CardDescription>
                </div>
                <ReportActions reportName="Assessments Report" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assessmentStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inspections Tab */}
        <TabsContent value="inspections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Eye className="w-4 h-4 mr-2 text-blue-500" />
                  Total Inspections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{inspectionStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{inspectionStats.completed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  Scheduled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{inspectionStats.scheduled}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-amber-500" />
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">{inspectionStats.inProgress}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Inspection Details</CardTitle>
                  <CardDescription>Detailed breakdown of all inspections</CardDescription>
                </div>
                <ReportActions reportName="Inspections Report" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inspectionStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Performance Tab */}
        <TabsContent value="staff-performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Staff Performance Report</CardTitle>
                  <CardDescription>Individual performance metrics and workload</CardDescription>
                </div>
                <ReportActions reportName="Staff Performance" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {officerPerformance.map((officer, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{officer.name}</p>
                          <p className="text-xs text-muted-foreground">Compliance Officer</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-8">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{officer.completed}</div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">{officer.pending}</div>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{officer.avgTime}d</div>
                        <p className="text-xs text-muted-foreground">Avg Time</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceAnalyticsReports;