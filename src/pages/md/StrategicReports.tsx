import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, DollarSign, Clock, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function StrategicReports() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');
  const [reportData, setReportData] = useState<any>({
    applications: [],
    revenue: [],
    compliance: [],
    processing: [],
  });

  useEffect(() => {
    fetchReportData();
  }, [timeRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '1month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Fetch applications data
      const { data: applications } = await supabase
        .from('permit_applications')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Fetch fee payments data
      const { data: payments } = await supabase
        .from('fee_payments')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Fetch compliance assessments
      const { data: compliance } = await supabase
        .from('compliance_assessments')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Process data for charts
      const applicationsByMonth = processApplicationsByMonth(applications || []);
      const revenueByMonth = processRevenueByMonth(payments || []);
      const complianceStats = processComplianceStats(compliance || []);
      const processingStats = processProcessingStats(applications || []);

      setReportData({
        applications: applicationsByMonth,
        revenue: revenueByMonth,
        compliance: complianceStats,
        processing: processingStats,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch report data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const processApplicationsByMonth = (applications: any[]) => {
    const grouped: any = {};
    applications.forEach(app => {
      const month = new Date(app.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!grouped[month]) {
        grouped[month] = { month, total: 0, approved: 0, pending: 0, rejected: 0 };
      }
      grouped[month].total++;
      if (app.status === 'approved') grouped[month].approved++;
      else if (app.status === 'pending' || app.status === 'under_assessment') grouped[month].pending++;
      else if (app.status === 'rejected') grouped[month].rejected++;
    });
    return Object.values(grouped);
  };

  const processRevenueByMonth = (payments: any[]) => {
    const grouped: any = {};
    payments.forEach(payment => {
      const month = new Date(payment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!grouped[month]) {
        grouped[month] = { month, revenue: 0, paid: 0, pending: 0 };
      }
      grouped[month].revenue += parseFloat(payment.total_fee || 0);
      if (payment.payment_status === 'paid') grouped[month].paid += parseFloat(payment.total_fee || 0);
      else grouped[month].pending += parseFloat(payment.total_fee || 0);
    });
    return Object.values(grouped);
  };

  const processComplianceStats = (compliance: any[]) => {
    const statuses = compliance.reduce((acc: any, item) => {
      acc[item.assessment_status] = (acc[item.assessment_status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  };

  const processProcessingStats = (applications: any[]) => {
    const types = applications.reduce((acc: any, app) => {
      const type = app.permit_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  };

  const exportReport = (reportType: string) => {
    toast({
      title: 'Export Started',
      description: `Generating ${reportType} report...`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Strategic Reports</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive analytics and insights for strategic decision-making
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Application Trends</CardTitle>
                    <CardDescription>Monthly application submission and approval trends</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportReport('Applications')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={reportData.applications}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total Applications" />
                    <Line type="monotone" dataKey="approved" stroke="#10b981" name="Approved" />
                    <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="Pending" />
                    <Line type="monotone" dataKey="rejected" stroke="#ef4444" name="Rejected" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.processing}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData.processing.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Revenue Analysis</CardTitle>
                    <CardDescription>Monthly revenue collection and outstanding payments</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportReport('Revenue')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={reportData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="paid" fill="#10b981" name="Paid" />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Compliance Assessment Status</CardTitle>
                    <CardDescription>Distribution of compliance assessment statuses</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportReport('Compliance')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={reportData.compliance}>
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

          <TabsContent value="processing" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Processing Metrics</CardTitle>
                    <CardDescription>Application processing distribution by type</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportReport('Processing')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={reportData.processing} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
