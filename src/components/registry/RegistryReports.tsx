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
  FileText, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Filter,
  FileBarChart,
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  FileStack,
  Layers,
  Building2
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { usePermitAnalytics } from "./hooks/usePermitAnalytics";
import { useAssessmentAnalytics } from "./hooks/useAssessmentAnalytics";

const RegistryReports = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedReport, setSelectedReport] = useState("overview");
  const { analytics: permitAnalytics, loading: analyticsLoading, refetch: refetchAnalytics } = usePermitAnalytics();
  const { analytics: assessmentAnalytics, loading: assessmentLoading } = useAssessmentAnalytics();

  // Chart colors for permit types and activity levels
  const LEVEL_COLORS: Record<string, string> = {
    "Level 1": "#10b981",
    "Level 2": "#3b82f6", 
    "Level 3": "#f59e0b",
    "Unclassified": "#6b7280"
  };

  const SECTOR_COLORS = [
    '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', 
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
  ];

  // Chart colors for permit types
  const PERMIT_COLORS = [
    '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', 
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
  ];

  // Mock data for charts
  const assessmentTrendsData = [
    { month: "Jan", pending: 45, passed: 120, failed: 15, clarification: 30 },
    { month: "Feb", pending: 52, passed: 135, failed: 12, clarification: 28 },
    { month: "Mar", pending: 48, passed: 145, failed: 18, clarification: 32 },
    { month: "Apr", pending: 60, passed: 152, failed: 10, clarification: 25 },
    { month: "May", pending: 55, passed: 168, failed: 14, clarification: 35 },
    { month: "Jun", pending: 50, passed: 175, failed: 16, clarification: 29 },
  ];

  const permitTypeDistribution = [
    { name: "Environmental", value: 245, color: "#10b981" },
    { name: "Water", value: 180, color: "#3b82f6" },
    { name: "Waste", value: 156, color: "#f59e0b" },
    { name: "Air Quality", value: 98, color: "#8b5cf6" },
    { name: "Mining", value: 78, color: "#ef4444" },
  ];

  const processingTimeData = [
    { category: "Level 1", avgDays: 14, target: 15 },
    { category: "Level 2", avgDays: 28, target: 30 },
    { category: "Level 3", avgDays: 45, target: 45 },
    { category: "Level 4", avgDays: 62, target: 60 },
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

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Registry Reports & Analytics</CardTitle>
              <CardDescription>Comprehensive reporting for permit assessments and operations</CardDescription>
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
                  <SelectItem value="custom">Custom Range</SelectItem>
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
          <TabsTrigger value="permits">Permits</TabsTrigger>
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
                <div className="text-3xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12.5%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Approval Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">87.3%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2.1%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-amber-500" />
                  Avg Processing Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">23.5d</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600">+1.2d</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                  Pending Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-amber-600">-5.3%</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Assessment Trends Chart */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Assessment Trends</CardTitle>
                  <CardDescription>Monthly assessment status distribution</CardDescription>
                </div>
                <ReportActions reportName="Assessment Trends" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assessmentTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="passed" fill="#10b981" name="Passed" />
                  <Bar dataKey="pending" fill="#3b82f6" name="Pending" />
                  <Bar dataKey="clarification" fill="#f59e0b" name="Clarification" />
                  <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Permit Type Distribution */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Permit Type Distribution</CardTitle>
                    <CardDescription>By category</CardDescription>
                  </div>
                  <ReportActions reportName="Permit Distribution" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={permitTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {permitTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Processing Time by Level */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Processing Time Analysis</CardTitle>
                    <CardDescription>Average vs target days</CardDescription>
                  </div>
                  <ReportActions reportName="Processing Time" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={processingTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgDays" fill="#3b82f6" name="Actual Days" />
                    <Bar dataKey="target" fill="#10b981" name="Target Days" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-4">
          {/* Summary Cards */}
          {assessmentLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : assessmentAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <ClipboardList className="w-4 h-4 mr-2 text-blue-500" />
                    Total Assessments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{assessmentAnalytics.totals.total}</div>
                  <p className="text-xs text-muted-foreground">All applications</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Passed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{assessmentAnalytics.totals.passed}</div>
                  <p className="text-xs text-muted-foreground">Approved assessments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-amber-500" />
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600">{assessmentAnalytics.totals.pending}</div>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                    Approval Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{assessmentAnalytics.totals.overallApprovalRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Overall success rate</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Assessments by Activity Level */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Assessments by Activity Level
                  </CardTitle>
                  <CardDescription>Breakdown of assessments across different activity levels</CardDescription>
                </div>
                <ReportActions reportName="Activity Level Assessments" />
              </div>
            </CardHeader>
            <CardContent>
              {assessmentLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : assessmentAnalytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Activity Level Chart */}
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={assessmentAnalytics.byActivityLevel}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="activityLevel" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="passed" fill="#10b981" name="Passed" />
                      <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                      <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Activity Level Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Activity Level</TableHead>
                          <TableHead className="text-center">Total</TableHead>
                          <TableHead className="text-center">Passed</TableHead>
                          <TableHead className="text-center">Pending</TableHead>
                          <TableHead className="text-center">Failed</TableHead>
                          <TableHead className="text-right">Approval Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assessmentAnalytics.byActivityLevel.map((level) => (
                          <TableRow key={level.activityLevel}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: LEVEL_COLORS[level.activityLevel] || '#6b7280' }}
                                />
                                {level.activityLevel}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{level.total}</TableCell>
                            <TableCell className="text-center text-green-600">{level.passed}</TableCell>
                            <TableCell className="text-center text-amber-600">{level.pending}</TableCell>
                            <TableCell className="text-center text-red-600">{level.failed}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Progress value={level.approvalRate} className="w-16 h-2" />
                                <span className="text-sm font-medium w-12">{level.approvalRate.toFixed(0)}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assessments by Industrial Sector */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Assessments by Industrial Sector
                  </CardTitle>
                  <CardDescription>Classification of assessments by industry sector</CardDescription>
                </div>
                <ReportActions reportName="Sector Assessments" />
              </div>
            </CardHeader>
            <CardContent>
              {assessmentLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : assessmentAnalytics && assessmentAnalytics.bySector.length > 0 ? (
                <div className="space-y-6">
                  {/* Sector Bar Chart - shows all sectors */}
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart 
                      data={assessmentAnalytics.bySector} 
                      layout="vertical"
                      margin={{ left: 150, right: 20, top: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="sectorName" 
                        width={140}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="passed" fill="#10b981" name="Passed" stackId="a" />
                      <Bar dataKey="pending" fill="#f59e0b" name="Pending" stackId="a" />
                      <Bar dataKey="failed" fill="#ef4444" name="Failed" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Sector Table */}
                  <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sector</TableHead>
                          <TableHead className="text-center">Total</TableHead>
                          <TableHead className="text-center">Passed</TableHead>
                          <TableHead className="text-center">Pending</TableHead>
                          <TableHead className="text-center">Failed</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assessmentAnalytics.bySector.map((sector, idx) => (
                          <TableRow key={sector.sectorId || 'unclassified'}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full flex-shrink-0" 
                                  style={{ backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length] }}
                                />
                                <span className="truncate max-w-[200px]" title={sector.sectorName}>
                                  {sector.sectorName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium">{sector.total}</TableCell>
                            <TableCell className="text-center text-green-600">{sector.passed}</TableCell>
                            <TableCell className="text-center text-amber-600">{sector.pending}</TableCell>
                            <TableCell className="text-center text-red-600">{sector.failed}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={sector.approvalRate >= 80 ? "default" : sector.approvalRate >= 50 ? "secondary" : "destructive"}>
                                {sector.approvalRate.toFixed(0)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Building2 className="w-12 h-12 mb-4 opacity-50" />
                  <p>No sector data available yet</p>
                  <p className="text-sm">Assessments will appear here once applications have industrial sectors assigned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        {/* Permits Tab */}
        <TabsContent value="permits" className="space-y-4">
          {/* Summary Cards */}
          {analyticsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : permitAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <FileStack className="w-4 h-4 mr-2 text-blue-500" />
                    Total Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{permitAnalytics.totalApplications}</div>
                  <p className="text-xs text-muted-foreground">All permit types</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Approved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{permitAnalytics.totalApproved}</div>
                  <p className="text-xs text-muted-foreground">Successfully processed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                    Rejected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{permitAnalytics.totalRejected}</div>
                  <p className="text-xs text-muted-foreground">Did not meet criteria</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-emerald-500" />
                    Approval Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600">
                    {permitAnalytics.overallApprovalRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Of decided applications</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chart and Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Volume by Permit Type Chart */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Volume by Permit Type</CardTitle>
                    <CardDescription>Distribution of applications</CardDescription>
                  </div>
                  <ReportActions reportName="Permit Volume" />
                </div>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : permitAnalytics && permitAnalytics.byType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={permitAnalytics.byType.map((t, i) => ({
                          name: t.permit_type,
                          value: t.total,
                          color: PERMIT_COLORS[i % PERMIT_COLORS.length]
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {permitAnalytics.byType.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PERMIT_COLORS[index % PERMIT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No permit data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approval Rate by Type Chart */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Approval Rate by Type</CardTitle>
                    <CardDescription>Success rate per permit category</CardDescription>
                  </div>
                  <ReportActions reportName="Approval Rates" />
                </div>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : permitAnalytics && permitAnalytics.byType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={permitAnalytics.byType.map(t => ({
                        name: t.permit_type.length > 15 ? t.permit_type.substring(0, 15) + '...' : t.permit_type,
                        rate: t.approval_rate,
                        approved: t.approved,
                        rejected: t.rejected
                      }))}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="name" width={120} />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Approval Rate']}
                        labelFormatter={(label) => `Permit Type: ${label}`}
                      />
                      <Bar dataKey="rate" fill="#10b981" name="Approval Rate" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No permit data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Permit Analytics Detail</CardTitle>
                  <CardDescription>Comprehensive breakdown by permit type</CardDescription>
                </div>
                <ReportActions reportName="Permit Analytics Detail" />
              </div>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : permitAnalytics && permitAnalytics.byType.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permit Type</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Approved</TableHead>
                      <TableHead className="text-center">Rejected</TableHead>
                      <TableHead className="text-center">Pending</TableHead>
                      <TableHead className="text-center">In Review</TableHead>
                      <TableHead className="text-right">Approval Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permitAnalytics.byType.map((type, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{type.permit_type}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{type.total}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{type.approved}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{type.rejected}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{type.pending}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{type.in_review}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress 
                              value={type.approval_rate} 
                              className="w-16 h-2"
                            />
                            <span className="text-sm font-medium w-12 text-right">
                              {type.approval_rate.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  No permit applications found in the database
                </div>
              )}
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
                          <p className="text-xs text-muted-foreground">Registry Officer</p>
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

export default RegistryReports;
