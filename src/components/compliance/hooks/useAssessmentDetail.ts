
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AssessmentDetail {
  id: string;
  permit_application_id: string;
  assessed_by: string;
  assigned_by: string;
  assessment_status: string;
  assessment_notes: string | null;
  compliance_score: number | null;
  recommendations: string | null;
  violations_found: any;
  next_review_date: string | null;
  created_at: string;
  updated_at: string;
  permit_application?: {
    id: string;
    title: string;
    application_number: string | null;
    entity_name: string | null;
    entity_type: string | null;
    status: string;
    activity_classification: string;
    activity_level: string;
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
    activity_id?: string | null;
    estimated_cost_kina?: number | null;
    land_area?: number | null;
    permit_period?: string | null;
    ods_details?: any;
    waste_contaminant_details?: any;
    activity_type?: string;
    fee_amount?: number | null;
    commencement_date?: string | null;
    completion_date?: string | null;
  };
  initial_assessment?: {
    id: string;
    assessment_status: string;
    assessment_notes: string;
    assessment_outcome: string;
    feedback_provided: string | null;
    assessed_by: string;
    created_at: string;
  };
}

export function useAssessmentDetail(assessmentId: string) {
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching assessment:', assessmentId);
      
      // Fetch compliance assessment with related data including all fee calculation parameters
      const { data: assessment, error: assessmentError } = await supabase
        .from('compliance_assessments')
        .select(`
          *,
          permit_applications:permit_application_id (
            id,
            title,
            application_number,
            entity_name,
            entity_type,
            status,
            activity_classification,
            activity_level,
            permit_type,
            description,
            activity_location,
            coordinates,
            environmental_impact,
            mitigation_measures,
            compliance_checks,
            uploaded_files,
            application_date,
            user_id,
            fee_amount,
            estimated_cost_kina,
            permit_period,
            ods_details,
            waste_contaminant_details,
            activity_category,
            commencement_date,
            completion_date,
            activity_id
          )
        `)
        .eq('id', assessmentId)
        .maybeSingle();

      if (assessmentError) {
        console.error('Assessment fetch error:', assessmentError);
        throw assessmentError;
      }

      console.log('Fetched assessment:', assessment);

      // Fetch initial assessment if it exists
      console.log('Fetching initial assessment for permit application:', assessment.permit_application_id);
      
      const { data: initialAssessment, error: initialError } = await supabase
        .from('initial_assessments')
        .select(`
          id,
          permit_application_id,
          assessed_by,
          assessment_status,
          assessment_notes,
          assessment_date,
          assessment_outcome,
          feedback_provided,
          permit_activity_type,
          created_at,
          updated_at
        `)
        .eq('permit_application_id', assessment.permit_application_id)
        .maybeSingle();

      console.log('Initial assessment query result:', { initialAssessment, initialError });

      if (initialError) {
        console.error('Initial assessment fetch error:', initialError);
        console.error('Error details:', {
          code: initialError.code,
          message: initialError.message,
          details: initialError.details,
          hint: initialError.hint
        });
      } else {
        console.log('Initial assessment fetched:', initialAssessment);
      }

      const fullAssessmentData = {
        ...assessment,
        permit_application: assessment.permit_applications,
        initial_assessment: initialAssessment
      };

      console.log('Full assessment data with fee parameters:', fullAssessmentData);
      setAssessment(fullAssessmentData);

    } catch (error: any) {
      console.error('Error fetching assessment:', error);
      setError(error.message || 'Failed to fetch assessment');
    } finally {
      setLoading(false);
    }
  };

  const updateAssessment = async (updates: Partial<AssessmentDetail>) => {
    try {
      const { error } = await supabase
        .from('compliance_assessments')
        .update({
          ...updates,
          assessed_by: profile?.user_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId);

      if (error) throw error;

      // Refresh the assessment data
      await fetchAssessment();
      return { success: true };
    } catch (error: any) {
      console.error('Error updating assessment:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    if (assessmentId && profile?.user_id) {
      fetchAssessment();
    }
  }, [assessmentId, profile?.user_id]);

  return {
    assessment,
    loading,
    error,
    updateAssessment,
    refetch: fetchAssessment
  };
}
