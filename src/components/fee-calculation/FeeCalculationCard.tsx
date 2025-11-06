
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, FileText, Clock } from 'lucide-react';
import { CalculatedFees } from '@/hooks/useFeeCalculation';

interface FeeCalculationCardProps {
  fees: CalculatedFees | null;
  activityType?: string;
  permitType?: string;
  feeCategory?: string;
  loading?: boolean;
  error?: string;
}

export const FeeCalculationCard: React.FC<FeeCalculationCardProps> = ({
  fees,
  activityType,
  permitType,
  feeCategory,
  loading = false,
  error,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Fee Calculation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-pulse">Calculating fees...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-destructive" />
            Fee Calculation Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-destructive font-medium mb-2">Error Calculating Fees</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!fees) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Fee Calculation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            {activityType && permitType 
              ? 'Unable to calculate fees for selected options. Please verify your activity type and permit level combination.'
              : 'Select activity type and permit type to calculate fees'
            }
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-PG', {
      style: 'currency',
      currency: 'PGK',
      minimumFractionDigits: 2,
    }).format(amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Fee Calculation Summary
        </CardTitle>
        <div className="flex gap-2">
          {feeCategory && (
            <Badge variant="secondary" className="w-fit">
              {feeCategory}
            </Badge>
          )}
          {fees.source && (
            <Badge variant={fees.source === 'official' ? 'default' : 'outline'} className="w-fit">
              {fees.source === 'official' ? 'Official' : 'Estimated'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Administration Fee</div>
            <div className="text-lg font-semibold">{formatCurrency(fees.administrationFee)}</div>
            <div className="text-xs text-muted-foreground">Form: {fees.administrationForm || 'TBD'}</div>
          </div>
          
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Technical Fee</div>
            <div className="text-lg font-semibold">{formatCurrency(fees.technicalFee)}</div>
            <div className="text-xs text-muted-foreground">Form: {fees.technicalForm || 'TBD'}</div>
          </div>
        </div>

        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total Fee</div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(fees.totalFee)}</div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                Processing Time
              </div>
              <div className="font-semibold">{fees.processingDays} days</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Required Forms:</span>
          </div>
          <div className="pl-6 space-y-1">
            <div className="text-sm">• {fees.administrationForm || 'TBD'} (Administration)</div>
            <div className="text-sm">• {fees.technicalForm || 'TBD'} (Technical)</div>
          </div>
        </div>

        {fees.isEstimated && (
          <div className="text-xs text-muted-foreground p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <strong>⚠️ Estimated Fees:</strong> These fees are estimated based on similar activities. Official fees will be calculated during processing and may differ from these estimates.
          </div>
        )}
        
        <div className="text-xs text-muted-foreground p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <strong>Note:</strong> All fees must be paid before CEPA undertakes the required assessment work.
        </div>
      </CardContent>
    </Card>
  );
};
