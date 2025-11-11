
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Invoice } from './types';
import { useInvoices } from './hooks/useInvoices';
import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InvoiceInformation } from './InvoiceInformation';
import { InvoiceUpdateForm } from './InvoiceUpdateForm';

interface InvoiceDetailDialogProps {
  invoice: Invoice;
  open: boolean;
  onClose: () => void;
}

export function InvoiceDetailDialog({ invoice, open, onClose }: InvoiceDetailDialogProps) {
  const { updateInvoice } = useInvoices();
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'overdue' | 'paid' | 'partially_paid' | 'cancelled'>(
    (invoice.payment_status as 'pending' | 'overdue' | 'paid' | 'partially_paid' | 'cancelled') || 'pending'
  );
  const [followUpDate, setFollowUpDate] = useState(invoice.follow_up_date || '');
  const [followUpNotes, setFollowUpNotes] = useState(invoice.follow_up_notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Partial<Invoice> = {
        payment_status: paymentStatus,
        follow_up_date: followUpDate || undefined,
        follow_up_notes: followUpNotes || undefined,
        updated_at: new Date().toISOString()
      };

      const result = await updateInvoice(invoice.id, updates);
      
      if (result.success) {
        toast({
          title: "Invoice Updated",
          description: "Invoice details have been successfully updated.",
        });
        onClose();
      } else {
        throw new Error('Failed to update invoice');
      }
    } catch (error) {
      toast({
        title: "Update Failed", 
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-forest-800 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Invoice Details - {invoice.invoice_number}
          </DialogTitle>
          <DialogDescription>
            Manage invoice payment status and follow-up activities
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <InvoiceInformation invoice={invoice} />
          
          <InvoiceUpdateForm
            paymentStatus={paymentStatus}
            setPaymentStatus={setPaymentStatus}
            followUpDate={followUpDate}
            setFollowUpDate={setFollowUpDate}
            followUpNotes={followUpNotes}
            setFollowUpNotes={setFollowUpNotes}
            onSave={handleSave}
            onCancel={onClose}
            saving={saving}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
