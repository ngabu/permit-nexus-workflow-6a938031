
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar, Phone } from 'lucide-react';
import { useInvoices } from './hooks/useInvoices';
import { useState } from 'react';
import { InvoiceDetailDialog } from './InvoiceDetailDialog';
import { Invoice } from './types';

export function OutstandingPaymentsCard() {
  const { invoices } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const outstandingInvoices = invoices.filter(
    invoice => invoice.payment_status === 'overdue' || invoice.payment_status === 'pending'
  ).slice(0, 5); // Show top 5 outstanding

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-forest-800 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Outstanding Payments
          </CardTitle>
          <CardDescription>Invoices requiring follow-up and collection activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {outstandingInvoices.length === 0 ? (
            <div className="text-center py-6 text-forest-600">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No outstanding payments</p>
            </div>
          ) : (
            outstandingInvoices.map((invoice) => {
              const daysOverdue = getDaysOverdue(invoice.due_date);
              const isOverdue = daysOverdue > 0;
              
              return (
                <div key={invoice.id} className={`p-3 rounded-lg border ${
                  isOverdue ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-forest-800">{invoice.invoice_number}</p>
                      <p className="text-sm text-forest-600">{invoice.entity?.name || 'Unknown Entity'}</p>
                    </div>
                    <Badge className={isOverdue ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                      {isOverdue ? `${daysOverdue} days overdue` : 'Due soon'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-bold text-forest-800">
                        {invoice.currency} {invoice.amount.toLocaleString()}
                      </span>
                      <span className="flex items-center text-forest-600">
                        <Calendar className="w-3 h-3 mr-1" />
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInvoice(invoice)}
                        className="border-forest-200 text-forest-700 hover:bg-forest-50"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Follow Up
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
