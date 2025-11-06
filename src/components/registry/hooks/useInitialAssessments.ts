import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface InitialAssessment {
  id: string;
  permit_application_id: string;
  assessed_by: string;
  assessment_status: 'pending' | 'passed' | 'failed' | 'requires_clarification';
  assessment_notes: string;
  assessment_date: string;
  assessment_outcome: string;
  feedback_provided: string | null;
  permit_activity_type: string;
  created_at: string;
  updated_at: string;
  permit_application?: {
    id: string;
    title: string;
    application_number: string | null;
    entity_name: string | null;
    entity_type: string | null;
    status: string;
    permit_type: string;
    description: string | null;
    activity_location: string | null;
    coordinates: any;
    environmental_impact: string | null;
    mitigation_measures: string | null;
    compliance_checks: any;
    uploaded_files: any;
    application_date: string;
    user_id: string;
  };
}

export function useInitialAssessments() {
  const [assessments, setAssessments] = useState<InitialAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      
      // Optimize query by selecting only essential fields and adding proper ordering
      let query = supabase
        .from('initial_assessments')
        .select(`
          id,
          permit_application_id,
          assessed_by,
          assessment_status,
          assessment_notes,
          assessment_date,
          assessment_outcome,
          permit_activity_type,
          created_at,
          updated_at,
          permit_applications:permit_application_id (
            id,
            title,
            application_number,
            entity_name,
            entity_type,
            status,
            permit_type,
            activity_location,
            application_date,
            user_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100); // Limit initial load for performance

      // Filter based on user role
      if (profile?.staff_position === 'officer') {
        query = query.eq('assessed_by', profile.user_id).neq('assessed_by', '00000000-0000-0000-0000-000000000000');
      }

      const { data: assessmentData, error: assessmentError } = await query;

      if (assessmentError) throw assessmentError;

      // Optimize data transformation with single pass
      const transformedData = (assessmentData || []).map((assessment: any) => ({
        ...assessment,
        permit_application: assessment.permit_applications,
        assessment_status: assessment.assessment_status as 'pending' | 'passed' | 'failed' | 'requires_clarification'
      }));
      
      setAssessments(transformedData);
    } catch (error) {
      console.error('Error fetching initial assessments:', error);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const createInitialAssessment = async (
    permitId: string, 
    assessmentData: {
      assessment_notes: string;
      assessment_status: 'passed' | 'failed' | 'requires_clarification';
      assessment_outcome: string;
      feedback_provided?: string;
    }
  ) => {
    try {
      const { data, error } = await supabase
        .from('initial_assessments')
        .insert({
          permit_application_id: permitId,
          assessed_by: profile?.user_id,
          ...assessmentData
        })
        .select()
        .single();

      if (error) throw error;

      // The database trigger will handle:
      // - Updating permit application status to 'under_technical_review' 
      // - Creating compliance assessment entry
      // - Creating manager notification
      // when assessment_status = 'passed' and assessment_outcome = 'Approved for Next Stage'

      await fetchAssessments();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating initial assessment:', error);
      return { success: false, error };
    }
  };

  const updateInitialAssessment = async (
    assessmentId: string,
    updates: Partial<InitialAssessment>
  ) => {
    try {
      const { error } = await supabase
        .from('initial_assessments')
        .update(updates)
        .eq('id', assessmentId);

      if (error) throw error;

      await fetchAssessments();
      return { success: true };
    } catch (error) {
      console.error('Error updating initial assessment:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (profile?.staff_unit === 'registry' || profile?.user_type === 'super_admin') {
      fetchAssessments();
    } else {
      setLoading(false);
    }
  }, [profile?.staff_unit, profile?.user_type]);

  return {
    assessments,
    loading,
    createInitialAssessment,
    updateInitialAssessment,
    refetch: fetchAssessments
  };
}