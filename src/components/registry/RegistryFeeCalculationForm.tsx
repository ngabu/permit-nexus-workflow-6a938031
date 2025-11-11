import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Calculator, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RegistryFeeCalculationFormProps {
  data: any;
  onChange: (data: any) => void;
}

export function RegistryFeeCalculationForm({ data, onChange }: RegistryFeeCalculationFormProps) {
  const { toast } = useToast();
  const [calculating, setCalculating] = useState(false);
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null);

  const handleCalculateFee = async () => {
    if (!data.activity_id) {
      toast({
        title: "Missing Information",
        description: "Please select a prescribed activity first",
        variant: "destructive"
      });
      return;
    }

    if (!data.permit_type_specific) {
      toast({
        title: "Missing Information",
        description: "Please select a permit type first",
        variant: "destructive"
      });
      return;
    }

    setCalculating(true);
    try {
      const { data: feeData, error } = await supabase.rpc('calculate_application_fee', {
        p_activity_id: data.activity_id,
        p_permit_type: data.permit_type_specific,
        p_custom_processing_days: null // Let database determine based on fee_category
      });

      if (error) throw error;

      const totalFee = feeData || 0;

      const breakdown = {
        administrationFee: Math.round(totalFee * 100) / 100,
        technicalFee: 0,
        totalFee: Math.round(totalFee * 100) / 100,
        calculationMethod: 'Official 2018 Environment Act Fees',
        activityId: data.activity_id,
        permitType: data.permit_type_specific
      };

      setFeeBreakdown(breakdown);
      onChange({
        fee_amount: breakdown.totalFee,
        fee_breakdown: breakdown
      });

      toast({
        title: "Fee Calculated",
        description: `Total fee: PGK ${breakdown.totalFee.toLocaleString()}`
      });
    } catch (error) {
      console.error('Error calculating fee:', error);
      toast({
        title: "Calculation Error",
        description: "Failed to calculate application fee",
        variant: "destructive"
      });
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (data.fee_breakdown) {
      setFeeBreakdown(data.fee_breakdown);
    }
  }, [data.fee_breakdown]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Application Fee Calculation
        </CardTitle>
        <CardDescription>
          Registry Assessment: Calculate and assign application fees
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Button 
            onClick={handleCalculateFee} 
            disabled={calculating || !data.activity_id || !data.permit_type_specific}
            className="w-full"
          >
            <Calculator className="w-4 h-4 mr-2" />
            {calculating ? 'Calculating...' : 'Calculate Application Fee'}
          </Button>

          {!data.activity_id && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <p className="text-sm text-amber-700">
                Please complete Activity Classification first
              </p>
            </div>
          )}

          {!data.permit_type_specific && data.activity_id && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <p className="text-sm text-amber-700">
                Please complete Permit-Specific Requirements first
              </p>
            </div>
          )}
        </div>

        {feeBreakdown && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium">Fee Calculation</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                  <span className="font-semibold">Application Fee</span>
                  <Badge className="text-base px-3 py-1">
                    PGK {feeBreakdown.totalFee?.toLocaleString() || '0'}
                  </Badge>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  <span className="font-medium">Calculation Method:</span> {feeBreakdown.calculationMethod}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  <span className="font-medium">Permit Type:</span> {feeBreakdown.permitType}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  <span className="font-medium">Formula:</span> (Annual Recurrent Fee ÷ 365) × Processing Days
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
