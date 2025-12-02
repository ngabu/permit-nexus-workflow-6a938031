import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function ReportsAndAnalysis() {
  const [activeTab, setActiveTab] = useState("compliance");

  // Fetch compliance data
  const { data: complianceData } = useQuery({
    queryKey: ['compliance-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_assessments')
        .select('assessment_status, created_at, compliance_score, assessment_notes')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch inspection data
  const { data: inspectionData } = useQuery({
    queryKey: ['inspection-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inspections')
        .select('status, scheduled_date, inspection_type, province')
        .order('scheduled_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch registry data
  const { data: registryData } = useQuery({
    queryKey: ['registry-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('initial_assessments')
        .select('assessment_status, assessment_outcome, created_at, permit_activity_type')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch revenue data
  const { data: revenueData } = useQuery({
    queryKey: ['revenue-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_payments')
        .select('payment_status, total_fee, created_at, payment_method')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.getElementById(`${activeTab}-report`);
    if (!element) return;
    
    const content = element.innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Process compliance data for charts
  const complianceStatusData = complianceData?.reduce((acc: any[], item) => {
    const existing = acc.find(x => x.name === item.assessment_status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.assessment_status, value: 1 });
    }
    return acc;
  }, []) || [];

  const complianceMonthlyData = complianceData?.reduce((acc: any[], item) => {
    const month = new Date(item.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
    const existing = acc.find(x => x.month === month);
    if (existing) {
      existing.count += 1;
      if (item.compliance_score) {
        existing.avgScore = ((existing.avgScore * (existing.count - 1)) + item.compliance_score) / existing.count;
      }
    } else {
      acc.push({ month, count: 1, avgScore: item.compliance_score || 0 });
    }
    return acc;
  }, []) || [];

  // Process inspection data for charts
  const inspectionStatusData = inspectionData?.reduce((acc: any[], item) => {
    const existing = acc.find(x => x.name === item.status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.status, value: 1 });
    }
    return acc;
  }, []) || [];

  const inspectionTypeData = inspectionData?.reduce((acc: any[], item) => {
    const existing = acc.find(x => x.name === item.inspection_type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.inspection_type, value: 1 });
    }
    return acc;
  }, []) || [];

  const inspectionProvinceData = inspectionData?.reduce((acc: any[], item) => {
    const existing = acc.find(x => x.province === item.province);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ province: item.province || 'Unknown', count: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count).slice(0, 10) || [];

  // Process registry data for charts
  const registryStatusData = registryData?.reduce((acc: any[], item) => {
    const existing = acc.find(x => x.name === item.assessment_status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.assessment_status, value: 1 });
    }
    return acc;
  }, []) || [];

  const registryOutcomeData = registryData?.reduce((acc: any[], item) => {
    const existing = acc.find(x => x.name === item.assessment_outcome);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.assessment_outcome, value: 1 });
    }
    return acc;
  }, []) || [];

  const registryActivityTypeData = registryData?.reduce((acc: any[], item) => {
    const existing = acc.find(x => x.type === item.permit_activity_type);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ type: item.permit_activity_type || 'Unknown', count: 1 });
    }
    return acc;
  }, []) || [];

  // Process revenue data for charts
  const revenueStatusData = revenueData?.reduce((acc: any[], item) => {
    const existing = acc.find(x => x.name === item.payment_status);
    if (existing) {
      existing.value += 1;
      existing.amount += Number(item.total_fee);
    } else {
      acc.push({ name: item.payment_status, value: 1, amount: Number(item.total_fee) });
    }
    return acc;
  }, []) || [];

  const revenueMonthlyData = revenueData?.reduce((acc: any[], item) => {
    const month = new Date(item.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
    const existing = acc.find(x => x.month === month);
    if (existing) {
      existing.revenue += Number(item.total_fee);
      existing.transactions += 1;
    } else {
      acc.push({ month, revenue: Number(item.total_fee), transactions: 1 });
    }
    return acc;
  }, []) || [];

  const revenueMethodData = revenueData?.reduce((acc: any[], item) => {
    const method = item.payment_method || 'Not specified';
    const existing = acc.find(x => x.name === method);
    if (existing) {
      existing.value += 1;
      existing.amount += Number(item.total_fee);
    } else {
      acc.push({ name: method, value: 1, amount: Number(item.total_fee) });
    }
    return acc;
  }, []) || [];

  const totalRevenue = revenueData?.reduce((sum, item) => sum + Number(item.total_fee), 0) || 0;
  const paidRevenue = revenueData?.filter(item => item.payment_status === 'paid').reduce((sum, item) => sum + Number(item.total_fee), 0) || 0;
  const pendingRevenue = revenueData?.filter(item => item.payment_status === 'pending').reduce((sum, item) => sum + Number(item.total_fee), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports and Analysis</h1>
          <p className="text-muted-foreground mt-1">Comprehensive performance analytics across all units</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="inspection">Inspection</TabsTrigger>
          <TabsTrigger value="registry">Registry</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4 mt-4">
          <div id="compliance-report" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{complianceData?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {complianceData?.filter(item => item.assessment_status === 'completed').length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Avg Compliance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {complianceData?.filter(item => item.compliance_score).length 
                      ? Math.round(complianceData.reduce((sum, item) => sum + (item.compliance_score || 0), 0) / complianceData.filter(item => item.compliance_score).length)
                      : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Status Distribution</CardTitle>
                  <CardDescription>Breakdown of compliance assessments by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={complianceStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {complianceStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Assessment Trends</CardTitle>
                  <CardDescription>Assessment volume and average scores over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={complianceMonthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="count" stroke="hsl(var(--primary))" name="Assessments" />
                      <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="hsl(var(--secondary))" name="Avg Score" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Inspection Tab */}
        <TabsContent value="inspection" className="space-y-4 mt-4">
          <div id="inspection-report" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{inspectionData?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {inspectionData?.filter(item => item.status === 'completed').length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {inspectionData?.filter(item => item.status === 'scheduled').length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inspection Status</CardTitle>
                  <CardDescription>Current status of all inspections</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={inspectionStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {inspectionStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inspection Types</CardTitle>
                  <CardDescription>Distribution by inspection type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={inspectionTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="hsl(var(--primary))" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Top 10 Provinces by Inspection Volume</CardTitle>
                  <CardDescription>Geographic distribution of inspections</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={inspectionProvinceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="province" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="hsl(var(--secondary))" name="Inspections" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Registry Tab */}
        <TabsContent value="registry" className="space-y-4 mt-4">
          <div id="registry-report" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{registryData?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {registryData?.filter(item => item.assessment_outcome === 'approved').length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {registryData?.filter(item => item.assessment_status === 'pending').length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Status</CardTitle>
                  <CardDescription>Current status of registry assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={registryStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {registryStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Assessment Outcomes</CardTitle>
                  <CardDescription>Distribution of assessment decisions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={registryOutcomeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {registryOutcomeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Activity Type Distribution</CardTitle>
                  <CardDescription>Permit applications by activity type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={registryActivityTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="hsl(var(--accent))" name="Applications" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4 mt-4">
          <div id="revenue-report" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">K {totalRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Paid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">K {paidRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">K {pendingRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{revenueData?.length || 0}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Status</CardTitle>
                  <CardDescription>Revenue distribution by payment status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenueStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Transaction count by payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueMethodData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="hsl(var(--primary))" name="Transactions" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Revenue Trends</CardTitle>
                  <CardDescription>Revenue collection and transaction volume over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueMonthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" name="Revenue (K)" />
                      <Line yAxisId="right" type="monotone" dataKey="transactions" stroke="hsl(var(--secondary))" name="Transactions" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}