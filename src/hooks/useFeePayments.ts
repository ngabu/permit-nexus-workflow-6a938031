import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FeePayment {
  id: string;
  permit_application_id: string;
  administration_fee: number;
  technical_fee: number;
  total_fee: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'waived';
  amount_paid: number;
  payment_method?: string;
  payment_reference?: string;
  receipt_number?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export const useFeePayments = (permitApplicationId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: feePayment, isLoading } = useQuery({
    queryKey: ['fee-payment', permitApplicationId],
    queryFn: async () => {
      if (!permitApplicationId) return null;
      
      const { data, error } = await supabase
        .from('fee_payments')
        .select('*')
        .eq('permit_application_id', permitApplicationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as FeePayment | null;
    },
    enabled: !!permitApplicationId
  });

  const createFeePayment = useMutation({
    mutationFn: async (payment: Omit<FeePayment, 'id' | 'created_at' | 'updated_at' | 'amount_paid'>) => {
      const { data, error } = await supabase
        .from('fee_payments')
        .insert({
          ...payment,
          amount_paid: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-payment'] });
      toast({
        title: 'Fee Payment Created',
        description: 'Fee payment record has been created successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateFeePayment = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<FeePayment> 
    }) => {
      const { data, error } = await supabase
        .from('fee_payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-payment'] });
      toast({
        title: 'Payment Updated',
        description: 'Fee payment has been updated successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const validatePrerequisites = async (permitApplicationId: string) => {
    const { data, error } = await supabase.rpc('validate_assessment_prerequisites', {
      p_permit_application_id: permitApplicationId
    });

    if (error) throw error;
    return data;
  };

  const logCalculation = async (params: {
    permit_application_id: string;
    calculation_method: string;
    parameters: Record<string, any>;
    administration_fee: number;
    technical_fee: number;
    total_fee: number;
    is_official?: boolean;
    notes?: string;
  }) => {
    const { data, error } = await supabase.rpc('log_fee_calculation', {
      p_permit_application_id: params.permit_application_id,
      p_calculation_method: params.calculation_method,
      p_parameters: params.parameters,
      p_administration_fee: params.administration_fee,
      p_technical_fee: params.technical_fee,
      p_total_fee: params.total_fee,
      p_is_official: params.is_official || false,
      p_notes: params.notes
    });

    if (error) throw error;
    return data;
  };

  return {
    feePayment,
    isLoading,
    createFeePayment: createFeePayment.mutate,
    updateFeePayment: updateFeePayment.mutate,
    validatePrerequisites,
    logCalculation,
    isCreating: createFeePayment.isPending,
    isUpdating: updateFeePayment.isPending
  };
};