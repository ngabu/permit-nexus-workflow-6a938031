import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Receipt, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InvoiceDetailView } from './InvoiceDetailView';
import { useInvoices, Invoice } from '@/hooks/useInvoices';

export function InvoiceManagement() {
  const { invoices, loading, refreshInvoice, updateLocalInvoice } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  // Listen for payment success events from localStorage
  useEffect(() => {
    const handlePaymentSuccess = (event: CustomEvent<{ invoiceNumber: string; receiptUrl: string | null }>) => {
      const { invoiceNumber, receiptUrl } = event.detail;
      console.log('Payment success event received:', invoiceNumber, receiptUrl);
      
      // Update local invoice state immediately
      updateLocalInvoice(invoiceNumber, {
        status: 'paid',
        paidToDate: invoices.find(i => i.invoice_number === invoiceNumber)?.totalInc || 0,
        balanceDue: 0,
        receiptUrl: receiptUrl
      });

      // Also refresh from database to ensure we have the latest
      refreshInvoice(invoiceNumber);
    };

    // Check localStorage for payment completion from payment callback page
    const checkPaymentCompletion = () => {
      const paymentData = localStorage.getItem('payment_completed');
      if (paymentData) {
        try {
          const { invoiceNumber, receiptUrl, timestamp } = JSON.parse(paymentData);
          // Only process if the payment was completed recently (within 5 minutes)
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            console.log('Payment completion detected from localStorage:', invoiceNumber);
            
            // Update local state immediately
            updateLocalInvoice(invoiceNumber, {
              status: 'paid',
              paidToDate: invoices.find(i => i.invoice_number === invoiceNumber)?.totalInc || 0,
              balanceDue: 0,
              receiptUrl: receiptUrl
            });

            // Refresh from database
            refreshInvoice(invoiceNumber);

            toast({
              title: "Payment Successful",
              description: `Invoice ${invoiceNumber} has been marked as paid.`,
            });
          }
          // Clear the localStorage after processing
          localStorage.removeItem('payment_completed');
        } catch (e) {
          console.error('Error parsing payment completion data:', e);
        }
      }
    };

    // Check on mount
    checkPaymentCompletion();

    // Listen for storage events (when payment callback updates localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'payment_completed' && e.newValue) {
        checkPaymentCompletion();
      }
    };

    // Also poll periodically while this component is visible (for same-tab updates)
    const pollInterval = setInterval(checkPaymentCompletion, 2000);

    window.addEventListener('payment-success', handlePaymentSuccess as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('payment-success', handlePaymentSuccess as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [toast, invoices, updateLocalInvoice, refreshInvoice]);

  const getStatusColor = (status: string) => {
    const colors = {
      unpaid: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      unpaid: 'Unpaid',
      paid: 'Paid',
      partial: 'Partial Payment',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handlePayment = (invoice: Invoice) => {
    toast({
      title: "Payment Gateway",
      description: `Initiating payment for invoice ${invoice.invoice_number}`,
    });
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.prescribedActivity.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Keep selected invoice in sync with latest data
  useEffect(() => {
    if (selectedInvoice) {
      const updated = invoices.find(i => i.invoice_number === selectedInvoice.invoice_number);
      if (updated && (updated.status !== selectedInvoice.status || updated.receiptUrl !== selectedInvoice.receiptUrl)) {
        setSelectedInvoice(updated);
      }
    }
  }, [invoices, selectedInvoice]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading invoices...</span>
      </div>
    );
  }

  if (selectedInvoice) {
    return (
      <InvoiceDetailView
        invoice={selectedInvoice}
        onBack={() => setSelectedInvoice(null)}
        onPayment={() => handlePayment(selectedInvoice)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Invoice Management</h2>
          <p className="text-muted-foreground">View and manage your permit-related invoices</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number, client, or activity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial Payment</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No invoices found matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Prescribed Activity</TableHead>
                <TableHead>Activity Level</TableHead>
                <TableHead>Permit Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>{invoice.prescribedActivity}</TableCell>
                  <TableCell>{invoice.activityLevel}</TableCell>
                  <TableCell>{invoice.permitType}</TableCell>
                  <TableCell className="text-right font-semibold">
                    K{invoice.balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {getStatusLabel(invoice.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {invoice.status === 'paid' && invoice.receiptUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => window.open(invoice.receiptUrl!, '_blank')}
                        >
                          <Receipt className="w-4 h-4 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
