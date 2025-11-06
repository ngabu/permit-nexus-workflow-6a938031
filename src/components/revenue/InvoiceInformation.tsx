
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Calendar, DollarSign, FileText, User, Building } from 'lucide-react';
import { Invoice } from './types';

interface InvoiceInformationProps {
  invoice: Invoice;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
    case 'cancelled': return 'bg-gray-100 text-gray-800';
    default: return 'bg-blue-100 text-blue-800';
  }
};

export function InvoiceInformation({ invoice }: InvoiceInformationProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label className="text-forest-700 font-medium">Invoice Number</Label>
          <p className="text-forest-800 font-semibold">{invoice.invoice_number}</p>
        </div>
        
        <div>
          <Label className="text-forest-700 font-medium">Amount</Label>
          <p className="text-forest-800 text-lg font-bold">
            {invoice.currency} {invoice.amount.toLocaleString()}
          </p>
        </div>

        <div>
          <Label className="text-forest-700 font-medium">Due Date</Label>
          <p className="text-forest-800 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {format(new Date(invoice.due_date), 'MMMM dd, yyyy')}
          </p>
        </div>

        <div>
          <Label className="text-forest-700 font-medium">Current Status</Label>
          <Badge className={`${getStatusColor(invoice.payment_status)} mt-1`}>
            {invoice.payment_status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {invoice.permit && (
          <div>
            <Label className="text-forest-700 font-medium flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Associated Permit
            </Label>
            <div className="bg-forest-50 p-3 rounded-lg mt-1">
              <p className="font-medium text-forest-800">{invoice.permit.title}</p>
              <p className="text-sm text-forest-600">
                {invoice.permit.permit_number} • {invoice.permit.permit_type}
              </p>
            </div>
          </div>
        )}

        {invoice.entity && (
          <div>
            <Label className="text-forest-700 font-medium flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Entity Information
            </Label>
            <div className="bg-forest-50 p-3 rounded-lg mt-1">
              <p className="font-medium text-forest-800">{invoice.entity.name}</p>
              <p className="text-sm text-forest-600">{invoice.entity.entity_type}</p>
            </div>
          </div>
        )}

        {invoice.assigned_officer && (
          <div>
            <Label className="text-forest-700 font-medium flex items-center">
              <User className="w-4 h-4 mr-2" />
              Assigned Officer
            </Label>
            <div className="bg-forest-50 p-3 rounded-lg mt-1">
              <p className="font-medium text-forest-800">{invoice.assigned_officer.full_name}</p>
              <p className="text-sm text-forest-600">{invoice.assigned_officer.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
