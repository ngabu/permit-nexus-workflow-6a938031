import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ComplianceAssessment {
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
    title: string;
    application_number: string | null;
    entity_name: string | null;
    entity_type: string | null;
    status: string;
    activity_classification: string;
    activity_level: string;
    permit_type: string;
  };
  assessor?: {
    full_name: string;
    email: string;
  } | null;
  assigner?: {
    full_name: string;
    email: string;
  } | null;
}

export function useComplianceAssessments() {
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      console.log('Fetching compliance assessments for user:', profile?.user_id, 'unit:', profile?.staff_unit);
      console.log('Current auth user ID:', (await supabase.auth.getUser()).data.user?.id);
      
      // First, let's try a simple count query to test RLS
      const { count, error: countError } = await supabase
        .from('compliance_assessments')
        .select('*', { count: 'exact', head: true });
      
      console.log('Count query result:', count, 'error:', countError);
      
      // Try the main query
      const { data: assessmentData, error } = await supabase
        .from('compliance_assessments')
        .select(`
          id,
          permit_application_id,
          assessed_by,
          assigned_by,
          assessment_status,
          assessment_notes,
          compliance_score,
          recommendations,
          violations_found,
          next_review_date,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch permit applications separately due to RLS restrictions
      const permitApplicationIds = assessmentData?.map(a => a.permit_application_id) || [];
      let permitApplicationsData: any[] = [];
      
      if (permitApplicationIds.length > 0) {
        const { data: applications, error: applicationsError } = await supabase
          .from('permit_applications')
          .select(`
            id,
            title,
            application_number,
            entity_name,
            entity_type,
            status,
            activity_classification,
            activity_level,
            permit_type
          `)
          .in('id', permitApplicationIds);
        
        if (!applicationsError) {
          permitApplicationsData = applications || [];
        }
      }

      console.log('Assessment data returned:', assessmentData);
      console.log('Permit applications data:', permitApplicationsData);
      console.log('Number of assessment records:', assessmentData?.length || 0);

      // Transform data by matching assessments with their applications
      const transformedData = (assessmentData || []).map((item: any) => {
        const matchingApplication = permitApplicationsData.find(app => app.id === item.permit_application_id);
        return {
          ...item,
          permit_application: matchingApplication || null,
          assessor: null,
          assigner: null
        };
      });

      setAssessments(transformedData);
      console.log('Transformed assessments:', transformedData);
    } catch (error) {
      console.error('Error fetching compliance assessments:', error);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateAssessment = async (
    assessmentId: string, 
    updates: Partial<ComplianceAssessment>
  ) => {
    try {
      const { error } = await supabase
        .from('compliance_assessments')
        .update(updates)
        .eq('id', assessmentId);

      if (error) throw error;

      await fetchAssessments();
      return { success: true };
    } catch (error) {
      console.error('Error updating compliance assessment:', error);
      return { success: false, error };
    }
  };

  const assignAssessment = async (
    assessmentId: string,
    officerId: string,
    assignmentNotes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('compliance_assessments')
        .update({
          assessed_by: officerId,
          assessment_status: 'in_progress',
          assessment_notes: assignmentNotes || 'Assigned for technical assessment'
        })
        .eq('id', assessmentId);

      if (error) throw error;

      await fetchAssessments();
      return { success: true };
    } catch (error) {
      console.error('Error assigning assessment:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    console.log('Profile in compliance hook:', profile);
    if (profile?.user_id && (profile?.staff_unit === 'compliance' || profile?.user_type === 'super_admin')) {
      console.log('User has compliance access, fetching assessments...');
      fetchAssessments();
    } else {
      console.log('User does not have compliance access');
      setLoading(false);
    }
  }, [profile?.user_id, profile?.staff_unit, profile?.user_type]);

  return { 
    assessments, 
    loading, 
    refetch: fetchAssessments, 
    updateAssessment,
    assignAssessment
  };
}