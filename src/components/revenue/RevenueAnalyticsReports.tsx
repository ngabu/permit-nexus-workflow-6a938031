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
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  DollarSign,
  FileText,
  Receipt
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const RevenueAnalyticsReports = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  // Fetch invoices data
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch financial transactions data
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch fee payments data
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['fee-payments-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_payments')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Process invoice data
  const invoiceStats = {
    total: invoicesData?.length || 0,
    paid: invoicesData?.filter(i => i.status === 'paid').length || 0,
    pending: invoicesData?.filter(i => i.status === 'pending').length || 0,
    overdue: invoicesData?.filter(i => i.status === 'overdue').length || 0,
    totalAmount: invoicesData?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0,
    paidAmount: invoicesData?.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0) || 0,
  };

  // Process payment data
  const paymentStats = {
    total: paymentsData?.length || 0,
    paid: paymentsData?.filter(p => p.payment_status === 'paid').length || 0,
    pending: paymentsData?.filter(p => p.payment_status === 'pending').length || 0,
    totalCollected: paymentsData?.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0,
  };

  // Chart data
  const invoiceStatusData = [
    { name: "Paid", value: invoiceStats.paid, color: "#10b981" },
    { name: "Pending", value: invoiceStats.pending, color: "#f59e0b" },
    { name: "Overdue", value: invoiceStats.overdue, color: "#ef4444" },
  ];

  const monthlyRevenueData = [
    { month: "Jan", revenue: 125000, target: 150000 },
    { month: "Feb", revenue: 145000, target: 150000 },
    { month: "Mar", revenue: 168000, target: 150000 },
    { month: "Apr", revenue: 132000, target: 150000 },
    { month: "May", revenue: 178000, target: 150000 },
    { month: "Jun", revenue: 195000, target: 150000 },
  ];

  const paymentMethodData = [
    { name: "Bank Transfer", value: 45, color: "#3b82f6" },
    { name: "Check", value: 30, color: "#10b981" },
    { name: "Cash", value: 15, color: "#f59e0b" },
    { name: "Online", value: 10, color: "#8b5cf6" },
  ];

  const officerPerformance = [
    { name: "John Doe", collected: 245000, invoices: 45, avgTime: 8 },
    { name: "Jane Smith", collected: 198000, invoices: 38, avgTime: 10 },
    { name: "Mike Johnson", collected: 175000, invoices: 32, avgTime: 7 },
    { name: "Sarah Williams", collected: 212000, invoices: 42, avgTime: 9 },
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PG', {
      style: 'currency',
      currency: 'PGK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const isLoading = invoicesLoading || transactionsLoading || paymentsLoading;

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Analytics & Reporting</CardTitle>
              <CardDescription>Comprehensive revenue analytics and financial reports</CardDescription>
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
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="staff-performance">Staff Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-24" /> : (
                  <>
                    <div className="text-3xl font-bold">{formatCurrency(invoiceStats.totalAmount)}</div>
                    <p className="text-xs text-muted-foreground">All invoices</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                  Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-24" /> : (
                  <>
                    <div className="text-3xl font-bold text-green-600">{formatCurrency(invoiceStats.paidAmount)}</div>
                    <p className="text-xs text-muted-foreground">Payments received</p>
                  </>
                )}
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
                {isLoading ? <Skeleton className="h-8 w-24" /> : (
                  <>
                    <div className="text-3xl font-bold text-amber-600">{invoiceStats.pending}</div>
                    <p className="text-xs text-muted-foreground">Invoices pending</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-24" /> : (
                  <>
                    <div className="text-3xl font-bold text-red-600">{invoiceStats.overdue}</div>
                    <p className="text-xs text-muted-foreground">Requires follow-up</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trends Chart */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Monthly revenue vs target</CardDescription>
                </div>
                <ReportActions reportName="Revenue Trends" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  <Bar dataKey="target" fill="#3b82f6" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Invoice Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Status Distribution</CardTitle>
                <CardDescription>By payment status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={invoiceStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {invoiceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Method Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>By payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
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

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Receipt className="w-4 h-4 mr-2 text-blue-500" />
                  Total Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{invoiceStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{invoiceStats.paid}</div>
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
                <div className="text-3xl font-bold text-amber-600">{invoiceStats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{invoiceStats.overdue}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Invoice Analytics</CardTitle>
                  <CardDescription>Invoice status breakdown</CardDescription>
                </div>
                <ReportActions reportName="Invoice Report" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={invoiceStatusData}>
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

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                  Total Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{paymentStats.total}</div>
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
                <div className="text-3xl font-bold text-green-600">{paymentStats.paid}</div>
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
                <div className="text-3xl font-bold text-amber-600">{paymentStats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                  Total Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{formatCurrency(paymentStats.totalCollected)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Payment Collection Trends</CardTitle>
                  <CardDescription>Monthly collection performance</CardDescription>
                </div>
                <ReportActions reportName="Payment Report" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Collections" />
                  <Line type="monotone" dataKey="target" stroke="#3b82f6" name="Target" strokeDasharray="5 5" />
                </LineChart>
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
                  <CardDescription>Individual performance metrics and collection rates</CardDescription>
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
                          <p className="text-xs text-muted-foreground">Revenue Officer</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-8">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(officer.collected)}</div>
                        <p className="text-xs text-muted-foreground">Collected</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{officer.invoices}</div>
                        <p className="text-xs text-muted-foreground">Invoices</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">{officer.avgTime}d</div>
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

export default RevenueAnalyticsReports;