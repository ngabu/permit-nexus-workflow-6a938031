import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Printer, CreditCard, Loader2, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from '@/hooks/useInvoices';
import { format } from 'date-fns';
import emblem from '@/assets/png-emblem.png';

interface InvoiceDetailProps {
  invoice: Invoice;
  onBack: () => void;
  onPayment: () => void;
}

export function InvoiceDetailView({ invoice, onBack, onPayment }: InvoiceDetailProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Download functionality would be implemented here
    console.log('Download invoice');
  };

  const balanceDue = invoice.status === 'paid' || invoice.payment_status === 'paid' ? 0 : invoice.amount;
  const paidToDate = invoice.status === 'paid' || invoice.payment_status === 'paid' ? invoice.amount : 0;
  const receiptUrl = invoice.stripe_receipt_url || invoice.cepa_receipt_path;
  const invoiceStatus = invoice.payment_status || invoice.status;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'unpaid': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleStripePayment = async () => {
    if (balanceDue <= 0) {
      toast({
        title: "No Payment Required",
        description: "This invoice has already been paid.",
        variant: "default"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const currentUrl = window.location.origin;
      
      console.log('Initiating Stripe checkout for invoice:', invoice.invoice_number);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoice_number,
          invoiceDate: invoice.created_at ? format(new Date(invoice.created_at), 'dd/MM/yyyy') : '',
          currency: 'usd', // Using USD as Stripe doesn't support PGK
          clientName: invoice.entity?.name || 'Unknown',
          clientAddress: '',
          items: [{
            quantity: 1,
            itemCode: invoice.item_code || 'FEE',
            description: invoice.item_description || getInvoiceDescription(),
            unitPrice: invoice.amount,
            disc: 0,
            totalPrice: invoice.amount
          }],
          subtotal: invoice.amount,
          freight: 0,
          gst: 0,
          totalInc: invoice.amount,
          paidToDate: paidToDate,
          balanceDue: balanceDue,
          successUrl: `${currentUrl}/payment-callback?payment=success`,
          cancelUrl: `${currentUrl}/payment-callback?payment=cancelled`
        }
      });

      console.log('Checkout session response:', { data, error });

      if (error) {
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        // Open Stripe checkout in a new tab to avoid iframe restrictions
        window.open(data.url, '_blank');
        setIsProcessing(false);
        toast({
          title: "Checkout Opened",
          description: "Stripe checkout has opened in a new tab. Complete your payment there.",
        });
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const getInvoiceDescription = () => {
    if (invoice.invoice_type === 'inspection_fee') return 'Inspection Fee';
    if (invoice.invoice_type === 'intent_fee') return 'Intent Registration Fee';
    if (invoice.invoice_type === 'permit_fee') return 'Permit Fee';
    if (invoice.inspection) return `Inspection Fee - ${invoice.inspection.inspection_type}`;
    if (invoice.intent_registration) return 'Intent Registration Fee';
    if (invoice.permit) return `Permit Fee - ${invoice.permit.permit_type}`;
    return 'Fee';
  };

  const getReference = () => {
    if (invoice.permit?.permit_number) return invoice.permit.permit_number;
    if (invoice.inspection?.inspection_type) return invoice.inspection.inspection_type;
    if (invoice.intent_registration?.activity_description) {
      return invoice.intent_registration.activity_description.substring(0, 50);
    }
    return '-';
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          {invoiceStatus !== 'paid' && balanceDue > 0 && (
            <Button 
              onClick={handleStripePayment} 
              className="bg-gradient-to-r from-forest-600 to-nature-600"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              {isProcessing ? 'Processing...' : 'Online Payment'}
            </Button>
          )}
          {invoiceStatus === 'paid' && receiptUrl && (
            <Button 
              onClick={() => window.open(receiptUrl, '_blank')}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <Receipt className="w-4 h-4 mr-2" />
              View Receipt
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Document */}
      <Card className="p-8 bg-white">
        {/* Header - Emblem Left, CEPA Info Middle, Invoice Details Right */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-border">
          {/* Left - Emblem */}
          <div className="flex-shrink-0">
            <img src={emblem} alt="CEPA Emblem" className="w-20 h-20 object-contain" />
          </div>
          
          {/* Middle - Authority Info */}
          <div className="flex-1 px-6">
            <h1 className="text-lg font-bold text-foreground">
              Conservation & Environment Protection Authority
            </h1>
            <div className="text-sm text-muted-foreground mt-2 space-y-0.5">
              <p>Tower 1, Dynasty Twin Tower</p>
              <p>Savannah Heights, Waigani</p>
              <p>P.O. Box 6601/BOROKO, NCD</p>
              <p>Papua New Guinea</p>
            </div>
          </div>
          
          {/* Right - Invoice Details */}
          <div className="text-right">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="font-semibold text-muted-foreground text-right">Invoice:</span>
              <span className="text-red-600 font-semibold">{invoice.invoice_number}</span>
              
              <span className="font-semibold text-muted-foreground text-right">Date:</span>
              <span className="font-semibold">
                {invoice.created_at ? format(new Date(invoice.created_at), 'dd/MM/yyyy') : '-'}
              </span>
              
              <span className="font-semibold text-muted-foreground text-right">Your Ref:</span>
              <span className="font-semibold">{getReference()}</span>
              
              <span className="font-semibold text-muted-foreground text-right">Contact:</span>
              <span className="font-semibold">Kavau Diagoro, Manager Revenue</span>
              
              <span className="font-semibold text-muted-foreground text-right">Telephone:</span>
              <span className="font-semibold">(675) 3014665/3014614</span>
              
              <span className="font-semibold text-muted-foreground text-right">Email:</span>
              <span className="font-semibold text-green-600">revenuemanager@cepa.gov.pg</span>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="mb-6 p-4 border border-border">
          <div className="font-semibold text-foreground mb-2">Client:</div>
          <div className="text-sm">
            <p className="font-semibold text-foreground">{invoice.entity?.name || 'Unknown'}</p>
            <p className="text-muted-foreground">{invoice.entity?.entity_type || ''}</p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-2 text-left text-sm font-semibold">QUANTITY</th>
                <th className="border border-border p-2 text-left text-sm font-semibold">ITEM CODE</th>
                <th className="border border-border p-2 text-left text-sm font-semibold">DESCRIPTION</th>
                <th className="border border-border p-2 text-right text-sm font-semibold">UNIT PRICE</th>
                <th className="border border-border p-2 text-right text-sm font-semibold">TOTAL PRICE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-2 text-center">1</td>
                <td className="border border-border p-2">{invoice.item_code || 'FEE'}</td>
                <td className="border border-border p-2">{invoice.item_description || getInvoiceDescription()}</td>
                <td className="border border-border p-2 text-right">
                  K{invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="border border-border p-2 text-right">
                  K{invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              {/* Empty rows for spacing */}
              {Array(4).fill(0).map((_, index) => (
                <tr key={`empty-${index}`}>
                  <td className="border border-border p-2 h-12">&nbsp;</td>
                  <td className="border border-border p-2">&nbsp;</td>
                  <td className="border border-border p-2">&nbsp;</td>
                  <td className="border border-border p-2">&nbsp;</td>
                  <td className="border border-border p-2">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mt-4">
            <div className="w-96 space-y-2">
              <div className="flex justify-between border border-border p-2 bg-muted/30">
                <span className="font-bold">Total:</span>
                <span className="font-bold">K{invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border border-border p-2">
                <span className="font-semibold">Paid to Date:</span>
                <span>K{paidToDate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border border-border p-2 bg-muted/50">
                <span className="font-bold text-lg">Balance Due:</span>
                <span className="font-bold text-lg">K{balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="mb-8">
          <div className="font-bold text-foreground mb-2">PAYMENT TERMS:</div>
          <div className="text-sm text-muted-foreground ml-8">
            All payments must be processed via the CEPA e-Permit Portal through the respective client's dashboard.
          </div>
        </div>

        {/* Page Number */}
        <div className="text-right text-sm text-muted-foreground">
          Page 1 of 1
        </div>
      </Card>
    </div>
  );
}
