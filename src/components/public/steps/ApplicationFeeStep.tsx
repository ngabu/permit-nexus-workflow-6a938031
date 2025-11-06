
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FeeCalculationCard } from '@/components/fee-calculation/FeeCalculationCard';
import { useFeeCalculation, FeeCalculationParams } from '@/hooks/useFeeCalculation';
import { useEffect, useState, useRef } from 'react';
import { AlertCircle, Calculator } from 'lucide-react';

interface ApplicationFeeStepProps {
  data: any;
  onChange: (data: any) => void;
}

export function ApplicationFeeStep({ data, onChange }: ApplicationFeeStepProps) {
  const { calculateFeesWithSupabase, loading, validateParameters } = useFeeCalculation();
  const [calculatedFees, setCalculatedFees] = useState(data.calculatedFees || null);
  const [calculationError, setCalculationError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const hasCalculatedOnce = useRef(false);

  const handleCalculateFees = async () => {
    setCalculationError('');
    setValidationErrors([]);
    
    const activityLevel = data.activity_level || '';
    const activityCategory = data.activity_category || '';
    const activitySubcategory = data.activity_subcategory || '';
    const prescribedActivityId = data.prescribed_activity_id || '';
    
    const params: FeeCalculationParams = {
      activityType: activityCategory || 'new',
      activitySubCategory: activitySubcategory || 'general',
      permitType: activityLevel,
      activityLevel: activityLevel,
      prescribedActivityId: prescribedActivityId,
      projectCost: data.estimated_cost_kina || undefined,
      landArea: data.land_area || undefined,
      durationYears: data.permit_period ? parseInt(data.permit_period) : undefined,
      odsDetails: data.ods_details || undefined,
      wasteDetails: data.waste_contaminant_details || undefined
    };

    const validation = validateParameters(params);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      const fees = await calculateFeesWithSupabase(params);
      
      if (fees) {
        setCalculatedFees(fees);
        hasCalculatedOnce.current = true;
        
        onChange({
          administration_fee: fees.administrationFee,
          technical_fee: fees.technicalFee,
          total_fee: fees.totalFee,
          fee_amount: fees.totalFee,
          processing_days: fees.processingDays,
          administration_form: fees.administrationForm,
          technical_form: fees.technicalForm,
          fee_source: fees.source,
          calculatedFees: fees,
          fee_breakdown: fees
        });
      }
    } catch (error) {
      console.error('Fee calculation error:', error);
      setCalculationError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  // Auto-calculate only once when component mounts with required data
  useEffect(() => {
    const hasRequiredParams = data.activity_level && (data.activity_category || data.activity_subcategory);
    
    if (hasRequiredParams && !hasCalculatedOnce.current && !loading && !data.calculatedFees) {
      console.log('🔔 Auto-calculating fees on mount');
      handleCalculateFees();
    }
  }, []); // Empty dependency array - only run once on mount


  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Fee Calculation</CardTitle>
        <CardDescription>
          Select your activity details to calculate the required fees based on CEPA Administrative Order
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {validationErrors.length > 0 && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive font-medium mb-2">
              <AlertCircle className="w-4 h-4" />
              Missing Required Information
            </div>
            <ul className="text-sm text-destructive space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="activity_level">Activity Level *</Label>
            <div className="px-3 py-2 border border-input bg-sidebar rounded-md text-sm">
              {data.activity_level || 'Not selected'}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity_category">Activity Category *</Label>
            <div className="px-3 py-2 border border-input bg-sidebar rounded-md text-sm">
              {data.activity_category ? data.activity_category.charAt(0).toUpperCase() + data.activity_category.slice(1).replace('_', ' ') : 'Not selected'}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity_subcategory">Activity Subcategory</Label>
            <div className="px-3 py-2 border border-input bg-sidebar rounded-md text-sm">
              {data.activity_subcategory || 'General'}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity_description">Activity Description</Label>
            <div className="px-3 py-2 border border-input bg-sidebar rounded-md text-sm truncate">
              {data.activity_description || 'Not selected'}
            </div>
          </div>
        </div>


        {!calculatedFees && (
          <div className="flex justify-center">
            <Button
              onClick={handleCalculateFees}
              disabled={loading || !data.activity_level}
              className="w-full md:w-auto"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {loading ? 'Calculating...' : 'Calculate Fees'}
            </Button>
          </div>
        )}

        <FeeCalculationCard
          fees={calculatedFees}
          activityType={data.activity_category || 'General'}
          permitType={data.activity_level || ''}
          feeCategory="Based on prescribed activity"
          loading={loading}
          error={calculationError}
        />

        {calculatedFees && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Payment Process:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• CEPA will issue fee notices using the specified forms</li>
              <li>• Administration fee calculated using: (Annual Recurrent Fee ÷ 365) × Processing Days</li>
              <li>• Technical fee is based on the work plan for assessment</li>
              <li>• All fees must be paid before CEPA begins assessment work</li>
              <li>• Fee notices will be signed by the Managing Director and bear CEPA's Common Seal</li>
              <li>• Activity type determines the specific forms and processing requirements</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
