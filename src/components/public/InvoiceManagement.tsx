
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Calendar, DollarSign, FileText, ChevronsUpDown, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string;
  paid_date?: string;
  created_at: string;
  permit_applications?: {
    title: string;
    permit_number?: string;
  };
  permit_activities?: {
    activity_type: string;
  };
}

export function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchInvoices = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          permit_activities (
            activity_type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include permit_applications info
      const transformedData = await Promise.all((data || []).map(async (invoice: any) => {
        let permitInfo = null;
        if (invoice.permit_id) {
          const { data: permitData } = await (supabase as any)
            .from('permit_applications')
            .select('title, permit_number')
            .eq('id', invoice.permit_id)
            .single();
          permitInfo = permitData;
        }
        return {
          ...invoice,
          permit_applications: permitInfo
        };
      }));

      setInvoices(transformedData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handlePayment = async (invoiceId: string) => {
    // This would integrate with a payment gateway
    // For now, we'll just show a placeholder message
    toast({
      title: "Payment Gateway",
      description: "Payment functionality will be integrated with your preferred payment provider",
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading invoices...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-forest-800">Invoice Management</h2>
          <p className="text-forest-600 font-semibold">View and pay your permit-related fees</p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <Card className="border-forest-200">
          <CardContent className="py-12 text-center">
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-forest-400" />
            <h3 className="text-lg font-semibold mb-2 text-forest-800">No Invoices Found</h3>
            <p className="text-forest-600">Invoices will appear here when permit fees are generated</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Permit/Activity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedInvoice(selectedInvoice?.id === invoice.id ? null : invoice)}
                  >
                    <TableCell>
                      {selectedInvoice?.id === invoice.id ? (
                        <ChevronDown className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronsUpDown className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">#{invoice.invoice_number}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{invoice.permit_applications?.title || 'General Fee'}</div>
                        {invoice.permit_activities && (
                          <div className="text-sm text-muted-foreground">
                            {invoice.permit_activities.activity_type.replace('_', ' ')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {invoice.currency} {invoice.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {invoice.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayment(invoice.id);
                          }}
                          className="bg-gradient-to-r from-forest-600 to-nature-600 hover:from-forest-700 hover:to-nature-700"
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Pay Now
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {selectedInvoice && (
            <Card className="border-forest-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Invoice Details - #{selectedInvoice.invoice_number}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Invoice Number</label>
                      <p className="text-sm font-medium">#{selectedInvoice.invoice_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Related Permit</label>
                      <p className="text-sm">{selectedInvoice.permit_applications?.title || 'General Fee'}</p>
                    </div>
                    {selectedInvoice.permit_activities && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Activity</label>
                        <p className="text-sm">{selectedInvoice.permit_activities.activity_type.replace('_', ' ')}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Badge className={getStatusColor(selectedInvoice.status)}>
                        {selectedInvoice.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Amount</label>
                      <p className="text-2xl font-bold text-forest-800">
                        {selectedInvoice.currency} {selectedInvoice.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Issue Date</label>
                      <p className="text-sm">{new Date(selectedInvoice.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                      <p className="text-sm">{new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                    </div>
                    {selectedInvoice.paid_date && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Paid Date</label>
                        <p className="text-sm">{new Date(selectedInvoice.paid_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
