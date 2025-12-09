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
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  Banknote,
  PiggyBank,
  Target,
  AlertTriangle,
  Building
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, differenceInDays, parseISO } from "date-fns";
import { useDateFilter, filterByDateRange, type DateFilterPeriod } from "@/hooks/useDateFilter";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

const RevenueAnalyticsReportsNew = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<DateFilterPeriod>("monthly");
  const dateRange = useDateFilter(selectedPeriod);

  // Fetch invoices data
  const { data: invoicesDataRaw, isLoading: invoicesLoading } = useQuery({
    queryKey: ['revenue-invoices-analytics', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch fee payments data
  const { data: paymentsDataRaw, isLoading: paymentsLoading } = useQuery({
    queryKey: ['revenue-payments-analytics', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_payments')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch financial transactions
  const { data: transactionsDataRaw, isLoading: transactionsLoading } = useQuery({
    queryKey: ['revenue-transactions-analytics', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch entities for debtor analysis (not date filtered - we need all entities)
  const { data: entitiesData, isLoading: entitiesLoading } = useQuery({
    queryKey: ['revenue-entities-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entities')
        .select('id, name, entity_type');
      if (error) throw error;
      return data || [];
    }
  });

  // Use filtered data
  const invoicesData = invoicesDataRaw;
  const paymentsData = paymentsDataRaw;
  const transactionsData = transactionsDataRaw;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PG', {
      style: 'currency',
      currency: 'PGK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Process invoice statistics
  const invoiceStats = useMemo(() => {
    if (!invoicesData) return { total: 0, paid: 0, pending: 0, overdue: 0, totalAmount: 0, collectedAmount: 0, pendingAmount: 0 };
    
    const now = new Date();
    const paid = invoicesData.filter(i => i.status === 'paid');
    const pending = invoicesData.filter(i => i.status === 'pending');
    const overdue = invoicesData.filter(i => {
      if (i.status === 'paid') return false;
      return new Date(i.due_date) < now;
    });

    return {
      total: invoicesData.length,
      paid: paid.length,
      pending: pending.length,
      overdue: overdue.length,
      totalAmount: invoicesData.reduce((sum, i) => sum + (i.amount || 0), 0),
      collectedAmount: paid.reduce((sum, i) => sum + (i.amount || 0), 0),
      pendingAmount: pending.reduce((sum, i) => sum + (i.amount || 0), 0),
      overdueAmount: overdue.reduce((sum, i) => sum + (i.amount || 0), 0)
    };
  }, [invoicesData]);

  // Process payment statistics
  const paymentStats = useMemo(() => {
    if (!paymentsData) return { total: 0, paid: 0, pending: 0, totalCollected: 0 };
    return {
      total: paymentsData.length,
      paid: paymentsData.filter(p => p.payment_status === 'paid').length,
      pending: paymentsData.filter(p => p.payment_status === 'pending').length,
      totalCollected: paymentsData.filter(p => p.payment_status === 'paid')
        .reduce((sum, p) => sum + (p.amount_paid || 0), 0)
    };
  }, [paymentsData]);

  // Collection rate
  const collectionRate = useMemo(() => {
    if (!invoiceStats.totalAmount) return 0;
    return (invoiceStats.collectedAmount / invoiceStats.totalAmount) * 100;
  }, [invoiceStats]);

  // Monthly revenue trends
  const monthlyRevenue = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push(months[monthIndex]);
    }

    return last6Months.map((month, idx) => {
      const targetMonth = (currentMonth - 5 + idx + 12) % 12;
      
      const invoiced = invoicesData?.filter(i => {
        const date = new Date(i.created_at);
        return date.getMonth() === targetMonth;
      }).reduce((sum, i) => sum + (i.amount || 0), 0) || 0;
      
      const collected = invoicesData?.filter(i => {
        if (i.status !== 'paid' || !i.paid_date) return false;
        const date = new Date(i.paid_date);
        return date.getMonth() === targetMonth;
      }).reduce((sum, i) => sum + (i.amount || 0), 0) || 0;

      return {
        month,
        invoiced,
        collected,
        outstanding: invoiced - collected
      };
    });
  }, [invoicesData]);

  // Invoice status distribution
  const invoiceStatusData = useMemo(() => {
    return [
      { name: "Paid", value: invoiceStats.paid, color: "#10b981" },
      { name: "Pending", value: invoiceStats.pending, color: "#f59e0b" },
      { name: "Overdue", value: invoiceStats.overdue, color: "#ef4444" },
    ].filter(d => d.value > 0);
  }, [invoiceStats]);

  // Aging analysis
  const agingAnalysis = useMemo(() => {
    if (!invoicesData) return [];
    const now = new Date();
    const aging = {
      current: { count: 0, amount: 0 },
      '30days': { count: 0, amount: 0 },
      '60days': { count: 0, amount: 0 },
      '90days': { count: 0, amount: 0 },
      'over90': { count: 0, amount: 0 }
    };

    invoicesData.filter(i => i.status !== 'paid').forEach(invoice => {
      const dueDate = new Date(invoice.due_date);
      const daysOverdue = differenceInDays(now, dueDate);
      const amount = invoice.amount || 0;

      if (daysOverdue <= 0) {
        aging.current.count++;
        aging.current.amount += amount;
      } else if (daysOverdue <= 30) {
        aging['30days'].count++;
        aging['30days'].amount += amount;
      } else if (daysOverdue <= 60) {
        aging['60days'].count++;
        aging['60days'].amount += amount;
      } else if (daysOverdue <= 90) {
        aging['90days'].count++;
        aging['90days'].amount += amount;
      } else {
        aging['over90'].count++;
        aging['over90'].amount += amount;
      }
    });

    return [
      { period: 'Current', count: aging.current.count, amount: aging.current.amount, color: '#10b981' },
      { period: '1-30 Days', count: aging['30days'].count, amount: aging['30days'].amount, color: '#f59e0b' },
      { period: '31-60 Days', count: aging['60days'].count, amount: aging['60days'].amount, color: '#f97316' },
      { period: '61-90 Days', count: aging['90days'].count, amount: aging['90days'].amount, color: '#ef4444' },
      { period: '90+ Days', count: aging['over90'].count, amount: aging['over90'].amount, color: '#dc2626' },
    ];
  }, [invoicesData]);

  // Invoice type distribution
  const invoiceTypeData = useMemo(() => {
    if (!invoicesData) return [];
    const typeCount: Record<string, { count: number; amount: number }> = {};
    
    invoicesData.forEach(inv => {
      const type = inv.invoice_type || 'General';
      if (!typeCount[type]) typeCount[type] = { count: 0, amount: 0 };
      typeCount[type].count++;
      typeCount[type].amount += inv.amount || 0;
    });

    return Object.entries(typeCount)
      .map(([name, data], index) => ({
        name,
        count: data.count,
        amount: data.amount,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [invoicesData]);

  // Top debtors
  const topDebtors = useMemo(() => {
    if (!invoicesData || !entitiesData) return [];
    
    const debtorTotals: Record<string, { entityId: string; total: number; count: number }> = {};
    
    invoicesData.filter(i => i.status !== 'paid').forEach(inv => {
      const entityId = inv.entity_id;
      if (!entityId) return;
      if (!debtorTotals[entityId]) {
        debtorTotals[entityId] = { entityId, total: 0, count: 0 };
      }
      debtorTotals[entityId].total += inv.amount || 0;
      debtorTotals[entityId].count++;
    });

    return Object.values(debtorTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map(debtor => {
        const entity = entitiesData.find(e => e.id === debtor.entityId);
        return {
          name: entity?.name || 'Unknown Entity',
          entityType: entity?.entity_type || 'Unknown',
          outstanding: debtor.total,
          invoiceCount: debtor.count
        };
      });
  }, [invoicesData, entitiesData]);

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

  const isLoading = invoicesLoading || paymentsLoading || transactionsLoading || entitiesLoading;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl">Revenue Analytics & Reporting</CardTitle>
              <CardDescription className="text-sm">Comprehensive financial analytics and collection reports</CardDescription>
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
          <TabsTrigger value="collections" className="flex-1 min-w-[100px] text-xs sm:text-sm">Collections</TabsTrigger>
          <TabsTrigger value="aging" className="flex-1 min-w-[100px] text-xs sm:text-sm">Aging Analysis</TabsTrigger>
          <TabsTrigger value="debtors" className="flex-1 min-w-[100px] text-xs sm:text-sm">Debtors</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-24" /> : (
                  <div className="text-xl md:text-2xl font-bold">{formatCurrency(invoiceStats.totalAmount)}</div>
                )}
                <p className="text-xs text-muted-foreground">All invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                  Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-24" /> : (
                  <div className="text-xl md:text-2xl font-bold text-green-600">{formatCurrency(invoiceStats.collectedAmount)}</div>
                )}
                <p className="text-xs text-muted-foreground">{invoiceStats.paid} invoices paid</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-amber-500" />
                  Outstanding
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-24" /> : (
                  <div className="text-xl md:text-2xl font-bold text-amber-600">{formatCurrency(invoiceStats.pendingAmount)}</div>
                )}
                <p className="text-xs text-muted-foreground">{invoiceStats.pending} pending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Target className="w-4 h-4 mr-2 text-blue-500" />
                  Collection Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <>
                    <div className="text-xl md:text-2xl font-bold">{collectionRate.toFixed(1)}%</div>
                    <Progress value={collectionRate} className="mt-2 h-2" />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Trends */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <CardTitle className="text-base">Revenue Trends</CardTitle>
                    <CardDescription className="text-xs">Monthly invoiced vs collected</CardDescription>
                  </div>
                  <ReportActions reportName="Revenue Trends" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="invoiced" fill="#3b82f6" name="Invoiced" />
                    <Bar dataKey="collected" fill="#10b981" name="Collected" />
                    <Line type="monotone" dataKey="outstanding" stroke="#ef4444" name="Outstanding" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Invoice Status */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <CardTitle className="text-base">Invoice Status</CardTitle>
                    <CardDescription className="text-xs">Distribution by payment status</CardDescription>
                  </div>
                  <ReportActions reportName="Invoice Status" />
                </div>
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
          </div>

          {/* Invoice Types */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base">Revenue by Invoice Type</CardTitle>
                  <CardDescription className="text-xs">Breakdown by category</CardDescription>
                </div>
                <ReportActions reportName="Invoice Types" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={invoiceTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" fontSize={10} width={100} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Receipt className="w-4 h-4 mr-2 text-blue-500" />
                  Total Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold">{invoiceStats.total}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-green-500" />
                  Fee Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold">{paymentStats.total}</div>
                )}
                <p className="text-xs text-muted-foreground">{paymentStats.paid} completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl md:text-3xl font-bold text-red-600">{invoiceStats.overdue}</div>
                )}
                <p className="text-xs text-muted-foreground">{formatCurrency(invoiceStats.overdueAmount || 0)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Banknote className="w-4 h-4 mr-2 text-emerald-500" />
                  Payment Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-24" /> : (
                  <div className="text-xl md:text-2xl font-bold text-green-600">{formatCurrency(paymentStats.totalCollected)}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Collection Summary Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base">Collection Summary</CardTitle>
                  <CardDescription className="text-xs">Detailed breakdown of collections</CardDescription>
                </div>
                <ReportActions reportName="Collection Summary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">% of Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Paid Invoices
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{invoiceStats.paid}</TableCell>
                      <TableCell className="text-right text-green-600">{formatCurrency(invoiceStats.collectedAmount)}</TableCell>
                      <TableCell className="text-right">{collectionRate.toFixed(1)}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          Pending Invoices
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{invoiceStats.pending}</TableCell>
                      <TableCell className="text-right text-amber-600">{formatCurrency(invoiceStats.pendingAmount)}</TableCell>
                      <TableCell className="text-right">{((invoiceStats.pendingAmount / invoiceStats.totalAmount) * 100 || 0).toFixed(1)}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          Overdue Invoices
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{invoiceStats.overdue}</TableCell>
                      <TableCell className="text-right text-red-600">{formatCurrency(invoiceStats.overdueAmount || 0)}</TableCell>
                      <TableCell className="text-right">{(((invoiceStats.overdueAmount || 0) / invoiceStats.totalAmount) * 100 || 0).toFixed(1)}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aging Analysis Tab */}
        <TabsContent value="aging" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base">Accounts Receivable Aging</CardTitle>
                  <CardDescription className="text-xs">Outstanding invoices by age</CardDescription>
                </div>
                <ReportActions reportName="Aging Analysis" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agingAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="amount" name="Amount" radius={[4, 4, 0, 0]}>
                    {agingAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Aging Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aging Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aging Period</TableHead>
                      <TableHead className="text-right">Invoice Count</TableHead>
                      <TableHead className="text-right">Outstanding Amount</TableHead>
                      <TableHead className="text-right">% of Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agingAnalysis.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: row.color }} />
                            {row.period}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.amount)}</TableCell>
                        <TableCell className="text-right">
                          {((row.amount / (invoiceStats.pendingAmount + (invoiceStats.overdueAmount || 0))) * 100 || 0).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Debtors Tab */}
        <TabsContent value="debtors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base">Top Outstanding Debtors</CardTitle>
                  <CardDescription className="text-xs">Entities with highest unpaid balances</CardDescription>
                </div>
                <ReportActions reportName="Top Debtors" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Invoices</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topDebtors.length > 0 ? topDebtors.map((debtor, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            {debtor.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{debtor.entityType}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{debtor.invoiceCount}</TableCell>
                        <TableCell className="text-right text-red-600 font-medium">
                          {formatCurrency(debtor.outstanding)}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No outstanding debtors found
                        </TableCell>
                      </TableRow>
                    )}
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

export default RevenueAnalyticsReportsNew;
