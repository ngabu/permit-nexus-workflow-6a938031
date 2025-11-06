
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PermitApplicationDetails {
  id?: string;
  permit_id: string;
  user_id: string;
  
  // Basic Info fields
  title?: string;
  entity_id?: string;
  entity_type?: string;
  
  // Step 2: Details of Application
  legal_description?: string;
  land_type?: string;
  owner_name?: string;
  tenure?: string;
  existing_permits_details?: string;
  government_agreements_details?: string;
  consulted_departments?: string;
  required_approvals?: string;
  landowner_negotiation_status?: string;
  
  // Step 3: Details of the Activity
  proposed_works_description?: string;
  activity_location?: string;
  estimated_cost_kina?: number;
  commencement_date?: string;
  completion_date?: string;
  activity_classification?: string;
  activity_category?: string;
  activity_subcategory?: string;
  
  // Step 4: Permit Period
  permit_period?: string;
  
  // Step 5: Application Fee
  application_fee?: number;
  
  // Progress tracking
  current_step?: number;
  is_draft?: boolean;
  completed_steps?: number[];
}

export interface PermitInfo {
  id: string;
  title: string;
  permit_type: string;
  status: string;
  created_at: string;
}

export function usePermitApplicationDetails(permitId: string) {
  const [details, setDetails] = useState<PermitApplicationDetails | null>(null);
  const [permitInfo, setPermitInfo] = useState<PermitInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (permitId) {
      loadDetails();
    }
  }, [permitId]);

  const loadDetails = async () => {
    try {
      // Load permit info
      const { data: permitData, error: permitError } = await (supabase as any)
        .from('permit_applications')
        .select('id, title, permit_type, status, created_at')
        .eq('id', permitId)
        .single();

      if (permitError) throw permitError;
      setPermitInfo(permitData);

      // Load application details
      const { data, error } = await (supabase as any)
        .from('permit_applications')
        .select('*')
        .eq('id', permitId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Parse completed_steps from JSON to number array
        const parsedData = {
          ...data,
          completed_steps: Array.isArray(data.completed_steps) 
            ? data.completed_steps as number[]
            : []
        };
        setDetails(parsedData);
      } else {
        setDetails(null);
      }
    } catch (error) {
      console.error('Error loading permit details:', error);
      toast({
        title: "Error",
        description: "Failed to load application details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDetails = async (updatedDetails: Partial<PermitApplicationDetails>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const dataToSave = {
        ...updatedDetails,
        id: permitId,
        updated_at: new Date().toISOString()
      };

      // Always update since the permit application already exists
      const result = await (supabase as any)
        .from('permit_applications')
        .update(dataToSave)
        .eq('id', permitId)
        .select()
        .single();

      if (result.error) throw result.error;

      // Parse completed_steps from JSON to number array
      const parsedResult = {
        ...result.data,
        completed_steps: Array.isArray(result.data.completed_steps) 
          ? result.data.completed_steps as number[]
          : []
      };
      
      setDetails(parsedResult);
      toast({
        title: "Success",
        description: "Application details saved successfully"
      });

      return parsedResult;
    } catch (error) {
      console.error('Error saving permit details:', error);
      toast({
        title: "Error",
        description: "Failed to save application details",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    details,
    permitInfo,
    loading,
    saveDetails,
    refreshDetails: loadDetails
  };
}
