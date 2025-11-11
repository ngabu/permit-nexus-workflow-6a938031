
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Invoice } from '../revenue/types';
import { useInvoices } from '../revenue/hooks/useInvoices';
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, DollarSign, Building2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentRecordDialogProps {
  invoice: Invoice;
  open: boolean;
  onClose: () => void;
}

export function PaymentRecordDialog({ invoice, open, onClose }: PaymentRecordDialogProps) {
  const { updateInvoice } = useInvoices();
  const { toast } = useToast();
  const [paymentAmount, setPaymentAmount] = useState(invoice.amount.toString());
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState('');
  const [bankReference, setBankReference] = useState('');
  const [myobReference, setMyobReference] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSavePayment = async () => {
    setSaving(true);
    try {
      const paidAmount = parseFloat(paymentAmount);
      const totalAmount = invoice.amount;
      
      let newPaymentStatus: 'paid' | 'partially_paid' = 'paid';
      if (paidAmount < totalAmount) {
        newPaymentStatus = 'partially_paid';
      }

      const updates: Partial<Invoice> = {
        payment_status: newPaymentStatus,
        paid_date: paymentDate,
        updated_at: new Date().toISOString()
      };

      const result = await updateInvoice(invoice.id, updates);
      
      if (result.success) {
        toast({
          title: "Payment Recorded",
          description: "Payment has been successfully recorded and invoice updated.",
        });
        onClose();
      } else {
        throw new Error('Failed to record payment');
      }
    } catch (error) {
      toast({
        title: "Payment Recording Failed", 
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-amber-800 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Record Payment - {invoice.invoice_number}
          </DialogTitle>
          <DialogDescription>
            Record and process payment for this invoice
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-amber-700 font-medium">Invoice Amount</Label>
                <p className="text-2xl font-bold text-amber-800">
                  {invoice.currency} {invoice.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-amber-700 font-medium">Current Status</Label>
                <Badge className={`${getStatusColor(invoice.payment_status)} mt-1`}>
                  {invoice.payment_status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            
            {invoice.entity && (
              <div className="mt-3 pt-3 border-t border-amber-200">
                <Label className="text-amber-700 font-medium flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  Client Information
                </Label>
                <p className="text-amber-800">{invoice.entity.name} ({invoice.entity.entity_type})</p>
              </div>
            )}
          </div>

          {/* Payment Details Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-800 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment-amount">Payment Amount ({invoice.currency})</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="payment-date">Payment Date</Label>
                <Input
                  id="payment-date"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="card">Card Payment</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="payment-reference">Payment Reference</Label>
                <Input
                  id="payment-reference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Transaction reference number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank-reference">Bank Reference</Label>
                <Input
                  id="bank-reference"
                  value={bankReference}
                  onChange={(e) => setBankReference(e.target.value)}
                  placeholder="Bank statement reference"
                />
              </div>

              <div>
                <Label htmlFor="myob-reference">MYOB Reference</Label>
                <Input
                  id="myob-reference"
                  value={myobReference}
                  onChange={(e) => setMyobReference(e.target.value)}
                  placeholder="MYOB transaction ID"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="payment-notes">Payment Notes</Label>
              <Textarea
                id="payment-notes"
                placeholder="Additional notes about this payment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-amber-200">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSavePayment} 
              disabled={saving || !paymentMethod || !paymentAmount}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {saving ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
