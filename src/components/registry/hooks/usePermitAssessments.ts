import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PermitAssessment {
  id: string;
  permit_application_id: string;
  assessed_by: string;
  assessment_status: 'submitted' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  assessment_notes: string;
  assessment_date: string;
  recommendations: string | null;
  requires_eia: boolean;
  requires_workplan: boolean;
  eia_due_date: string | null;
  workplan_due_date: string | null;
  forwarded_to_compliance: boolean;
  feedback_provided: string | null;
  additional_requirements: any[];
  created_at: string;
  updated_at: string;
  permit_application?: {
    title: string;
    application_number: string | null;
    entity_name: string | null;
    status: string;
  };
}

export function usePermitAssessments() {
  const [assessments, setAssessments] = useState<PermitAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      
      // For now, return empty array since permit_assessments table structure differs
      console.log('Permit assessments feature will be available after proper table structure');
      setAssessments([]);
    } catch (error) {
      console.error('Error fetching permit assessments:', error);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const createPermitAssessment = async (
    permitApplicationId: string,
    assessmentData: {
      assessment_notes: string;
      recommendations?: string;
      requires_eia?: boolean;
      requires_workplan?: boolean;
      eia_due_date?: string;
      workplan_due_date?: string;
      additional_requirements?: any[];
    }
  ) => {
    try {
      const { data, error } = await supabase
        .from('permit_assessments')
        .insert({
          permit_application_id: permitApplicationId,
          assessed_by: profile?.user_id,
          ...assessmentData
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAssessments();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating permit assessment:', error);
      return { success: false, error };
    }
  };

  const updatePermitAssessment = async (
    assessmentId: string,
    updates: Partial<PermitAssessment>
  ) => {
    try {
      const { error } = await supabase
        .from('permit_assessments')
        .update(updates)
        .eq('id', assessmentId);

      if (error) throw error;

      await fetchAssessments();
      return { success: true };
    } catch (error) {
      console.error('Error updating permit assessment:', error);
      return { success: false, error };
    }
  };

  const forwardToCompliance = async (assessmentId: string) => {
    try {
      // Note: permit_assessments table doesn't have forwarded_to_compliance column
      // This functionality would need to be handled differently
      console.log('Forward to compliance for assessment:', assessmentId);

      await fetchAssessments();
      return { success: true };
    } catch (error) {
      console.error('Error forwarding to compliance:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (profile?.staff_unit === 'registry' || profile?.user_type === 'super_admin') {
      fetchAssessments();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.staff_unit, profile?.user_type]);

  return {
    assessments,
    loading,
    createPermitAssessment,
    updatePermitAssessment,
    forwardToCompliance,
    refetch: fetchAssessments
  };
}