import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useFeeCalculation, FeeCalculationParams } from '@/hooks/useFeeCalculation';
import { useToast } from '@/hooks/use-toast';

interface ComplianceFeeCalculatorProps {
  permitApplication: {
    id: string;
    title: string;
    activity_classification: string;
    activity_level: string;
    permit_type: string;
    activity_type?: string;
    estimated_cost_kina?: number | null;
    land_area?: number | null;
    permit_period?: string | null;
    ods_details?: any;
    waste_contaminant_details?: any;
    fee_amount?: number | null;
  };
  onFeeCalculated?: (fees: any) => void;
}

export function ComplianceFeeCalculator({ permitApplication, onFeeCalculated }: ComplianceFeeCalculatorProps) {
  const { calculateFeesWithSupabase, loading } = useFeeCalculation();
  const [calculatedFees, setCalculatedFees] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const buildFeeCalculationParams = (): FeeCalculationParams => {
    console.log('Building fee calculation params from permit application:', permitApplication);
    
    // Extract activity category and subcategory from activity_classification
    const activityParts = permitApplication.activity_classification?.split(' - ') || [];
    const activityType = permitApplication.activity_type || 'new';
    const activitySubCategory = activityParts[1] || permitApplication.activity_classification || 'general';
    
    // Convert permit period to years if available
    let durationYears = undefined;
    if (permitApplication.permit_period) {
      const periodMatch = permitApplication.permit_period.match(/(\d+)/);
      durationYears = periodMatch ? parseInt(periodMatch[1]) : undefined;
    }
    
    // Use actual values only - no defaults
    const projectCost = permitApplication.estimated_cost_kina && permitApplication.estimated_cost_kina > 0 
      ? permitApplication.estimated_cost_kina 
      : undefined;
    
    const landArea = permitApplication.land_area && permitApplication.land_area > 0 
      ? permitApplication.land_area 
      : undefined;
    
    // Check if ODS details contain actual data
    const odsDetails = permitApplication.ods_details && 
      Object.keys(permitApplication.ods_details).length > 0 &&
      Object.values(permitApplication.ods_details).some(val => val !== null && val !== '' && val !== 0)
      ? permitApplication.ods_details 
      : undefined;
    
    // Check if waste details contain actual data  
    const wasteDetails = permitApplication.waste_contaminant_details &&
      Object.keys(permitApplication.waste_contaminant_details).length > 0 &&
      Object.values(permitApplication.waste_contaminant_details).some(val => val !== null && val !== '' && val !== 0)
      ? permitApplication.waste_contaminant_details 
      : undefined;
    
    const params = {
      activityType: activityType,
      activitySubCategory: activitySubCategory,
      permitType: permitApplication.permit_type,
      activityLevel: permitApplication.activity_level,
      projectCost: projectCost,
      landArea: landArea,
      durationYears: durationYears,
      odsDetails: odsDetails,
      wasteDetails: wasteDetails
    };
    
    console.log('Built fee calculation parameters (no artificial defaults):', params);
    return params;
  };

  const calculateFees = async () => {
    setCalculating(true);
    setError('');
    
    try {
      const params = buildFeeCalculationParams();
      console.log('Calculating fees with parameters:', params);
      
      const fees = await calculateFeesWithSupabase(params);
      console.log('Calculated fees result:', fees);
      
      if (fees) {
        setCalculatedFees(fees);
        if (onFeeCalculated) {
          onFeeCalculated(fees);
        }
        toast({
          title: "Fees Calculated Successfully",
          description: `Total fee: K${fees.totalFee.toLocaleString()}`,
        });
      } else {
        setError('Unable to calculate fees with current parameters');
      }
    } catch (error: any) {
      console.error('Fee calculation error:', error);
      setError(error.message || 'Failed to calculate fees');
      toast({
        title: "Fee Calculation Error",
        description: error.message || 'Failed to calculate fees',
        variant: "destructive"
      });
    } finally {
      setCalculating(false);
    }
  };

  // Auto-calculate on component mount
  useEffect(() => {
    calculateFees();
  }, [permitApplication.id]);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-PG', {
      style: 'currency',
      currency: 'PGK',
      minimumFractionDigits: 2,
    }).format(amount);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Fee Calculation & Invoice
          </CardTitle>
          <Button
            onClick={calculateFees}
            disabled={calculating}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${calculating ? 'animate-spin' : ''}`} />
            Recalculate
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Calculation Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Activity:</span>
            <div className="font-medium">{permitApplication.activity_classification}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Level:</span>
            <div className="font-medium">{permitApplication.activity_level}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Permit Type:</span>
            <div className="font-medium">{permitApplication.permit_type}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Type:</span>
            <div className="font-medium">{permitApplication.activity_type || 'new'}</div>
          </div>
        </div>

        {/* Additional Parameters */}
        {(permitApplication.estimated_cost_kina || permitApplication.land_area || permitApplication.permit_period) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm p-3 bg-muted/30 rounded-lg">
            <div className="text-muted-foreground">Additional Parameters:</div>
            {permitApplication.estimated_cost_kina && (
              <div>Project Cost: K{permitApplication.estimated_cost_kina.toLocaleString()}</div>
            )}
            {permitApplication.land_area && (
              <div>Land Area: {permitApplication.land_area} sqm</div>
            )}
            {permitApplication.permit_period && (
              <div>Duration: {permitApplication.permit_period} years</div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {calculating && (
          <div className="text-center py-4">
            <div className="animate-pulse">Calculating fees based on current parameters...</div>
          </div>
        )}

        {/* Fee Results */}
        {calculatedFees && !calculating && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="font-medium">Fee Calculation Complete</span>
              <Badge variant={calculatedFees.source === 'official' ? 'default' : 'outline'}>
                {calculatedFees.source === 'official' ? 'Official' : 'Estimated'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Administration Fee</div>
                <div className="text-lg font-semibold">{formatCurrency(calculatedFees.administrationFee)}</div>
                <div className="text-xs text-muted-foreground">Form: {calculatedFees.administrationForm}</div>
              </div>
              
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Technical Fee</div>
                <div className="text-lg font-semibold">{formatCurrency(calculatedFees.technicalFee)}</div>
                <div className="text-xs text-muted-foreground">Form: {calculatedFees.technicalForm}</div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Total Fee</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(calculatedFees.totalFee)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Processing Days</div>
                  <div className="font-semibold">{calculatedFees.processingDays} days</div>
                </div>
              </div>
            </div>

            {calculatedFees.isEstimated && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  These are estimated fees based on similar activities. Official fees may differ during final processing.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Existing Fee Display (for comparison) */}
        {permitApplication.fee_amount && (
          <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <div className="text-sm font-medium text-warning-foreground">Previously Calculated Fee</div>
            <div className="text-lg font-semibold text-warning-foreground">
              {formatCurrency(permitApplication.fee_amount)}
            </div>
            {calculatedFees && Math.abs(calculatedFees.totalFee - permitApplication.fee_amount) > 0.01 && (
              <div className="text-xs text-muted-foreground mt-1">
                Difference from new calculation: {formatCurrency(Math.abs(calculatedFees.totalFee - permitApplication.fee_amount))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
