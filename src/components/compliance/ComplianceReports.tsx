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
  Calendar,
  Filter,
  ClipboardList,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  FileWarning
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

const ComplianceReports = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  // Mock data for technical assessment trends
  const assessmentTrendsData = [
    { month: "Jan", passed: 85, failed: 12, inProgress: 45, clarification: 18 },
    { month: "Feb", passed: 92, failed: 8, inProgress: 52, clarification: 22 },
    { month: "Mar", passed: 105, failed: 10, inProgress: 48, clarification: 25 },
    { month: "Apr", passed: 118, failed: 6, inProgress: 60, clarification: 20 },
    { month: "May", passed: 128, failed: 9, inProgress: 55, clarification: 28 },
    { month: "Jun", passed: 135, failed: 7, inProgress: 50, clarification: 24 },
  ];

  const assessmentTypeDistribution = [
    { name: "Environmental Impact", value: 245, color: "#10b981" },
    { name: "Technical Review", value: 198, color: "#3b82f6" },
    { name: "Compliance Check", value: 167, color: "#f59e0b" },
    { name: "Site Inspection", value: 123, color: "#8b5cf6" },
    { name: "Risk Assessment", value: 89, color: "#ef4444" },
  ];

  const complianceScoreData = [
    { category: "Level 1", avgScore: 92, target: 90 },
    { category: "Level 2", avgScore: 86, target: 85 },
    { category: "Level 3", avgScore: 78, target: 80 },
  ];

  const officerPerformance = [
    { name: "Alice Chen", completed: 123, pending: 8, avgScore: 88, violations: 5 },
    { name: "Robert Kila", completed: 118, pending: 12, avgScore: 92, violations: 3 },
    { name: "Sarah Narokobi", completed: 115, pending: 9, avgScore: 85, violations: 7 },
    { name: "David Abal", completed: 110, pending: 15, avgScore: 90, violations: 4 },
  ];

  const violationsData = [
    { month: "Jan", critical: 8, high: 15, medium: 32, low: 45 },
    { month: "Feb", critical: 6, high: 12, medium: 28, low: 38 },
    { month: "Mar", critical: 5, high: 18, medium: 35, low: 42 },
    { month: "Apr", critical: 4, high: 10, medium: 25, low: 35 },
    { month: "May", critical: 7, high: 14, medium: 30, low: 40 },
    { month: "Jun", critical: 3, high: 9, medium: 22, low: 33 },
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
              <CardTitle className="text-2xl">Compliance Reports & Analytics</CardTitle>
              <CardDescription>Technical assessment reports and compliance monitoring</CardDescription>
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
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ClipboardList className="w-4 h-4 mr-2 text-primary" />
                  Total Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1,089</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success">+15.3%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  Pass Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">89.2%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success">+3.1%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-warning" />
                  Avg Review Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">18.3d</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success">-2.1d</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-destructive" />
                  Active Violations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success">-12.3%</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Assessment Trends Chart */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Technical Assessment Trends</CardTitle>
                  <CardDescription>Monthly assessment outcomes</CardDescription>
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
                  <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" />
                  <Bar dataKey="clarification" fill="#f59e0b" name="Clarification" />
                  <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assessment Type Distribution */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Assessment Type Distribution</CardTitle>
                    <CardDescription>By category</CardDescription>
                  </div>
                  <ReportActions reportName="Assessment Distribution" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={assessmentTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assessmentTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Compliance Score Analysis */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Compliance Score Analysis</CardTitle>
                    <CardDescription>Average vs target scores</CardDescription>
                  </div>
                  <ReportActions reportName="Compliance Scores" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={complianceScoreData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgScore" fill="#3b82f6" name="Avg Score" />
                    <Bar dataKey="target" fill="#10b981" name="Target Score" />
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
                  <CardTitle>Detailed Technical Assessment Report</CardTitle>
                  <CardDescription>Comprehensive breakdown of technical reviews</CardDescription>
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
                      <Badge variant="secondary">389</Badge>
                    </div>
                    <div className="text-2xl font-bold">95%</div>
                    <p className="text-xs text-muted-foreground">Completion rate</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Environmental Assessments</span>
                      <Badge variant="secondary">156</Badge>
                    </div>
                    <div className="text-2xl font-bold">40%</div>
                    <p className="text-xs text-muted-foreground">Of total</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Quality Score</span>
                      <Badge variant="secondary">4.6/5</Badge>
                    </div>
                    <div className="text-2xl font-bold">92%</div>
                    <p className="text-xs text-muted-foreground">Satisfaction</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Compliance Monitoring Report</CardTitle>
                  <CardDescription>Environmental compliance status and trends</CardDescription>
                </div>
                <ReportActions reportName="Compliance Monitoring" />
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
                  <Line type="monotone" dataKey="passed" stroke="#10b981" strokeWidth={2} name="Compliant" />
                  <Line type="monotone" dataKey="clarification" stroke="#f59e0b" strokeWidth={2} name="Minor Issues" />
                  <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Non-Compliant" />
                </LineChart>
              </ResponsiveContainer>
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
                  <CardDescription>Individual performance metrics and compliance scores</CardDescription>
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
                        <Shield className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{officer.name}</p>
                          <p className="text-xs text-muted-foreground">Compliance Officer</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-8">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-success">{officer.completed}</div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-warning">{officer.pending}</div>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{officer.avgScore}%</div>
                        <p className="text-xs text-muted-foreground">Avg Score</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-destructive">{officer.violations}</div>
                        <p className="text-xs text-muted-foreground">Violations</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Violations & Non-Compliance Report</CardTitle>
                  <CardDescription>Monthly violations by severity level</CardDescription>
                </div>
                <ReportActions reportName="Violations Report" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={violationsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="critical" fill="#ef4444" name="Critical" />
                  <Bar dataKey="high" fill="#f97316" name="High" />
                  <Bar dataKey="medium" fill="#f59e0b" name="Medium" />
                  <Bar dataKey="low" fill="#84cc16" name="Low" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-3 border rounded-lg bg-red-50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium">Critical</span>
                  </div>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
                
                <div className="p-3 border rounded-lg bg-orange-50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm font-medium">High</span>
                  </div>
                  <div className="text-2xl font-bold">9</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
                
                <div className="p-3 border rounded-lg bg-amber-50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm font-medium">Medium</span>
                  </div>
                  <div className="text-2xl font-bold">22</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
                
                <div className="p-3 border rounded-lg bg-lime-50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-lime-500"></div>
                    <span className="text-sm font-medium">Low</span>
                  </div>
                  <div className="text-2xl font-bold">33</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceReports;