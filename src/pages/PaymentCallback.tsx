import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Receipt, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import emblem from '@/assets/png-emblem.png';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'cancelled' | 'error'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<{
    invoiceNumber?: string;
    receiptUrl?: string;
    amountPaid?: number;
  }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const invoiceId = searchParams.get('invoice_id');
      const invoiceNumber = searchParams.get('invoice_number');
      const paymentStatus = searchParams.get('payment');

      // Handle cancellation
      if (paymentStatus === 'cancelled') {
        setStatus('cancelled');
        return;
      }

      // Handle success - verify with Stripe
      if (sessionId && paymentStatus === 'success') {
        try {
          console.log('Verifying payment for session:', sessionId);
          
          const { data, error } = await supabase.functions.invoke('stripe-webhook', {
            body: { sessionId }
          });

          console.log('Payment verification response:', data, error);

          if (error) {
            throw new Error(error.message || 'Failed to verify payment');
          }

          if (data?.success) {
            setPaymentDetails({
              invoiceNumber: data.invoiceNumber || invoiceNumber,
              receiptUrl: data.receiptUrl,
              amountPaid: data.amountPaid
            });
            setStatus('success');

            // Store in localStorage for parent window to pick up
            localStorage.setItem('payment_completed', JSON.stringify({
              invoiceNumber: data.invoiceNumber || invoiceNumber,
              receiptUrl: data.receiptUrl,
              timestamp: Date.now()
            }));

            // Notify parent window/opener if exists
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({
                type: 'PAYMENT_SUCCESS',
                invoiceNumber: data.invoiceNumber || invoiceNumber,
                receiptUrl: data.receiptUrl
              }, window.location.origin);
            }

            // Auto-close after 3 seconds if this is a popup/new tab
            setTimeout(() => {
              if (window.opener && !window.opener.closed) {
                window.close();
              }
            }, 3000);
          } else {
            setError(data?.message || 'Payment verification pending');
            setStatus('error');
          }
        } catch (err: any) {
          console.error('Payment verification error:', err);
          setError(err.message || 'Failed to verify payment');
          setStatus('error');
        }
      } else {
        setStatus('cancelled');
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleCloseWindow = () => {
    window.close();
    // If window.close() doesn't work (some browsers block it), redirect to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard?tab=invoices';
    }, 500);
  };

  const handleViewReceipt = () => {
    if (paymentDetails.receiptUrl) {
      window.open(paymentDetails.receiptUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 to-nature-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <img src={emblem} alt="CEPA" className="w-20 h-20 mx-auto mb-6" />
        
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
            <h2 className="text-xl font-semibold text-foreground">Verifying Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-700">Payment Successful!</h2>
              <p className="text-muted-foreground mt-2">
                Your payment for Invoice #{paymentDetails.invoiceNumber} has been processed.
              </p>
              {paymentDetails.amountPaid && (
                <p className="text-lg font-semibold text-foreground mt-2">
                  Amount Paid: ${paymentDetails.amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {paymentDetails.receiptUrl && (
                <Button 
                  onClick={handleViewReceipt}
                  variant="outline"
                  className="w-full"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  View Receipt
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              )}
              <Button 
                onClick={handleCloseWindow}
                className="w-full bg-gradient-to-r from-forest-600 to-nature-600"
              >
                Close & Return to Dashboard
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This window will close automatically in a few seconds...
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Your invoice has been updated and the receipt has been saved.
            </p>
          </div>
        )}

        {status === 'cancelled' && (
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-amber-700">Payment Cancelled</h2>
              <p className="text-muted-foreground mt-2">
                Your payment was cancelled. No charges were made.
              </p>
            </div>
            <Button 
              onClick={handleCloseWindow}
              variant="outline"
              className="w-full"
            >
              Close & Return to Dashboard
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-700">Verification Issue</h2>
              <p className="text-muted-foreground mt-2">
                {error || 'There was an issue verifying your payment. Please check your invoices.'}
              </p>
            </div>
            <Button 
              onClick={handleCloseWindow}
              variant="outline"
              className="w-full"
            >
              Close & Return to Dashboard
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
