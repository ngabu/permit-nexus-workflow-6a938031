import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInvoices } from './hooks/useInvoices';
import { InvoiceDetailDialog } from './InvoiceDetailDialog';
import { useState } from 'react';
import { Invoice } from './types';
import { Eye, Calendar, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export function InvoicesList() {
  const { invoices, loading } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-forest-800 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Invoice Management
          </CardTitle>
          <CardDescription>Track and manage invoice payments and follow-ups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-forest-600">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No invoices found</p>
              </div>
            ) : (
              invoices.map((invoice) => (
                <div key={invoice.id} className="p-4 border border-forest-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-forest-800">{invoice.invoice_number}</h3>
                      <p className="text-sm text-forest-600">
                        {invoice.permit?.title || 'No permit associated'}
                      </p>
                      {invoice.entity && (
                        <p className="text-xs text-forest-500">
                          {invoice.entity.name} ({invoice.entity.entity_type})
                        </p>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(invoice.payment_status)} flex items-center gap-1`}>
                      {getStatusIcon(invoice.payment_status)}
                      {invoice.payment_status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                    <div>
                      <span className="font-medium text-forest-700">Amount:</span>
                      <p className="text-forest-600">{invoice.currency} {invoice.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-forest-700">Due Date:</span>
                      <p className="text-forest-600">{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-forest-700">Assigned Officer:</span>
                      <p className="text-forest-600">{invoice.assigned_officer?.full_name || 'Unassigned'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-forest-700">Created:</span>
                      <p className="text-forest-600">{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInvoice(invoice)}
                      className="border-forest-200 text-forest-700 hover:bg-forest-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedInvoice && (
        <InvoiceDetailDialog
          invoice={selectedInvoice}
          open={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </>
  );
}
