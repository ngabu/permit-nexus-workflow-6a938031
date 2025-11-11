
import { FeeCalculationCard } from '@/components/fee-calculation/FeeCalculationCard';
import { useFeeCalculation, FeeCalculationParams } from '@/hooks/useFeeCalculation';
import { useEffect, useState, useRef } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
      prescribedActivityId: prescribedActivityId
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
          administration_fee: fees.totalFee,
          technical_fee: 0,
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



  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  return (
    <div className="space-y-6">
      <FeeCalculationCard
          fees={calculatedFees}
          activityType={data.activity_category || 'General'}
          permitType={data.activity_level || ''}
          feeCategory="Based on prescribed activity"
          loading={loading}
          error={calculationError}
        />

        {calculatedFees && (
          <>
            <Collapsible open={isBreakdownOpen} onOpenChange={setIsBreakdownOpen}>
              <div className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 bg-muted/50 hover:bg-muted transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">Fee Calculation Details</h4>
                    <Badge variant="outline">Official calculation</Badge>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isBreakdownOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="p-4 space-y-4 bg-background">
                    <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <span className="font-bold text-foreground">Application Fee</span>
                      <span className="font-bold text-lg text-primary">
                        PGK {calculatedFees?.totalFee?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0.00'}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/20 rounded">
                      <p>• Calculation formula: (Annual Recurrent Fee ÷ 365) × Processing Days</p>
                      <p>• Processing days: {calculatedFees?.processingDays || 'N/A'} days</p>
                      <p>• Based on official 2018 Environment Act Fees</p>
                      <p>• Level 2.1: 30 days | Level 2.2/2.3/2.4: 60 days | Level 3: 90 days</p>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Payment Process:</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• CEPA will issue fee notices using the specified forms</li>
                <li>• Fees calculated using official formula: (Annual Recurrent Fee ÷ 365) × Processing Days</li>
                <li>• All fees must be paid before CEPA begins assessment work</li>
                <li>• Fee notices will be signed by the Managing Director and bear CEPA's Common Seal</li>
              </ul>
            </div>
          </>
        )}
    </div>
  );
}
