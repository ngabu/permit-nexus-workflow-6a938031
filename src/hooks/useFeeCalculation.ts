
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FeeStructure {
  id: string;
  activity_type: string;
  permit_type: string;
  fee_category: string;
  annual_recurrent_fee: number;
  base_processing_days: number;
  work_plan_amount: number;
  administration_form: string;
  technical_form: string;
  category_multiplier: number;
}

export interface CalculatedFees {
  administrationFee: number;
  technicalFee: number;
  totalFee: number;
  processingDays: number;
  administrationForm: string;
  technicalForm: string;
  baseAdministrationFee?: number;
  baseTechnicalFee?: number;
  isEstimated?: boolean;
  source?: 'official' | 'estimated';
}

export interface FeeCalculationParams {
  activityType: string;
  activitySubCategory: string;
  permitType: string;
  activityLevel: string;
  prescribedActivityId?: string; // UUID of the prescribed activity
  projectCost?: number;
  landArea?: number;
  durationYears?: number;
  odsDetails?: { chemicalType: string; quantity: number };
  wasteDetails?: { type: string; quantity: number };
}

export const useFeeCalculation = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_structures')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setFeeStructures(data || []);
    } catch (error) {
      console.error('Error fetching fee structures:', error);
    }
  };

  const validateParameters = (params: FeeCalculationParams): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const requiredFields = ['activityType', 'activitySubCategory', 'activityLevel'];
    
    requiredFields.forEach(field => {
      if (!params[field as keyof FeeCalculationParams]) {
        errors.push(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  const calculateFeesWithSupabase = async (
    params: FeeCalculationParams,
    permitApplicationId?: string
  ): Promise<CalculatedFees | null> => {
    setLoading(true);
    
    try {
      // Validate parameters first
      const validation = validateParameters(params);
      if (!validation.isValid) {
        toast({
          title: "Missing Required Parameters",
          description: validation.errors.join(', '),
          variant: "destructive"
        });
        return null;
      }

      // Use the provided prescribed activity ID, or try to find it based on parameters
      let activityId = params.prescribedActivityId;
      
      if (!activityId) {
        const { data: activityData } = await supabase
          .from('prescribed_activities')
          .select('id, level, fee_category')
          .eq('category_type', params.activityType)
          .eq('sub_category', params.activitySubCategory || 'general')
          .eq('level', params.activityLevel === 'Level 1' ? 1 : params.activityLevel === 'Level 2' ? 2 : 3)
          .limit(1)
          .single();

        activityId = activityData?.id;
      }
      
      if (!activityId) {
        toast({
          title: "Activity Not Found",
          description: "Could not find the prescribed activity. Please select a valid activity.",
          variant: "destructive"
        });
        return null;
      }

      // Call Supabase function - processing days are now handled by the database function
      const { data, error } = await supabase.rpc('calculate_application_fee', {
        p_activity_id: activityId,
        p_permit_type: null,
        p_custom_processing_days: null // Let the database determine based on fee_category
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data === null || data === undefined) {
        toast({
          title: "Fee Calculation Failed",
          description: "No fee structure found for this activity. Please contact support.",
          variant: "destructive"
        });
        return null;
      }

      // Use the database result directly - no client-side multipliers
      const calculatedFee = typeof data === 'number' ? data : 0;

      // Get processing days info for display
      let processingDays = 30; // default
      const activityData = await supabase
        .from('prescribed_activities')
        .select('level, fee_category')
        .eq('id', activityId)
        .single();
      
      if (activityData.data) {
        if (activityData.data.level === 2) {
          processingDays = activityData.data.fee_category === '2.1' ? 30 : 60;
        } else if (activityData.data.level === 3) {
          processingDays = 90;
        }
      }

      const result = {
        administrationFee: Math.round(calculatedFee * 100) / 100,
        technicalFee: 0,
        totalFee: Math.round(calculatedFee * 100) / 100,
        baseAdministrationFee: Math.round(calculatedFee * 100) / 100,
        baseTechnicalFee: 0,
        processingDays,
        administrationForm: 'Form 2',
        technicalForm: 'N/A',
        isEstimated: false,
        source: 'official' as const
      };

      // Log the calculation if permitApplicationId is provided
      if (permitApplicationId) {
        try {
          await supabase.rpc('log_fee_calculation', {
            p_permit_application_id: permitApplicationId,
            p_calculation_method: 'calculate_application_fee',
            p_parameters: params as any,
            p_administration_fee: result.totalFee,
            p_technical_fee: 0,
            p_total_fee: result.totalFee,
            p_is_official: true,
            p_notes: 'Calculated using official 2018 Environment Act Fees formula: (Annual Recurrent Fee ÷ 365) × Processing Days'
          });
        } catch (logError) {
          console.error('Failed to log calculation:', logError);
          // Don't fail the calculation if logging fails
        }
      }

      return result;

    } catch (error) {
      console.error('Error calculating fees with Supabase:', error);
      
      toast({
        title: "Fee Calculation Error",
        description: "Unable to calculate fees. Please ensure all required fields are filled.",
        variant: "destructive"
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Legacy method - now deprecated, use calculateFeesWithSupabase instead
  const calculateFees = (
    activityType: string,
    permitType: string,
    feeCategory: string = 'Green Category'
  ): CalculatedFees | null => {
    console.warn('calculateFees is deprecated. Use calculateFeesWithSupabase instead.');
    return null;
  };

  const getPermitTypes = () => ['Level 1', 'Level 2', 'Level 3'];
  const getFeeCategories = () => ['Red Category', 'Orange Category', 'Green Category'];
  const getActivityTypes = () => ['new', 'amendment', 'transfer', 'amalgamation', 'compliance', 'enforcement', 'renewal', 'surrender'];

  return {
    feeStructures,
    loading,
    calculateFees,
    calculateFeesWithSupabase,
    validateParameters,
    getPermitTypes,
    getFeeCategories,
    getActivityTypes,
  };
};
