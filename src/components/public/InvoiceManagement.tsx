import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Receipt, Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InvoiceDetailView } from './InvoiceDetailView';
import { useInvoices, Invoice } from '@/hooks/useInvoices';
import { format } from 'date-fns';

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
        payment_status: 'paid',
        stripe_receipt_url: receiptUrl
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
              payment_status: 'paid',
              stripe_receipt_url: receiptUrl
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
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'unpaid': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'suspended': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      unpaid: 'Unpaid',
      paid: 'Paid',
      partial: 'Partial Payment',
      pending: 'Pending',
      overdue: 'Overdue',
      suspended: 'Suspended',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  const getInvoiceTypeLabel = (invoice: Invoice) => {
    if (invoice.invoice_type === 'inspection_fee') return 'Inspection Fee';
    if (invoice.invoice_type === 'intent_fee') return 'Intent Fee';
    if (invoice.invoice_type === 'permit_fee') return 'Permit Fee';
    if (invoice.inspection) return 'Inspection Fee';
    if (invoice.intent_registration) return 'Intent Fee';
    if (invoice.permit) return 'Permit Fee';
    return 'Fee';
  };

  const getReference = (invoice: Invoice) => {
    if (invoice.permit?.permit_number) return invoice.permit.permit_number;
    if (invoice.inspection?.inspection_type) return invoice.inspection.inspection_type;
    if (invoice.intent_registration?.activity_description) {
      return invoice.intent_registration.activity_description.substring(0, 30) + 
        (invoice.intent_registration.activity_description.length > 30 ? '...' : '');
    }
    return '-';
  };

  const handlePayment = (invoice: Invoice) => {
    toast({
      title: "Payment Gateway",
      description: `Initiating payment for invoice ${invoice.invoice_number}`,
    });
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.entity?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.item_description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const invoiceStatus = invoice.payment_status || invoice.status;
      const matchesStatus = statusFilter === 'all' || invoiceStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  // Keep selected invoice in sync with latest data
  useEffect(() => {
    if (selectedInvoice) {
      const updated = invoices.find(i => i.invoice_number === selectedInvoice.invoice_number);
      if (updated && (updated.status !== selectedInvoice.status || updated.stripe_receipt_url !== selectedInvoice.stripe_receipt_url)) {
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Invoice Management
          </h2>
          <p className="text-muted-foreground">View and manage your permit-related invoices</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number, entity, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial Payment</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No invoices found matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const invoiceStatus = invoice.payment_status || invoice.status;
                const receiptUrl = invoice.stripe_receipt_url || invoice.cepa_receipt_path;
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{getInvoiceTypeLabel(invoice)}</TableCell>
                    <TableCell>{invoice.entity?.name || '-'}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{getReference(invoice)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      K{invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {invoice.due_date ? format(new Date(invoice.due_date), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoiceStatus)}>
                        {getStatusLabel(invoiceStatus)}
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
                        {invoiceStatus === 'paid' && receiptUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => window.open(receiptUrl, '_blank')}
                          >
                            <Receipt className="w-4 h-4 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
