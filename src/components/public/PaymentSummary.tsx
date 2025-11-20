import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Download, Search, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import pngEmblem from '@/assets/png-emblem.png';

interface PaymentRecord {
  id: string;
  date: string;
  ref_no: string;
  description: string;
  charges: number;
  payments: number;
  balance: number;
}

export function PaymentSummary() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [entityName, setEntityName] = useState('');
  const [entityAddress, setEntityAddress] = useState('');
  const printRef = useRef<HTMLDivElement>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentData();
  }, [user]);

  useEffect(() => {
    filterPayments();
  }, [payments, startDate, endDate, searchTerm]);

  const fetchPaymentData = async () => {
    if (!user) return;

    try {
      // Fetch user's entity info
      const { data: entityData } = await supabase
        .from('entities')
        .select('name, postal_address')
        .eq('user_id', user.id)
        .single();

      if (entityData) {
        setEntityName(entityData.name);
        setEntityAddress(entityData.postal_address || '');
      }

      // Fetch invoices with permit information
      const { data: invoicesData, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          amount,
          status,
          due_date,
          paid_date,
          created_at,
          permit_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch fee payments for additional details
      const { data: feePaymentsData } = await supabase
        .from('fee_payments')
        .select(`
          id,
          permit_application_id,
          total_fee,
          amount_paid,
          payment_status,
          created_at,
          paid_at
        `)
        .eq('payment_status', 'paid');

      // Combine data into payment records format
      const paymentRecords: PaymentRecord[] = [];
      let runningBalance = 0;

      if (invoicesData) {
        for (const invoice of invoicesData) {
          const charges = invoice.amount;
          const payments = invoice.status === 'paid' ? invoice.amount : 0;
          runningBalance += charges - payments;

          // Get permit details for description
          let description = 'General Fee';
          if (invoice.permit_id) {
            const { data: permitData } = await supabase
              .from('permit_applications')
              .select('title, permit_number')
              .eq('id', invoice.permit_id)
              .single();
            
            if (permitData) {
              description = `${permitData.title || 'Permit Application'}${permitData.permit_number ? ` - ${permitData.permit_number}` : ''}`;
            }
          }

          paymentRecords.push({
            id: invoice.id,
            date: new Date(invoice.created_at).toLocaleDateString('en-GB', { 
              day: '2-digit', 
              month: 'short', 
              year: '2-digit' 
            }),
            ref_no: invoice.invoice_number,
            description,
            charges,
            payments,
            balance: runningBalance,
          });
        }
      }

      setPayments(paymentRecords);
      setFilteredPayments(paymentRecords);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment summary',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(p => new Date(p.date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(p => new Date(p.date) <= new Date(endDate));
    }

    // Description search
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ref_no.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  };

  const calculateOverdueAmounts = () => {
    const current = filteredPayments
      .filter(p => p.balance > 0 && p.balance <= 30)
      .reduce((sum, p) => sum + p.balance, 0);
    
    const thirtyDays = filteredPayments
      .filter(p => p.balance > 30 && p.balance <= 60)
      .reduce((sum, p) => sum + p.balance, 0);
    
    const sixtyDays = filteredPayments
      .filter(p => p.balance > 60 && p.balance <= 90)
      .reduce((sum, p) => sum + p.balance, 0);
    
    const sixtyPlus = filteredPayments
      .filter(p => p.balance > 90)
      .reduce((sum, p) => sum + p.balance, 0);
    
    const total = current + thirtyDays + sixtyDays + sixtyPlus;

    return { current, thirtyDays, sixtyDays, sixtyPlus, total };
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const handleDownload = () => {
    const overdueAmounts = calculateOverdueAmounts();
    const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
    
    let csvContent = "Conservation & Environment Protection Authority\n";
    csvContent += "Corporate Services Division\n";
    csvContent += "REVENUE BRANCH\n\n";
    csvContent += `${entityName}\n`;
    csvContent += `${entityAddress}\n\n`;
    csvContent += `STATEMENT DATE: ${currentDate}\n`;
    csvContent += `AMOUNT REMITTED: $${overdueAmounts.total.toFixed(2)}\n\n`;
    csvContent += "DATE,REF NO.,DESCRIPTION,CHARGES,PAYMENTS,BALANCE\n";
    
    filteredPayments.forEach(payment => {
      csvContent += `${payment.date},${payment.ref_no},"${payment.description}",$${payment.charges.toFixed(2)},$${payment.payments.toFixed(2)},$${payment.balance.toFixed(2)}\n`;
    });
    
    csvContent += `\nCurrent(Not Overdue),$${overdueAmounts.current.toFixed(2)}\n`;
    csvContent += `30 Days Overdue,$${overdueAmounts.thirtyDays.toFixed(2)}\n`;
    csvContent += `60 Days Overdue,$${overdueAmounts.sixtyDays.toFixed(2)}\n`;
    csvContent += `60+ Days Overdue,$${overdueAmounts.sixtyPlus.toFixed(2)}\n`;
    csvContent += `Total Amount Due,$${overdueAmounts.total.toFixed(2)}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment-summary-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const overdueAmounts = calculateOverdueAmounts();
  const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });

  if (loading) {
    return <div className="flex justify-center p-8">Loading payment summary...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment Summary</span>
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="search">Search Description</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statement Section */}
      <div ref={printRef}>
        <Card>
          <CardContent className="pt-6">
            {/* Header */}
            <div className="text-center mb-6 border-b pb-6">
              <div className="flex justify-center mb-4">
                <img src={pngEmblem} alt="CEPA Emblem" className="h-20" />
              </div>
              <h1 className="text-xl font-bold">Conservation & Environment Protection Authority</h1>
              <p className="text-sm text-muted-foreground">Corporate Services Division</p>
              <p className="text-sm font-semibold">REVENUE BRANCH</p>
            </div>

            {/* Entity and Statement Info */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div className="border p-4">
                <p className="font-semibold">{entityName}</p>
                <p className="text-sm text-muted-foreground">{entityAddress}</p>
              </div>
              <div className="border p-4 text-right">
                <p className="font-bold">STATEMENT</p>
                <p className="text-sm">DATE</p>
                <p className="text-sm">{currentDate}</p>
                <p className="text-sm mt-2">AMOUNT REMITTED</p>
                <p className="font-semibold">${overdueAmounts.total.toFixed(2)}</p>
              </div>
            </div>

            {/* Payment Table */}
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>DATE</TableHead>
                  <TableHead>REF NO.</TableHead>
                  <TableHead>DESCRIPTION</TableHead>
                  <TableHead className="text-right">CHARGES</TableHead>
                  <TableHead className="text-right">PAYMENTS</TableHead>
                  <TableHead className="text-right">BALANCE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{payment.ref_no}</TableCell>
                    <TableCell className="max-w-md">{payment.description}</TableCell>
                    <TableCell className="text-right">${payment.charges.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {payment.payments > 0 ? `$${payment.payments.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${payment.balance.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Footer - Overdue Summary */}
            <div className="mt-6 border-t pt-4">
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                <div className="border p-3">
                  <p className="font-semibold mb-1">Current(Not Overdue)</p>
                  <p>${overdueAmounts.current.toFixed(2)}</p>
                </div>
                <div className="border p-3">
                  <p className="font-semibold mb-1">30 Days Overdue</p>
                  <p>${overdueAmounts.thirtyDays.toFixed(2)}</p>
                </div>
                <div className="border p-3">
                  <p className="font-semibold mb-1">60 Days Overdue</p>
                  <p>${overdueAmounts.sixtyDays.toFixed(2)}</p>
                </div>
                <div className="border p-3">
                  <p className="font-semibold mb-1">60+ Days Overdue</p>
                  <p>${overdueAmounts.sixtyPlus.toFixed(2)}</p>
                </div>
                <div className="border p-3 bg-muted">
                  <p className="font-bold mb-1">Total Amount Due</p>
                  <p className="font-bold">${overdueAmounts.total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-right text-sm text-muted-foreground">
              Page 1 of 1
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
