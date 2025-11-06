import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFeePayments } from '@/hooks/useFeePayments';
import { CheckCircle, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FeePaymentStatusProps {
  permitApplicationId: string;
  showPaymentActions?: boolean;
  onMarkAsPaid?: () => void;
}

export function FeePaymentStatus({ 
  permitApplicationId, 
  showPaymentActions = false,
  onMarkAsPaid 
}: FeePaymentStatusProps) {
  const { feePayment, isLoading } = useFeePayments(permitApplicationId);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading payment status...</div>;
  }

  if (!feePayment) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Fees have not been calculated for this application. Please calculate fees before proceeding.
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'waived':
        return <Badge className="bg-blue-500"><CheckCircle className="w-3 h-3 mr-1" />Waived</Badge>;
      case 'partial':
        return <Badge variant="outline" className="border-orange-500 text-orange-700"><Clock className="w-3 h-3 mr-1" />Partial</Badge>;
      default:
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const outstandingBalance = feePayment.total_fee - feePayment.amount_paid;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fee Payment Status
          </span>
          {getStatusBadge(feePayment.payment_status)}
        </CardTitle>
        <CardDescription>
          Last updated {formatDistanceToNow(new Date(feePayment.updated_at), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Administration Fee</p>
            <p className="text-lg font-semibold">K{feePayment.administration_fee.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Technical Fee</p>
            <p className="text-lg font-semibold">K{feePayment.technical_fee.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Fee</p>
            <p className="text-xl font-bold">K{feePayment.total_fee.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Amount Paid</p>
            <p className="text-xl font-bold text-green-600">K{feePayment.amount_paid.toLocaleString()}</p>
          </div>
        </div>

        {outstandingBalance > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Outstanding balance: <span className="font-bold">K{outstandingBalance.toLocaleString()}</span>
            </AlertDescription>
          </Alert>
        )}

        {feePayment.payment_reference && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Payment Reference</p>
            <p className="font-mono">{feePayment.payment_reference}</p>
          </div>
        )}

        {feePayment.receipt_number && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Receipt Number</p>
            <p className="font-mono">{feePayment.receipt_number}</p>
          </div>
        )}

        {feePayment.paid_at && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Paid on {new Date(feePayment.paid_at).toLocaleDateString()}
            </p>
          </div>
        )}

        {showPaymentActions && feePayment.payment_status !== 'paid' && feePayment.payment_status !== 'waived' && (
          <div className="flex gap-2 pt-2">
            <Button onClick={onMarkAsPaid} size="sm">
              Mark as Paid
            </Button>
          </div>
        )}

        {(feePayment.payment_status === 'pending' || outstandingBalance > 0) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Assessment work cannot begin until fees are paid in full.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}