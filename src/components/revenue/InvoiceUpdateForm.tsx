
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Invoice } from './types';

interface InvoiceUpdateFormProps {
  paymentStatus: 'pending' | 'overdue' | 'paid' | 'partially_paid' | 'cancelled';
  setPaymentStatus: (status: 'pending' | 'overdue' | 'paid' | 'partially_paid' | 'cancelled') => void;
  followUpDate: string;
  setFollowUpDate: (date: string) => void;
  followUpNotes: string;
  setFollowUpNotes: (notes: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

export function InvoiceUpdateForm({
  paymentStatus,
  setPaymentStatus,
  followUpDate,
  setFollowUpDate,
  followUpNotes,
  setFollowUpNotes,
  onSave,
  onCancel,
  saving
}: InvoiceUpdateFormProps) {
  return (
    <div className="border-t border-forest-200 pt-6">
      <h3 className="text-lg font-semibold text-forest-800 mb-4">Update Invoice Status</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="payment-status">Payment Status</Label>
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partially_paid">Partially Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="follow-up-date">Follow-up Date</Label>
          <Input
            id="follow-up-date"
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6">
        <Label htmlFor="follow-up-notes">Follow-up Notes</Label>
        <Textarea
          id="follow-up-notes"
          placeholder="Add notes about payment follow-up activities..."
          value={followUpNotes}
          onChange={(e) => setFollowUpNotes(e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={onSave} 
          disabled={saving}
          className="bg-forest-600 hover:bg-forest-700"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
