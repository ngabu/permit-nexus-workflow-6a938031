import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Receipt, Download, FileText, Loader2, Eye, Paperclip, Upload, Lock } from 'lucide-react';
import { format } from 'date-fns';

interface IntentInvoicePaymentsTabProps {
  intentId: string;
  entityId: string;
  onStatusUpdate: () => void;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  payment_status: string | null;
  due_date: string;
  paid_date: string | null;
  created_at: string;
  follow_up_notes: string | null;
  document_path: string | null;
}

export function IntentInvoicePaymentsTab({ intentId, entityId, onStatusUpdate }: IntentInvoicePaymentsTabProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Check if user can edit this tab (only revenue staff)
  const canEdit = profile?.staff_unit === 'revenue' || 
                  profile?.user_type === 'admin' || 
                  profile?.user_type === 'super_admin';

  useEffect(() => {
    fetchInvoices();
  }, [intentId, entityId]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({ title: 'Error', description: 'Failed to load invoices', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationChange = async (invoiceId: string, verified: boolean) => {
    if (!canEdit) {
      toast({ title: 'Error', description: 'You do not have permission to edit this section', variant: 'destructive' });
      return;
    }

    setUpdatingId(invoiceId);
    try {
      const updateData: Record<string, any> = {
        payment_status: verified ? 'paid' : 'pending',
        status: verified ? 'paid' : 'pending',
      };

      if (verified) {
        updateData.paid_date = new Date().toISOString();
      } else {
        updateData.paid_date = null;
      }

      const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId);

      if (error) throw error;

      toast({ 
        title: 'Success', 
        description: verified ? 'Invoice marked as paid' : 'Invoice marked as pending' 
      });
      fetchInvoices();
      onStatusUpdate();
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({ title: 'Error', description: 'Failed to update invoice status', variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewInvoice = async (documentPath: string | null) => {
    if (!documentPath) {
      toast({ title: 'Info', description: 'No document attached to this invoice' });
      return;
    }
    
    try {
      const { data } = supabase.storage.from('documents').getPublicUrl(documentPath);
      window.open(data.publicUrl, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
      toast({ title: 'Error', description: 'Failed to view document', variant: 'destructive' });
    }
  };

  const handleUploadDocument = async (invoiceId: string, file: File) => {
    if (!canEdit) {
      toast({ title: 'Error', description: 'You do not have permission to upload documents', variant: 'destructive' });
      return;
    }

    setUploadingId(invoiceId);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `invoices/${invoiceId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('invoices')
        .update({ document_path: filePath })
        .eq('id', invoiceId);

      if (updateError) throw updateError;

      toast({ title: 'Success', description: 'Invoice document uploaded successfully' });
      fetchInvoices();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({ title: 'Error', description: 'Failed to upload document', variant: 'destructive' });
    } finally {
      setUploadingId(null);
    }
  };

  const handleDownloadInvoice = async (documentPath: string | null, invoiceNumber: string) => {
    if (!documentPath) {
      toast({ title: 'Info', description: 'No document attached to this invoice' });
      return;
    }
    
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(documentPath);

      if (error) {
        toast({ title: 'Info', description: 'Invoice document not available for download', variant: 'default' });
        return;
      }

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${invoiceNumber}.${documentPath.split('.').pop()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: 'Success', description: 'Invoice downloaded successfully' });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({ title: 'Error', description: 'Failed to download invoice', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string, paymentStatus: string | null) => {
    const effectiveStatus = paymentStatus || status;
    switch (effectiveStatus) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Overdue</Badge>;
      default:
        return <Badge variant="outline">{effectiveStatus}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading invoices...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-emerald-500/10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="w-5 h-5 text-emerald-600" />
          Invoice & Payments
          {!canEdit && <Lock className="w-4 h-4 text-muted-foreground ml-auto" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {!canEdit && (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              This section is read-only. Only Revenue staff can edit this tab.
            </AlertDescription>
          </Alert>
        )}

        {invoices.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-muted/20">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No invoices found for this intent registration</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Document</TableHead>
                <TableHead className="text-center">Accounts Verification</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const isPaid = invoice.payment_status === 'paid' || invoice.status === 'paid';
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>{format(new Date(invoice.created_at), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {invoice.follow_up_notes || 'Intent Registration Fee'}
                    </TableCell>
                    <TableCell>{invoice.currency} {invoice.amount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status, invoice.payment_status)}</TableCell>
                    <TableCell>
                      {invoice.document_path ? (
                        <div className="flex items-center gap-1">
                          <Paperclip className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-muted-foreground">Attached</span>
                        </div>
                      ) : canEdit ? (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadDocument(invoice.id, file);
                            }}
                            disabled={uploadingId === invoice.id}
                          />
                          <div className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                            {uploadingId === invoice.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span className="text-xs">Upload</span>
                          </div>
                        </label>
                      ) : (
                        <span className="text-xs text-muted-foreground">No document</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isPaid}
                        disabled={updatingId === invoice.id || !canEdit}
                        onCheckedChange={(checked) => handleVerificationChange(invoice.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice.document_path)}
                          title="View Invoice"
                          disabled={!invoice.document_path}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.document_path, invoice.invoice_number)}
                          title="Download Invoice"
                          disabled={!invoice.document_path}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Remarks Section */}
        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any remarks about invoices and payments for this intent registration..."
            rows={3}
            disabled={!canEdit}
            className={!canEdit ? 'bg-muted cursor-not-allowed' : ''}
          />
        </div>
      </CardContent>
    </Card>
  );
}