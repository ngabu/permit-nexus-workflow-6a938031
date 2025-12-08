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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertTriangle, Search, Upload, FileText, Calendar, Eye, Shield, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export function PaymentVerification() {
  const { invoices, loading, refetch } = useInvoices();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  
  // Verification form state
  const [verificationNotes, setVerificationNotes] = useState('');
  const [cepaReceiptFile, setCepaReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Filter only PAID invoices for verification
  const paidInvoices = invoices.filter(inv => inv.status === 'paid' || inv.payment_status === 'paid');

  const filteredInvoices = paidInvoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.entity?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerification = verificationFilter === 'all' || 
      (invoice as any).verification_status === verificationFilter;
    return matchesSearch && matchesVerification;
  });

  const pendingVerification = paidInvoices.filter(inv => 
    !(inv as any).verification_status || (inv as any).verification_status === 'pending'
  );

  const handleVerifyPayment = async (status: 'verified' | 'rejected') => {
    if (!selectedInvoice || !user) return;
    
    try {
      setUploading(true);
      let cepaReceiptPath = null;

      // Upload CEPA receipt if provided
      if (cepaReceiptFile) {
        const fileExt = cepaReceiptFile.name.split('.').pop();
        const fileName = `cepa_receipt_${selectedInvoice.id}_${Date.now()}.${fileExt}`;
        const filePath = `invoices/cepa-receipts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, cepaReceiptFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: 'Upload Error',
            description: 'Failed to upload CEPA receipt',
            variant: 'destructive'
          });
          return;
        }
        cepaReceiptPath = filePath;
      }

      // Update invoice verification status
      const updateData: any = {
        verification_status: status,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        verification_notes: verificationNotes,
        updated_at: new Date().toISOString()
      };

      if (cepaReceiptPath) {
        updateData.cepa_receipt_path = cepaReceiptPath;
      }

      const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', selectedInvoice.id);

      if (error) throw error;

      toast({
        title: status === 'verified' ? 'Payment Verified' : 'Payment Rejected',
        description: status === 'verified' 
          ? 'Payment has been verified successfully' 
          : 'Payment verification has been rejected',
      });

      // Reset form
      setVerifyDialogOpen(false);
      setSelectedInvoice(null);
      setVerificationNotes('');
      setCepaReceiptFile(null);
      refetch();
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update verification status',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleViewReceipt = async (receiptPath: string | null, receiptUrl: string | null) => {
    if (receiptUrl) {
      window.open(receiptUrl, '_blank');
      return;
    }

    if (receiptPath) {
      const { data } = await supabase.storage
        .from('documents')
        .getPublicUrl(receiptPath);
      
      if (data?.publicUrl) {
        window.open(data.publicUrl, '_blank');
      }
    }
  };

  const getVerificationColor = (status: string | null | undefined) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending': 
      default: return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
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
                  <p className="text-sm font-medium text-muted-foreground">Pending Verification</p>
                  <p className="text-2xl font-bold text-foreground">{pendingVerification.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Paid Invoices</p>
                  <p className="text-2xl font-bold text-foreground">{paidInvoices.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verified Today</p>
                  <p className="text-2xl font-bold text-foreground">
                    {paidInvoices.filter(inv => 
                      (inv as any).verified_at && 
                      new Date((inv as any).verified_at).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Payment Verification
            </CardTitle>
            <CardDescription>Verify paid invoices with CEPA accounts confirmation</CardDescription>
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
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Verification</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Paid Invoices Table */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-muted rounded-lg h-16"></div>
                ))}
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No paid invoices found</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice Number</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid Date</TableHead>
                      <TableHead>Stripe Receipt</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.entity?.name || 'N/A'}</TableCell>
                        <TableCell className="font-semibold">K{invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          {invoice.paid_date 
                            ? format(new Date(invoice.paid_date), 'MMM dd, yyyy')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {(invoice as any).stripe_receipt_url || invoice.document_path ? (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleViewReceipt(
                                invoice.document_path || null, 
                                (invoice as any).stripe_receipt_url || null
                              )}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">No receipt</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getVerificationColor((invoice as any).verification_status)}>
                            {(invoice as any).verification_status || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(invoice as any).cepa_receipt_path && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleViewReceipt((invoice as any).cepa_receipt_path, null)}
                                title="View CEPA Receipt"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setVerifyDialogOpen(true);
                              }}
                              disabled={(invoice as any).verification_status === 'verified'}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Verify
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verification Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
            <DialogDescription>
              Verify payment for invoice {selectedInvoice?.invoice_number} with CEPA Accounts confirmation
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
                    <p className="text-lg font-bold text-foreground">K{selectedInvoice?.amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Payment Date</p>
                    <p className="text-foreground">
                      {selectedInvoice?.paid_date 
                        ? format(new Date(selectedInvoice.paid_date), 'MMM dd, yyyy HH:mm')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Stripe Receipt</p>
                    {(selectedInvoice as any)?.stripe_receipt_url || selectedInvoice?.document_path ? (
                      <Button 
                        size="sm" 
                        variant="link" 
                        className="p-0 h-auto"
                        onClick={() => handleViewReceipt(
                          selectedInvoice?.document_path || null,
                          (selectedInvoice as any)?.stripe_receipt_url || null
                        )}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Receipt
                      </Button>
                    ) : (
                      <p className="text-muted-foreground">No receipt available</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CEPA Receipt Upload */}
            <div className="space-y-2">
              <Label htmlFor="cepaReceiptFile">CEPA Accounts Confirmation Receipt</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cepaReceiptFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCepaReceiptFile(e.target.files?.[0] || null)}
                />
                <Upload className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Upload transaction receipt from CEPA Accounts (PDF, JPG, PNG)</p>
            </div>

            {/* Verification Notes */}
            <div className="space-y-2">
              <Label htmlFor="verificationNotes">Verification Notes</Label>
              <Textarea
                id="verificationNotes"
                placeholder="Add verification notes, transaction reference, or remarks..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleVerifyPayment('rejected')}
              disabled={uploading}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button 
              onClick={() => handleVerifyPayment('verified')}
              disabled={uploading}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {uploading ? 'Verifying...' : 'Verify Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
