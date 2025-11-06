
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
    const requiredFields = ['activityType', 'activitySubCategory', 'permitType', 'activityLevel'];
    
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
          .select('id')
          .eq('category_type', params.activityType)
          .eq('sub_category', params.activitySubCategory || 'general')
          .eq('level', params.activityLevel === 'Level 1' ? 1 : params.activityLevel === 'Level 2A' || params.activityLevel === 'Level 2B' ? 2 : 3)
          .limit(1);

        activityId = activityData?.[0]?.id;
      }
      
      if (!activityId) {
        console.warn('No prescribed activity found, using fallback calculation');
        return calculateFeesFallback(params);
      }

      // Calculate custom processing days based on various factors
      let customProcessingDays = null;
      if (params.durationYears) {
        customProcessingDays = params.durationYears * 30;
      }
      if (params.projectCost && params.projectCost > 1000000) {
        customProcessingDays = (customProcessingDays || 30) + 14; // Extra time for large projects
      }
      if (params.landArea && params.landArea > 5000) {
        customProcessingDays = (customProcessingDays || 30) + 7; // Extra time for large areas
      }

      // Call Supabase function with comprehensive parameters
      const { data, error } = await supabase.rpc('calculate_application_fee', {
        p_activity_id: activityId,
        p_permit_type: params.permitType,
        p_custom_processing_days: customProcessingDays
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data === null || data === undefined) {
        console.warn('No fee structure found in Supabase, attempting fallback');
        return calculateFeesFallback(params);
      }

      // Process Supabase response and apply modifiers based on additional parameters
      let calculatedFee = typeof data === 'number' ? data : 0;
      
      // Apply project cost multipliers
      if (params.projectCost) {
        if (params.projectCost > 5000000) {
          calculatedFee *= 1.5; // 50% increase for major projects
        } else if (params.projectCost > 1000000) {
          calculatedFee *= 1.2; // 20% increase for large projects
        }
      }

      // Apply land area multipliers
      if (params.landArea) {
        if (params.landArea > 10000) {
          calculatedFee *= 1.3; // 30% increase for very large areas
        } else if (params.landArea > 5000) {
          calculatedFee *= 1.15; // 15% increase for large areas
        }
      }

      // Apply ODS-specific fees
      if (params.odsDetails?.quantity) {
        calculatedFee += params.odsDetails.quantity * 100; // $100 per unit of ODS
      }

      // Apply waste-specific fees
      if (params.wasteDetails?.quantity) {
        calculatedFee += params.wasteDetails.quantity * 50; // $50 per unit of waste
      }

      const adminFee = calculatedFee * 0.3; // Admin portion
      const techFee = calculatedFee * 0.7; // Technical portion

      const result = {
        administrationFee: Math.round(adminFee * 100) / 100,
        technicalFee: Math.round(techFee * 100) / 100,
        totalFee: Math.round(calculatedFee * 100) / 100,
        processingDays: customProcessingDays || 30,
        administrationForm: 'Official Administration Form',
        technicalForm: 'Official Technical Form',
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
            p_administration_fee: result.administrationFee,
            p_technical_fee: result.technicalFee,
            p_total_fee: result.totalFee,
            p_is_official: true,
            p_notes: 'Calculated using database function'
          });
        } catch (logError) {
          console.error('Failed to log calculation:', logError);
          // Don't fail the calculation if logging fails
        }
      }

      return result;

    } catch (error) {
      console.error('Error calculating fees with Supabase:', error);
      
      // Show error and attempt fallback
      toast({
        title: "Fee Calculation Error",
        description: "Unable to fetch official fees, using estimated calculation",
        variant: "default"
      });
      
      return calculateFeesFallback(params);
    } finally {
      setLoading(false);
    }
  };

  const calculateFeesFallback = (params: FeeCalculationParams): CalculatedFees | null => {
    // Fallback to client-side calculation using existing logic
    const feeStructure = feeStructures.find(
      (fs) =>
        fs.activity_type.toLowerCase() === params.activityType.toLowerCase() ||
        fs.permit_type.toLowerCase() === params.permitType.toLowerCase()
    );

    if (!feeStructure) {
      // Start with base fees from database function defaults or use minimal base
      let baseAdminFee = 500;  // Minimal base - will be multiplied by activity level
      let baseTechFee = 5000;  // Minimal base - will be multiplied by activity level
      
      // Apply activity level multipliers (primary fee determinant)
      if (params.activityLevel) {
        if (params.activityLevel.includes('Level 3')) {
          baseAdminFee *= 4.0;  // Level 3 = K2,000 admin base
          baseTechFee *= 6.0;   // Level 3 = K30,000 tech base
        } else if (params.activityLevel.includes('Level 2')) {
          baseAdminFee *= 2.5;  // Level 2 = K1,250 admin base
          baseTechFee *= 3.5;   // Level 2 = K17,500 tech base
        } else {
          baseAdminFee *= 1.5;  // Level 1 = K750 admin base
          baseTechFee *= 2.0;   // Level 1 = K10,000 tech base
        }
      }
      
      // Apply permit type multipliers
      if (params.permitType) {
        if (params.permitType.toLowerCase().includes('waste')) {
          baseTechFee *= 1.2; // 20% increase for waste permits
        } else if (params.permitType.toLowerCase().includes('air')) {
          baseTechFee *= 1.3; // 30% increase for air permits
        } else if (params.permitType.toLowerCase().includes('water')) {
          baseTechFee *= 1.1; // 10% increase for water permits
        }
      }
      
      // Apply additional fees only if parameters exist
      if (params.projectCost && params.projectCost > 0) {
        if (params.projectCost > 5000000) {
          baseAdminFee *= 1.8;
          baseTechFee *= 1.6;
        } else if (params.projectCost > 1000000) {
          baseAdminFee *= 1.4;
          baseTechFee *= 1.3;
        } else if (params.projectCost > 100000) {
          baseAdminFee *= 1.2;
          baseTechFee *= 1.15;
        }
      }
      
      if (params.landArea && params.landArea > 0) {
        if (params.landArea > 10000) {
          baseAdminFee *= 1.3;
          baseTechFee *= 1.2;
        } else if (params.landArea > 5000) {
          baseAdminFee *= 1.15;
          baseTechFee *= 1.1;
        }
      }
      
      if (params.durationYears && params.durationYears > 1) {
        baseAdminFee *= (1 + (params.durationYears - 1) * 0.05); // 5% per additional year
      }
      
      // Add specific fees for special parameters
      if (params.odsDetails?.quantity && params.odsDetails.quantity > 0) {
        baseTechFee += params.odsDetails.quantity * 200;
      }
      
      if (params.wasteDetails?.quantity && params.wasteDetails.quantity > 0) {
        baseTechFee += params.wasteDetails.quantity * 150;
      }
      
      const totalCalculated = Math.round((baseAdminFee + baseTechFee) * 100) / 100;
      
      toast({
        title: "Calculated from Application Parameters",
        description: `Based on ${params.activityLevel} and ${params.permitType}: K${totalCalculated.toLocaleString()}`,
        variant: "default"
      });

      return {
        administrationFee: Math.round(baseAdminFee * 100) / 100,
        technicalFee: Math.round(baseTechFee * 100) / 100,
        totalFee: totalCalculated,
        processingDays: 30 + (params.durationYears ? (params.durationYears - 1) * 3 : 0),
        administrationForm: `${params.activityLevel} Administration Form`,
        technicalForm: `${params.permitType} Technical Form`,
        isEstimated: true,
        source: 'estimated'
      };
    }

    // Use found fee structure
    const administrationFee = (feeStructure.annual_recurrent_fee / 365) * feeStructure.base_processing_days;
    const technicalFee = feeStructure.work_plan_amount;
    const totalFee = administrationFee + technicalFee;

    toast({
      title: "Using Estimated Fees", 
      description: "No official fee structure found - using closest match calculations",
      variant: "default"
    });

    return {
      administrationFee: Math.round(administrationFee * 100) / 100,
      technicalFee: technicalFee,
      totalFee: Math.round(totalFee * 100) / 100,
      processingDays: feeStructure.base_processing_days,
      administrationForm: feeStructure.administration_form,
      technicalForm: feeStructure.technical_form,
      isEstimated: true,
      source: 'estimated'
    };
  };

  // Legacy method for backward compatibility
  const calculateFees = (
    activityType: string,
    permitType: string,
    feeCategory: string = 'Green Category'
  ): CalculatedFees | null => {
    const params: FeeCalculationParams = {
      activityType,
      activitySubCategory: 'general',
      permitType,
      activityLevel: permitType
    };
    
    // For legacy calls, use synchronous fallback
    return calculateFeesFallback(params);
  };

  const getPermitTypes = () => ['Level 1', 'Level 2A', 'Level 2B', 'Level 3'];
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
