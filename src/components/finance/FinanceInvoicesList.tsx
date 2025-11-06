
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Invoice } from '../revenue/types';
import { useInvoices } from '../revenue/hooks/useInvoices';
import { PaymentRecordDialog } from './PaymentRecordDialog';
import { Eye, DollarSign, Calendar, Building2, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function FinanceInvoicesList() {
  const { invoices, loading } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-800">Invoice Payment Processing</CardTitle>
          <CardDescription>Loading invoice data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-20"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-800 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Invoice Payment Processing
          </CardTitle>
          <CardDescription>Record payments and manage financial transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-amber-600">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No invoices found</p>
              </div>
            ) : (
              invoices.map((invoice) => (
                <div key={invoice.id} className="p-4 border border-amber-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-amber-800">{invoice.invoice_number}</h3>
                      <p className="text-sm text-amber-600">
                        {invoice.permit?.title || 'No permit associated'}
                      </p>
                      {invoice.entity && (
                        <p className="text-xs text-amber-500 flex items-center mt-1">
                          <Building2 className="w-3 h-3 mr-1" />
                          {invoice.entity.name} ({invoice.entity.entity_type})
                        </p>
                      )}
                    </div>
                    <Badge className={`${getPaymentStatusColor(invoice.payment_status)} flex items-center gap-1`}>
                      {getPaymentStatusIcon(invoice.payment_status)}
                      {invoice.payment_status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                    <div>
                      <span className="font-medium text-amber-700">Amount:</span>
                      <p className="text-amber-800 font-bold">{invoice.currency} {invoice.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-amber-700">Due Date:</span>
                      <p className="text-amber-600 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-amber-700">Payment Date:</span>
                      <p className="text-amber-600">
                        {invoice.paid_date ? format(new Date(invoice.paid_date), 'MMM dd, yyyy') : 'Not paid'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-amber-700">Created:</span>
                      <p className="text-amber-600">{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInvoice(invoice)}
                      className="border-amber-200 text-amber-700 hover:bg-amber-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {invoice.payment_status !== 'paid' && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedInvoice(invoice)}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Record Payment
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedInvoice && (
        <PaymentRecordDialog
          invoice={selectedInvoice}
          open={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </>
  );
}
