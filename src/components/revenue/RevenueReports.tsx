import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useIndustrialSectors } from '@/hooks/useIndustrialSectors';
import { useInvoices } from './hooks/useInvoices';
import { BarChart3, Download, Calendar, TrendingUp, DollarSign, FileText, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function RevenueReports() {
  const { industrialSectors, loading: sectorsLoading } = useIndustrialSectors();
  const { invoices, loading } = useInvoices();
  
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>(
    format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Filter invoices based on selected criteria
  const filteredInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.created_at);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const dateMatch = invoiceDate >= start && invoiceDate <= end;
    const sectorMatch = selectedSector === 'all';
    // Note: Sector filtering would need permit application data linked to invoices
    
    return dateMatch && sectorMatch && invoice.payment_status === 'paid';
  });

  // Calculate metrics
  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const averageRevenue = filteredInvoices.length > 0 ? totalRevenue / filteredInvoices.length : 0;
  const transactionCount = filteredInvoices.length;

  // Group by sector (simplified - using entity type as proxy since sector data not in invoice)
  const revenueBySector = filteredInvoices.reduce((acc, invoice) => {
    const category = invoice.entity?.entity_type || 'Unspecified';
    
    if (!acc[category]) {
      acc[category] = { revenue: 0, count: 0 };
    }
    acc[category].revenue += invoice.amount;
    acc[category].count += 1;
    
    return acc;
  }, {} as Record<string, { revenue: number; count: number }>);

  // Group by month
  const revenueByMonth = filteredInvoices.reduce((acc, invoice) => {
    const month = format(new Date(invoice.paid_date || invoice.created_at), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += invoice.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleExport = () => {
    // Create CSV content
    const headers = ['Invoice Number', 'Entity', 'Sector', 'Amount', 'Paid Date', 'Status'];
    const rows = filteredInvoices.map(invoice => [
      invoice.invoice_number,
      invoice.entity?.name || 'N/A',
      invoice.entity?.entity_type || 'N/A',
      invoice.amount,
      invoice.paid_date ? format(new Date(invoice.paid_date), 'yyyy-MM-dd') : 'N/A',
      invoice.payment_status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${startDate}-to-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
          <CardDescription>Select date range and sector to generate revenue reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sector">Entity Type / Sector</Label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger id="sector">
                  <SelectValue placeholder="All entity types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {industrialSectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleExport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">K{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{transactionCount} transactions</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Transaction</p>
                <p className="text-2xl font-bold text-foreground">K{averageRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground mt-1">Per invoice</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Period</p>
                <p className="text-lg font-bold text-foreground">
                  {format(new Date(startDate), 'MMM dd')} - {format(new Date(endDate), 'MMM dd')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Sector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Revenue by Entity Type
          </CardTitle>
          <CardDescription>Breakdown of revenue collected by entity category</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded" />)}
            </div>
          ) : Object.keys(revenueBySector).length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No revenue data for selected period</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity Type</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                  <TableHead className="text-right">Average</TableHead>
                  <TableHead className="text-right">% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(revenueBySector)
                  .sort((a, b) => b[1].revenue - a[1].revenue)
                  .map(([sector, data]) => {
                    const percentage = (data.revenue / totalRevenue) * 100;
                    return (
                      <TableRow key={sector}>
                        <TableCell className="font-medium">{sector}</TableCell>
                        <TableCell className="text-right">{data.count}</TableCell>
                        <TableCell className="text-right font-semibold">
                          K{data.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          K{(data.revenue / data.count).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{percentage.toFixed(1)}%</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Monthly Revenue Trend
          </CardTitle>
          <CardDescription>Revenue collection over time</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(revenueByMonth).length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No monthly data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(revenueByMonth).map(([month, revenue]) => (
                <div key={month} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium text-foreground">{month}</span>
                  <span className="text-lg font-bold text-foreground">K{revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
