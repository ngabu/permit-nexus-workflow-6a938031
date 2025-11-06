import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Users
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

const RegistryReports = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedReport, setSelectedReport] = useState("overview");

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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="permits">Permits</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
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
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Detailed Assessment Report</CardTitle>
                  <CardDescription>Comprehensive assessment breakdown by status and type</CardDescription>
                </div>
                <ReportActions reportName="Detailed Assessments" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Completed This Month</span>
                      <Badge variant="secondary">456</Badge>
                    </div>
                    <div className="text-2xl font-bold">92%</div>
                    <p className="text-xs text-muted-foreground">Completion rate</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Avg Review Time</span>
                      <Badge variant="secondary">18.5d</Badge>
                    </div>
                    <div className="text-2xl font-bold">-8%</div>
                    <p className="text-xs text-muted-foreground">Improvement</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Quality Score</span>
                      <Badge variant="secondary">4.7/5</Badge>
                    </div>
                    <div className="text-2xl font-bold">94%</div>
                    <p className="text-xs text-muted-foreground">Satisfaction</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Officer Performance Report</CardTitle>
                  <CardDescription>Individual performance metrics and workload</CardDescription>
                </div>
                <ReportActions reportName="Officer Performance" />
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

        {/* Permits Tab */}
        <TabsContent value="permits" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Permit Analytics Report</CardTitle>
                  <CardDescription>Permit types, volumes, and approval rates</CardDescription>
                </div>
                <ReportActions reportName="Permit Analytics" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={assessmentTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="passed" stroke="#10b981" strokeWidth={2} name="Approved" />
                  <Line type="monotone" dataKey="pending" stroke="#3b82f6" strokeWidth={2} name="In Progress" />
                  <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Rejected" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Compliance & Statutory Report</CardTitle>
                  <CardDescription>Regulatory compliance and deadline tracking</CardDescription>
                </div>
                <ReportActions reportName="Compliance Report" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-lg">Statutory Compliance</h3>
                      <p className="text-sm text-muted-foreground">Meeting regulatory requirements</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">On-time Processing</span>
                      <Badge variant="secondary">96.8%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Documentation Complete</span>
                      <Badge variant="secondary">98.2%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Regulatory Audits Passed</span>
                      <Badge variant="secondary">100%</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-8 h-8 text-amber-600" />
                    <div>
                      <h3 className="font-semibold text-lg">Deadline Tracking</h3>
                      <p className="text-sm text-muted-foreground">Upcoming critical deadlines</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Due This Week</span>
                      <Badge variant="destructive">23</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Due This Month</span>
                      <Badge variant="secondary">67</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Overdue</span>
                      <Badge variant="destructive">5</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegistryReports;
