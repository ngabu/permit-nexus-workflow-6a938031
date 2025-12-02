import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useInvoices } from './hooks/useInvoices';
import { DollarSign, CheckCircle, XCircle, AlertTriangle, Search, Upload, FileText, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';

export function PaymentProcessing() {
  const { invoices, updateInvoicePaymentStatus, loading, refetch } = useInvoices();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  
  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.entity?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingPayments = invoices.filter(inv => inv.payment_status === 'pending' || inv.payment_status === 'partially_paid');

  const handleProcessPayment = async () => {
    if (!selectedInvoice) return;
    
    if (!paymentAmount || !paymentMethod || !paymentReference) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required payment fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Determine new status based on payment amount
      const amount = parseFloat(paymentAmount);
      const totalAmount = selectedInvoice.amount;
      let newStatus = 'pending';
      
      if (amount >= totalAmount) {
        newStatus = 'paid';
      } else if (amount > 0) {
        newStatus = 'partially_paid';
      }

      await updateInvoicePaymentStatus(
        selectedInvoice.id,
        newStatus,
        `Payment of K${amount} via ${paymentMethod}. Reference: ${paymentReference}. ${paymentNotes}`
      );

      toast({
        title: 'Payment Processed',
        description: `Payment of K${amount} has been recorded successfully`,
      });

      // Reset form
      setPaymentDialogOpen(false);
      setSelectedInvoice(null);
      setPaymentAmount('');
      setPaymentMethod('');
      setPaymentReference('');
      setPaymentNotes('');
      setReceiptFile(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                  <p className="text-2xl font-bold text-foreground">{pendingPayments.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Outstanding</p>
                  <p className="text-2xl font-bold text-foreground">
                    K{pendingPayments.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processed Today</p>
                  <p className="text-2xl font-bold text-foreground">
                    {invoices.filter(inv => 
                      inv.paid_date && 
                      new Date(inv.paid_date).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payment Processing
            </CardTitle>
            <CardDescription>Process and verify permit fee payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice number or entity name..."
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
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Queue */}
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-muted rounded-lg h-24"></div>
                  ))}
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No invoices found</p>
                </div>
              ) : (
                filteredInvoices.map((invoice) => (
                  <Card key={invoice.id} className="border-border hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{invoice.invoice_number}</h4>
                            <Badge className={getStatusColor(invoice.payment_status)}>
                              {invoice.payment_status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{invoice.entity?.name}</p>
                          <p className="text-xs text-muted-foreground">{invoice.permit?.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">K{invoice.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Created: {format(new Date(invoice.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setPaymentAmount(invoice.amount.toString());
                            setPaymentDialogOpen(true);
                          }}
                          disabled={invoice.payment_status === 'paid'}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Process Payment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Processing Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Record payment details for invoice {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Invoice Summary */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Entity</p>
                    <p className="text-foreground">{selectedInvoice?.entity?.name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Invoice Amount</p>
                    <p className="text-lg font-bold text-foreground">K{selectedInvoice?.amount.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details Form */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount *</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="eftpos">EFTPOS</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentReference">Payment Reference/Transaction ID *</Label>
              <Input
                id="paymentReference"
                placeholder="Enter transaction reference or receipt number"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptFile">Receipt/Proof of Payment</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="receiptFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                />
                <Upload className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Upload receipt (PDF, JPG, PNG - Max 5MB)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentNotes">Notes (Optional)</Label>
              <Textarea
                id="paymentNotes"
                placeholder="Add any additional notes about this payment..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessPayment}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
